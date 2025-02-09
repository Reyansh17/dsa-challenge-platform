import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/utils/db';
import Challenge from '@/models/challenge';
import User from '@/models/user';
import { authOptions } from '@/config/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { challengeId } = await req.json();

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update challenge with submission
    const challenge = await Challenge.findByIdAndUpdate(
      challengeId,
      {
        $addToSet: {
          submissions: {
            userId: user._id,
            submittedAt: new Date()
          }
        }
      },
      { new: true }
    ).populate('submissions.userId', 'name email avatar');

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Update user stats
    await User.findByIdAndUpdate(
      user._id,
      {
        $inc: {
          totalProblemsSolved: 1,
          [`${challenge.difficulty.toLowerCase()}Solved`]: 1
        }
      }
    );

    return NextResponse.json({
      success: true,
      challenge
    });
  } catch (error) {
    console.error('Error completing challenge:', error);
    return NextResponse.json(
      { error: 'Failed to complete challenge' },
      { status: 500 }
    );
  }
} 