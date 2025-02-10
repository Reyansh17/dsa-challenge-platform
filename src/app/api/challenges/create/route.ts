import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/utils/db';
import Challenge from '@/models/challenge';
import { ADMIN_CREDENTIALS } from '@/config/admin';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    console.log('Session:', session);

    if (!session?.user?.email || session.user.email !== ADMIN_CREDENTIALS.email) {
      console.log('Unauthorized - User:', session?.user);
      return NextResponse.json({ 
        error: 'Unauthorized - Admin access required',
      }, { 
        status: 401 
      });
    }

    await connectDB();
    const data = await req.json();

    const challenge = await Challenge.create({
      leetcodeLink: data.leetcodeLink,
      difficulty: data.difficulty,
      submissions: []
    });

    // Set cookie in response if needed
    const response = NextResponse.json(challenge);
    response.cookies.set('adminSession', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    );
  }
} 