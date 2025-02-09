import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/utils/db';
import Challenge from '@/models/challenge';

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('adminSession');

    if (!adminSession || adminSession.value !== 'true') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { challengeId } = await req.json();
    await connectDB();

    const result = await Challenge.findByIdAndDelete(challengeId);
    if (!result) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    return NextResponse.json(
      { error: 'Failed to delete challenge' },
      { status: 500 }
    );
  }
} 