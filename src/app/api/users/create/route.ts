import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import User from '@/models/user';

export async function POST(req: Request) {
  try {
    const { username, email } = await req.json();
    
    if (!username || !email) {
      return NextResponse.json(
        { error: 'Username and email are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Update existing user's name if needed
      existingUser.name = username;
      await existingUser.save();
      return NextResponse.json({ success: true, user: existingUser });
    }

    // Create new user with default avatar
    const newUser = await User.create({
      email,
      name: username,
      totalProblemsSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      isAdminToday: false,
      isEligibleForAdmin: false,
      avatar: '/avtars/avtar1.jpg',
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 