import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    const client = await MongoClient.connect(process.env.MONGO_URI || '');
    const db = client.db();

    // Get users with their solved problems
    const users = await db.collection('users')
      .find({})
      .project({
        name: 1,
        email: 1,
        avatar: 1,
        totalProblemsSolved: 1,
        easySolved: 1,
        mediumSolved: 1,
        hardSolved: 1
      })
      .sort({ totalProblemsSolved: -1 })  // Sort by problems solved
      .toArray();

    // Calculate points based on totalProblemsSolved
    const usersWithPoints = users.map(user => ({
      ...user,
      points: (user.totalProblemsSolved || 0) * 100
    }));

    await client.close();
    return NextResponse.json(usersWithPoints);

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { message: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
} 