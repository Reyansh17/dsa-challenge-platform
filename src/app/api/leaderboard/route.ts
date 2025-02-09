import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import User from '@/models/user';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all-time';

    await connectDB();

    // Build date filter
    let dateFilter = {};
    const now = new Date();
    if (filter === 'this-week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      dateFilter = { createdAt: { $gte: startOfWeek } };
    } else if (filter === 'this-month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { $gte: startOfMonth } };
    }

    const users = await User.find({
      role: { $ne: 'admin' },
      ...dateFilter
    }).select({
      _id: 1,
      name: 1,
      email: 1,
      totalProblemsSolved: 1,
      easySolved: 1,
      mediumSolved: 1,
      hardSolved: 1,
      avatarStyle: 1
    }).sort({
      totalProblemsSolved: -1,
      hardSolved: -1,
      mediumSolved: -1,
      easySolved: -1
    }).limit(100);

    // Format the response with proper avatar URLs
    const formattedUsers = users.map(user => {
      const style = user.avatarStyle || 'initials';
      const seed = user._id.toString();
      const bgColors = 'b6e3f4,c0aede,d1d4f9';
      
      return {
        _id: user._id.toString(),
        name: user.name || 'Anonymous',
        email: user.email,
        totalProblemsSolved: user.totalProblemsSolved || 0,
        easySolved: user.easySolved || 0,
        mediumSolved: user.mediumSolved || 0,
        hardSolved: user.hardSolved || 0,
        avatar: `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=${bgColors}`,
        avatarStyle: style
      };
    });

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
} 