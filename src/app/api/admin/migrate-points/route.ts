import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST() {
  try {
    const client = await MongoClient.connect(process.env.MONGO_URI || '');
    const db = client.db();

    // Update all users to ensure they have points based on problems solved
    const result = await db.collection('users').updateMany(
      { points: { $exists: false } },  // Only update users without points
      [
        {
          $set: {
            points: {
              $multiply: ['$totalProblemsSolved', 100]  // Set points based on total problems
            }
          }
        }
      ]
    );

    await client.close();

    return NextResponse.json({
      success: true,
      message: 'Points field initialized for all users',
      updated: result.modifiedCount
    });

  } catch (error) {
    console.error('Error migrating points:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to migrate points'
    }, { status: 500 });
  }
} 