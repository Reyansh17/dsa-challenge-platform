import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { challengeId, difficulty } = body;

    const client = await MongoClient.connect(process.env.MONGO_URI || '');
    const db = client.db();

    // First, check if user has already submitted this challenge
    const existingSubmission = await db.collection('submissions').findOne({
      userId: session.user.email,
      challengeId
    });

    if (existingSubmission) {
      await client.close();
      return NextResponse.json({ 
        success: false,
        message: 'Already submitted this challenge'
      });
    }

    // Update user's problem counts
    const updateResult = await db.collection('users').findOneAndUpdate(
      { email: session.user.email },
      {
        $inc: {
          [`${difficulty.toLowerCase()}Solved`]: 1,
          totalProblemsSolved: 1
        }
      },
      { returnDocument: 'after' }
    );

    // Add submission record
    await db.collection('submissions').insertOne({
      userId: session.user.email,
      challengeId,
      difficulty,
      submittedAt: new Date()
    });

    await client.close();

    return NextResponse.json({ 
      success: true,
      message: 'Submission recorded',
      totalSolved: updateResult?.value?.totalProblemsSolved || 0
    });

  } catch (error) {
    console.error('Error recording submission:', error);
    return NextResponse.json(
      { message: 'Failed to record submission' },
      { status: 500 }
    );
  }
} 