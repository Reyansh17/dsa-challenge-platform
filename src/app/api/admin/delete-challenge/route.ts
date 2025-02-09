import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import Challenge, { ChallengeDocument } from '@/models/challenge';
import { isValidObjectId } from 'mongoose';

export async function DELETE(req: Request) {
  try {
    // Connect to the database
    await connectDB();

    // Extract challengeId from query parameters
    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get('id');

    // Validate challengeId
    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    if (!isValidObjectId(challengeId)) {
      return NextResponse.json(
        { error: 'Invalid Challenge ID format' },
        { status: 400 }
      );
    }

    // Attempt to delete the challenge
    const deletedChallenge = await Challenge.findByIdAndDelete(challengeId);

    if (!deletedChallenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Challenge deleted successfully'
    });
  } catch (error) {
    // Log the error with context
    console.error(`Error deleting challenge:`, error);

    // Return an appropriate error response
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { error: 'Failed to delete challenge', details: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to delete challenge' },
        { status: 500 }
      );
    }
  }
}