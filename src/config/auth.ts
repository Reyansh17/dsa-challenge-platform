import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/utils/db';
import User from '@/models/user';
import { ADMIN_CREDENTIALS } from './admin';

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      totalProblemsSolved: number;
      easySolved: number;
      mediumSolved: number;
      hardSolved: number;
      isAdminToday: boolean;
      isEligibleForAdmin: boolean;
      lastAdminDate?: Date;
    }
  }
}

const generateAvatar = (email: string, style: string = 'bottts') => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${email}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
};

export const APPROVED_EMAILS = [
  'admin@example.com',
  // Add other approved emails here
];

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (credentials.email === ADMIN_CREDENTIALS.email && 
            credentials.password === ADMIN_CREDENTIALS.password) {
          return {
            id: 'admin',
            email: ADMIN_CREDENTIALS.email,
            name: 'Admin',
            role: 'admin',
            avatar: generateAvatar('admin'),
            avatarStyle: 'bottts'
          };
        }
        return null;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectDB();

        if (!user?.email) {
          return false;
        }

        // Check if admin email
        if (user.email === ADMIN_CREDENTIALS.email) {
          user.role = 'admin';
          user.name = 'Admin';
          user.avatar = generateAvatar('admin');
          user.avatarStyle = 'bottts';
          return true;
        }

        // Regular user flow
        let dbUser = await User.findOne({ email: user.email });
        
        if (!dbUser) {
          const avatar = generateAvatar(user.email);
          dbUser = await User.create({
            email: user.email,
            name: user.name || user.email.split('@')[0],
            role: 'user',
            avatarStyle: 'bottts',
            avatar,
            totalProblemsSolved: 0,
            easySolved: 0,
            mediumSolved: 0,
            hardSolved: 0
          });
        }

        user.id = dbUser._id.toString();
        user.name = dbUser.name;
        user.role = dbUser.role;
        user.avatar = dbUser.avatar;
        user.avatarStyle = dbUser.avatarStyle;

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.avatar = user.avatar;
        token.avatarStyle = user.avatarStyle;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        session.user.avatar = token.avatar as string;
        session.user.avatarStyle = token.avatarStyle as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}; 