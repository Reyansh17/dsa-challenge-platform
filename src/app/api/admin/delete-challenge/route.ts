import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/utils/db';
import Challenge from '@/models/challenge';
import { authOptions } from '@/config/auth';

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Only admins can delete challenges' },
        { status: 401 }
      );
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get('id');

    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    const deletedChallenge = await Challenge.findByIdAndDelete(challengeId);
    
    if (!deletedChallenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Challenge deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    return NextResponse.json(
      { error: 'Failed to delete challenge' },
      { status: 500 }
    );
  }
} 