import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/utils/db';
import Challenge from '@/models/challenge';
import { authOptions } from '@/config/auth';
import { ADMIN_CREDENTIALS } from '@/config/admin';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const challenges = await Challenge.find()
      .populate('submissions.userId', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== ADMIN_CREDENTIALS.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { leetcodeLink, difficulty } = await req.json();

    const challenge = await Challenge.create({
      leetcodeLink,
      difficulty
    });

    return NextResponse.json({
      success: true,
      challenge
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    );
  }
} 