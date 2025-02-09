import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/utils/db';
import User from '@/models/user';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is eligible to become admin
    if (!user.isEligibleForAdmin) {
      return NextResponse.json(
        { error: 'You are not eligible to become an admin' },
        { status: 403 }
      );
    }

    // Check if user was admin in the last 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastAdminDate) {
      const daysSinceLastAdmin = Math.floor(
        (today.getTime() - user.lastAdminDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastAdmin < 7) {
        return NextResponse.json(
          { error: 'You can only be admin once every 7 days' },
          { status: 400 }
        );
      }
    }

    // Reset previous admin's status
    await User.updateMany({}, { isAdminToday: false });

    // Make user admin
    user.isAdminToday = true;
    user.lastAdminDate = new Date();
    await user.save();

    // Return success with updated user data
    return NextResponse.json({
      success: true,
      user: {
        isAdminToday: true,
        lastAdminDate: user.lastAdminDate
      }
    });
  } catch (error) {
    console.error('Error requesting admin:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 