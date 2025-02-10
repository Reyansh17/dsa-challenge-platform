import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/utils/db';
import Challenge from '@/models/challenge';
import User from '@/models/user';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { challengeId, code } = await req.json();

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update or create submission
    const submissionIndex = challenge.submissions.findIndex(
      (s: any) => s.user.toString() === user._id.toString()
    );

    const submission = {
      user: user._id,
      code,
      submittedAt: new Date()
    };

    if (submissionIndex > -1) {
      challenge.submissions[submissionIndex] = submission;
    } else {
      challenge.submissions.push(submission);
    }

    await challenge.save();

    return NextResponse.json({
      success: true,
      message: 'Submission saved successfully'
    });
  } catch (error) {
    console.error('Error submitting challenge:', error);
    return NextResponse.json(
      { error: 'Failed to submit challenge' },
      { status: 500 }
    );
  }
} 