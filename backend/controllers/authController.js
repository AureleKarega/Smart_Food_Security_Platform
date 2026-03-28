const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');
const { sequelize } = require('../config/db');
const { sendPasswordResetEmail } = require('../utils/sendPasswordResetEmail');
const { getConfiguredAdminSignupCode } = require('../utils/adminSignupEnv');

// Vercel/production often omits JWT_EXPIRES_IN; jsonwebtoken rejects undefined expiresIn.
const jwtExpiresIn = () => {
  const v = process.env.JWT_EXPIRES_IN;
  return v != null && String(v).trim() !== '' ? String(v).trim() : '7d';
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: jwtExpiresIn()
  });
};

const hashResetToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const RESET_TTL_MS = 60 * 60 * 1000;

function frontendBaseUrl() {
  const explicit = process.env.FRONTEND_URL;
  if (explicit && String(explicit).trim()) return String(explicit).replace(/\/$/, '');
  const cors = process.env.CORS_ORIGIN;
  if (cors) {
    const first = cors.split(',')[0].trim();
    if (first) return first.replace(/\/$/, '');
  }
  return 'http://localhost:4200';
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, studentId, accountType, adminSignupCode } = req.body;

    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { studentId }] }
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or student ID already exists' });
    }

    let role = 'student';
    if (accountType === 'administrator') {
      const expectedCode = getConfiguredAdminSignupCode();
      if (!expectedCode) {
        return res.status(503).json({
          message:
            'Administrator registration is disabled: set ADMIN_SIGNUP_CODE on the backend project (Vercel → backend → Settings → Environment Variables), enable it for Production, save, then redeploy. Tip: open GET /api/health and confirm checks.adminSignupCodeConfigured is true.'
        });
      }

      const submitted = adminSignupCode != null ? String(adminSignupCode).trim() : '';
      if (!submitted || submitted !== expectedCode) {
        return res.status(403).json({ message: 'Invalid admin sign-up code' });
      }

      role = 'admin';
    }

    const user = await User.create({ name, email, password, studentId, role });
    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        impactPoints: user.impactPoints,
        mealsShared: user.mealsShared,
        mealsReceived: user.mealsReceived,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        impactPoints: user.impactPoints,
        mealsShared: user.mealsShared,
        mealsReceived: user.mealsReceived,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    await User.update({ name, bio, avatar }, { where: { id: req.user.id } });
    const user = await User.findByPk(req.user.id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const genericMessage =
    'If an account exists for that email, you will receive password reset instructions shortly.';

  try {
    const email = (req.body?.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('email')),
        Op.eq,
        email
      )
    });
    if (!user) {
      return res.json({ message: genericMessage });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);

    await user.update({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: expiresAt
    });

    const resetUrl = `${frontendBaseUrl()}/reset-password?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(email)}`;
    const mailResult = await sendPasswordResetEmail(user.email, resetUrl);
    if (!mailResult.sent) {
      console.error(
        '[forgot-password] Email not delivered (%s). Check RESEND_API_KEY or SMTP_* on the server.',
        mailResult.provider
      );
    }

    return res.json({ message: genericMessage });
  } catch (error) {
    console.error('[forgot-password]', error.message);
    return res.status(500).json({ message: 'Could not process reset request. Try again later.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const email = (req.body?.email || '').trim().toLowerCase();
    const token = (req.body?.token || '').trim();
    const password = req.body?.password;

    if (!email || !token) {
      return res.status(400).json({ message: 'Email and reset token are required' });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('email')),
        Op.eq,
        email
      )
    });
    if (
      !user ||
      !user.passwordResetTokenHash ||
      !user.passwordResetExpires ||
      user.passwordResetTokenHash !== hashResetToken(token) ||
      new Date(user.passwordResetExpires) < new Date()
    ) {
      return res.status(400).json({
        message: 'Invalid or expired reset link. Please request a new password reset.'
      });
    }

    user.password = password;
    user.passwordResetTokenHash = null;
    user.passwordResetExpires = null;
    await user.save();

    return res.json({ message: 'Your password has been reset. You can log in now.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
