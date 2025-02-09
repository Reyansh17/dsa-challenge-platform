import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/utils/db';
import Challenge from '@/models/challenge';
import User from '@/models/user';

interface Submission {
  user: { toString: () => string };
  completed: boolean;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { challengeId, completed } = await req.json();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Update or create submission
    const submissionIndex = challenge.submissions.findIndex(
      (s: Submission) => s.user.toString() === user._id.toString()
    );

    if (submissionIndex > -1) {
      challenge.submissions[submissionIndex].completed = completed;
    } else {
      challenge.submissions.push({
        user: user._id,
        completed
      });
    }

    // Update user stats if completed
    if (completed) {
      user.totalProblemsSolved += 1;
      switch (challenge.difficulty) {
        case 'Easy':
          user.easySolved += 1;
          break;
        case 'Medium':
          user.mediumSolved += 1;
          break;
        case 'Hard':
          user.hardSolved += 1;
          break;
      }
      await user.save();
    }

    await challenge.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting challenge:', error);
    return NextResponse.json(
      { error: 'Failed to submit challenge' },
      { status: 500 }
    );
  }
} 