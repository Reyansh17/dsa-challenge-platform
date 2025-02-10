import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      totalProblemsSolved: number;
      easySolved: number;
      mediumSolved: number;
      hardSolved: number;
      isAdminToday: boolean;
      isEligibleForAdmin: boolean;
      lastAdminDate?: Date;
    }
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar: string;
    avatarStyle: string;
  }
} 