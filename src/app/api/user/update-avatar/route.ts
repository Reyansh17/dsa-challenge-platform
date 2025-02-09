import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/utils/db';
import User from '@/models/user';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { avatarStyle } = await req.json();

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate new avatar URL
    const newAvatar = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${user._id}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

    // Update user with new avatar style and URL
    await User.updateOne(
      { _id: user._id },
      { 
        $set: {
          avatarStyle: avatarStyle,
          avatar: newAvatar
        }
      }
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: newAvatar,
        avatarStyle: avatarStyle
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