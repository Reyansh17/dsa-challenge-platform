import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST() {
  try {
    console.log('Starting reset...');
    
    const client = await MongoClient.connect(process.env.MONGO_URI || '');
    const db = client.db();

    // Reset totalProblemsSolved to 0
    const result = await db.collection('users').updateMany(
      {}, // Match all users
      { 
        $set: { 
          totalProblemsSolved: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0
        } 
      }
    );

    console.log(`Reset stats for ${result.modifiedCount} users`);

    await client.close();

    return NextResponse.json({
      success: true,
      message: 'All user problem counts have been reset to 0',
      updated: result.modifiedCount
    });

  } catch (error) {
    console.error('Error resetting stats:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to reset stats'
    }, { status: 500 });
  }
} 