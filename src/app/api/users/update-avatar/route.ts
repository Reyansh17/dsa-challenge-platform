import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/utils/db';
import User from '@/models/user';
import { authOptions } from '@/config/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { avatarStyle } = await req.json();

    // Validate avatar style
    const validStyles = ['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei', 'micah'];
    if (!validStyles.includes(avatarStyle)) {
      return NextResponse.json({ error: 'Invalid avatar style' }, { status: 400 });
    }

    // Generate new avatar URL
    const avatar = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${session.user.email}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        $set: { 
          avatarStyle,
          avatar
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        avatarStyle: updatedUser.avatarStyle,
        avatar: updatedUser.avatar
      }
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json(
      { error: 'Failed to update avatar' },
      { status: 500 }
    );
  }
} 