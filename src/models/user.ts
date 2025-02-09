import mongoose from 'mongoose';

// Available avatar styles for random selection
const AVATAR_STYLES = [
  'adventurer',
  'adventurer-neutral',
  'avataaars',
  'big-ears',
  'big-ears-neutral',
  'big-smile',
  'bottts',
  'croodles',
  'fun-emoji',
  'icons',
  'lorelei',
  'micah',
  'miniavs',
  'personas',
  'pixel-art'
];

// Function to get random avatar style
function getRandomAvatarStyle() {
  return AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
}

// Check if the model is already defined to prevent recompilation
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  totalProblemsSolved: {
    type: Number,
    default: 0
  },
  easySolved: {
    type: Number,
    default: 0
  },
  mediumSolved: {
    type: Number,
    default: 0
  },
  hardSolved: {
    type: Number,
    default: 0
  },
  avatarStyle: {
    type: String,
    enum: ['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei', 'micah'],
    default: 'bottts'
  },
  avatar: {
    type: String
  },
  isEligibleForAdmin: {
    type: Boolean,
    default: false
  }
});

// Drop all indexes and recreate only the email index
const dropIndexes = async () => {
  try {
    if (mongoose.connection.readyState === 1) { // If connected
      await mongoose.connection.collections['users']?.dropIndexes();
    }
  } catch (error) {
    console.log('No indexes to drop or collection does not exist');
  }
};

dropIndexes();

// Add only the email index
userSchema.index({ email: 1 });

// Clean up any existing model to prevent duplicate model error
mongoose.models = {};

const User = mongoose.model('User', userSchema);

export default User;