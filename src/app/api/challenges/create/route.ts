import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/utils/db';
import Challenge from '@/models/challenge';
import { authOptions } from '@/config/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Log session for debugging
    console.log('Session:', session);

    if (!session?.user?.email || session.user.role !== 'admin') {
      console.log('Unauthorized - User:', session?.user);
      return NextResponse.json({ 
        error: 'Unauthorized - Admin access required',
        details: { role: session?.user?.role }
      }, { status: 401 });
    }

    const { leetcodeLink, difficulty } = await req.json();

    if (!leetcodeLink || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Validate difficulty
    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty level' },
        { status: 400 }
      );
    }

    // Validate LeetCode URL format
    const leetcodeUrlPattern = /^https?:\/\/(www\.)?leetcode\.com\/problems\/[\w-]+\/?$/;
    if (!leetcodeUrlPattern.test(leetcodeLink)) {
      return NextResponse.json(
        { error: 'Invalid LeetCode URL format' },
        { status: 400 }
      );
    }

    // Check if challenge already exists
    const existingChallenge = await Challenge.findOne({ leetcodeLink });
    if (existingChallenge) {
      return NextResponse.json(
        { error: 'Challenge already exists' },
        { status: 400 }
      );
    }

    const challenge = await Challenge.create({
      leetcodeLink,
      difficulty,
      createdAt: new Date(),
      submissions: []
    });

    return NextResponse.json({
      success: true,
      challenge
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create challenge',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 