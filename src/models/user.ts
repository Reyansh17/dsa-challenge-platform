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
  points: {
    type: Number,
    default: 0,
    required: true
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
  },
  streak: {
    __v: {
      type: Number,
      default: 0
    },
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    }
  }
});

// Add a pre-save hook to ensure points exist
userSchema.pre('save', function(next) {
  if (this.points === undefined) {
    this.points = 0;
  }
  next();
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

// Clean up existing models
Object.keys(mongoose.models).forEach(key => {
  delete mongoose.models[key];
});

const User = mongoose.model('User', userSchema);

export default User;