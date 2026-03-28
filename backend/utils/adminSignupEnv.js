/**
 * Reads admin registration secret from env (trimmed). Supports ADMIN_REGISTRATION_CODE as alias.
 */
function getConfiguredAdminSignupCode() {
  const raw =
    process.env.ADMIN_SIGNUP_CODE ||
    process.env.ADMIN_REGISTRATION_CODE ||
    '';
  const v = String(raw).replace(/^\uFEFF/, '').trim();
  return v.length > 0 ? v : null;
}

function isAdminSignupCodeConfigured() {
  return getConfiguredAdminSignupCode() !== null;
}

module.exports = { getConfiguredAdminSignupCode, isAdminSignupCodeConfigured };
