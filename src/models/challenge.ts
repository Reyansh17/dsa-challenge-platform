import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const challengeSchema = new mongoose.Schema({
  leetcodeLink: {
    type: String,
    required: true,
    unique: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  submissions: [submissionSchema]
});

// Add virtual for isCompleted
challengeSchema.virtual('isCompleted').get(function() {
  return this.submissions && this.submissions.length > 0;
});

const Challenge = mongoose.models.Challenge || mongoose.model('Challenge', challengeSchema);

export default Challenge; 