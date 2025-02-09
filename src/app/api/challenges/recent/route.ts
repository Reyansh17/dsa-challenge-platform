import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import Challenge from '@/models/challenge';

export async function GET() {
  try {
    await connectDB();
    
    // Get today's challenges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const challenges = await Challenge.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    }).sort({ createdAt: -1 }); // Sort by newest first

    return NextResponse.json(challenges);
  } catch (error) {
    console.error('Error fetching recent challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent challenges' },
      { status: 500 }
    );
  }
} 