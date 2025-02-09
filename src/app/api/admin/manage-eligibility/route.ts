import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/utils/db';
import User from '@/models/user';
import { APPROVED_EMAILS } from '@/config/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email || !APPROVED_EMAILS.includes(session.user.email)) {
      return NextResponse.json(
        { error: 'Unauthorized: Only admins can manage eligibility' },
        { status: 401 }
      );
    }

    await connectDB();
    const { userEmail, isEligible } = await req.json();

    if (!userEmail || typeof isEligible !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    user.isEligibleForAdmin = isEligible;
    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        isEligibleForAdmin: user.isEligibleForAdmin
      }
    });
  } catch (error) {
    console.error('Error managing admin eligibility:', error);
    return NextResponse.json(
      { error: 'Failed to update admin eligibility' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email || !APPROVED_EMAILS.includes(session.user.email)) {
      return NextResponse.json(
        { error: 'Unauthorized: Only admins can view eligibility' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Get all users with their eligibility status
    const users = await User.find({})
      .select('email name isEligibleForAdmin totalProblemsSolved')
      .sort({ totalProblemsSolved: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching eligible users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch eligible users' },
      { status: 500 }
    );
  }
} 