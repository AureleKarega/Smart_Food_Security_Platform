const dotenv = require('dotenv');
dotenv.config();

const { connectDB, sequelize } = require('./config/db');
const { User, FoodListing, CommunityPost, Comment } = require('./models');

const seed = async () => {
  await connectDB();
  await sequelize.sync({ alter: true });

  // Create users
  const users = await User.bulkCreate([
    { name: 'Aurele Karega', email: 'aurele@alustudent.com', password: 'password123', studentId: 'ALU2024001', bio: 'Passionate about food sustainability and climate action.', impactPoints: 45, mealsShared: 5, mealsReceived: 2 },
    { name: 'Amina Diallo', email: 'amina@alustudent.com', password: 'password123', studentId: 'ALU2024002', bio: 'Environmental science student. Zero waste advocate.', impactPoints: 30, mealsShared: 3, mealsReceived: 1 },
    { name: 'David Okonkwo', email: 'david@alustudent.com', password: 'password123', studentId: 'ALU2024003', bio: 'Love cooking Nigerian dishes and sharing with friends.', impactPoints: 60, mealsShared: 7, mealsReceived: 3 },
    { name: 'Fatima Nkosi', email: 'fatima@alustudent.com', password: 'password123', studentId: 'ALU2024004', bio: 'CS student who believes tech can solve food insecurity.', impactPoints: 25, mealsShared: 2, mealsReceived: 4 },
    { name: 'Jean-Pierre Habimana', email: 'jp@alustudent.com', password: 'password123', studentId: 'ALU2024005', bio: 'Rwandan cuisine enthusiast. SDG champion.', impactPoints: 55, mealsShared: 6, mealsReceived: 2 },
  ], { individualHooks: true });

  console.log(`Created ${users.length} users`);

  // Create food listings
  const now = new Date();
  const in3hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const in6hours = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const in12hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  const in24hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const listings = await FoodListing.bulkCreate([
    { title: 'Jollof Rice with Chicken', description: 'Made extra jollof rice for a study group session. Enough for 4 people. Well seasoned with tomatoes, peppers, and spices.', category: 'cooked-meal', quantity: '4 plates', servings: 4, dietaryInfo: ['halal'], allergens: '', expiresAt: in6hours, pickupLocation: 'ALU Main Campus, Kitchen Area', pickupInstructions: 'Come to the ground floor kitchen. Will be in a covered pot.', status: 'available', donorId: users[2].id, co2Saved: 1.64 },
    { title: 'Fresh Fruit Basket', description: 'Bought too many mangoes, bananas, and oranges from the market. All fresh and ripe!', category: 'fruits-vegetables', quantity: '1 basket (about 2kg)', servings: 5, dietaryInfo: ['vegan', 'gluten-free'], allergens: '', expiresAt: in24hours, pickupLocation: 'ALU Dorm Building B, Room 205', pickupInstructions: 'Text me when you arrive. Will bring it down.', status: 'available', donorId: users[1].id, co2Saved: 2.05 },
    { title: 'Homemade Chapati & Bean Stew', description: 'Cooked a big batch of chapati with kidney bean stew. Very filling and nutritious!', category: 'cooked-meal', quantity: '6 servings', servings: 6, dietaryInfo: ['vegetarian', 'vegan'], allergens: '', expiresAt: in3hours, pickupLocation: 'ALU Student Center', pickupInstructions: 'Available at the common area table near the entrance.', status: 'available', donorId: users[4].id, co2Saved: 2.46 },
    { title: 'Leftover Pizza Slices', description: 'Had a pizza party for a project celebration. 8 slices of pepperoni and margherita left.', category: 'snacks', quantity: '8 slices', servings: 4, dietaryInfo: [], allergens: 'Contains dairy, gluten', expiresAt: in3hours, pickupLocation: 'ALU Innovation Lab', pickupInstructions: 'In the fridge, labeled "Free Food".', status: 'available', donorId: users[0].id, co2Saved: 1.64 },
    { title: 'Assorted Tea & Biscuits', description: 'Received a care package with way too much tea and biscuits. Sharing the love!', category: 'beverages', quantity: '10 tea bags + 2 packs biscuits', servings: 10, dietaryInfo: ['vegetarian'], allergens: 'Contains wheat, may contain nuts', expiresAt: in24hours, pickupLocation: 'ALU Library, 2nd Floor', pickupInstructions: 'On the shared shelf near the study pods.', status: 'available', donorId: users[3].id, co2Saved: 4.10 },
    { title: 'Rice & Beans Combo', description: 'Made too much lunch. Traditional rice and beans with plantain on the side.', category: 'cooked-meal', quantity: '3 portions', servings: 3, dietaryInfo: ['vegan', 'gluten-free'], allergens: '', expiresAt: in6hours, pickupLocation: 'ALU Cafeteria', pickupInstructions: 'Ask for David at the counter area.', status: 'claimed', donorId: users[2].id, claimedById: users[3].id, co2Saved: 1.23 },
    { title: 'Homemade Banana Bread', description: 'Baked 2 loaves of banana bread. One is for sharing! Moist and delicious.', category: 'baked-goods', quantity: '1 loaf (8 slices)', servings: 8, dietaryInfo: ['vegetarian'], allergens: 'Contains eggs, wheat, dairy', expiresAt: in12hours, pickupLocation: 'ALU Dorm Building A, Common Room', pickupInstructions: 'Wrapped in foil on the counter.', status: 'claimed', donorId: users[1].id, claimedById: users[0].id, co2Saved: 3.28 },
    { title: 'Vegetable Stir Fry', description: 'Fresh stir-fried vegetables with tofu. Made with broccoli, carrots, bell peppers, and soy sauce.', category: 'cooked-meal', quantity: '2 large portions', servings: 2, dietaryInfo: ['vegan', 'dairy-free'], allergens: 'Contains soy', expiresAt: in6hours, pickupLocation: 'ALU Main Campus, Room 102', pickupInstructions: 'Knock on the door or call me.', status: 'available', donorId: users[4].id, co2Saved: 0.82 },
  ]);

  console.log(`Created ${listings.length} food listings`);

  // Create community posts
  const posts = await CommunityPost.bulkCreate([
    { authorId: users[0].id, content: 'Just shared my first meal on FoodShare! It feels amazing to know that food I would have wasted is going to a fellow student instead. Let\'s keep this going!', type: 'story', likes: [users[1].id, users[2].id, users[4].id] },
    { authorId: users[1].id, content: 'Tip: If you\'re cooking for one, try meal prepping on Sundays. Cook in bulk, eat what you need, and share the rest on FoodShare. Saves money AND reduces waste!', type: 'tip', likes: [users[0].id, users[3].id, users[4].id, users[2].id] },
    { authorId: users[4].id, content: 'Did you know? Food waste in landfills produces methane, which is 25x more potent than CO2 as a greenhouse gas. Every meal we share here directly fights climate change.', type: 'tip', likes: [users[0].id, users[1].id] },
    { authorId: users[2].id, content: 'Organizing a community cooking event this Saturday at the ALU kitchen! Bring your leftover ingredients and we\'ll make a feast together. All are welcome!', type: 'event', likes: [users[0].id, users[1].id, users[3].id, users[4].id] },
    { authorId: users[3].id, content: 'As a student on a tight budget, FoodShare has been a lifesaver. Thank you to everyone who shares. This platform proves that community and technology can solve real problems.', type: 'story', likes: [users[0].id, users[2].id, users[4].id] },
    { authorId: users[1].id, content: 'What sustainable food habits have you adopted since joining ALU? I\'ve started composting my food scraps and buying from local markets. Would love to hear your ideas!', type: 'discussion', likes: [users[3].id] },
  ]);

  console.log(`Created ${posts.length} community posts`);

  // Create comments
  const comments = await Comment.bulkCreate([
    { postId: posts[0].id, authorId: users[1].id, content: 'That\'s awesome Aurele! Welcome to the community!' },
    { postId: posts[0].id, authorId: users[4].id, content: 'Every meal shared counts. Great job!' },
    { postId: posts[1].id, authorId: users[0].id, content: 'This is exactly what I started doing. Sunday meal prep + FoodShare = zero waste week!' },
    { postId: posts[1].id, authorId: users[3].id, content: 'Great tip! I\'ll try this starting next week.' },
    { postId: posts[2].id, authorId: users[2].id, content: 'Wow, 25x more potent! That really puts things in perspective.' },
    { postId: posts[3].id, authorId: users[0].id, content: 'Count me in! I\'ll bring some leftover vegetables from the market.' },
    { postId: posts[3].id, authorId: users[3].id, content: 'This sounds amazing! What time should we be there?' },
    { postId: posts[3].id, authorId: users[1].id, content: 'I can bring spices and rice. Let\'s make it happen!' },
    { postId: posts[4].id, authorId: users[2].id, content: 'We\'re all in this together. Glad the platform is helping!' },
    { postId: posts[5].id, authorId: users[4].id, content: 'I\'ve started growing herbs on my windowsill. Fresh basil and mint for free!' },
    { postId: posts[5].id, authorId: users[0].id, content: 'Buying from local markets is great. I also try to buy ugly produce since it\'s cheaper and would otherwise go to waste.' },
  ]);

  console.log(`Created ${comments.length} comments`);
  console.log('\nSeed completed successfully!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
