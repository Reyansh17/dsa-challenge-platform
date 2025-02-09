export interface ChallengeSubmission {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  submittedAt: string;
}

export interface Challenge {
  _id: string;
  leetcodeLink: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdAt: string;
  isCompleted?: boolean;
  submissions?: Array<{
    userId: {
      _id: string;
      name: string;
      email: string;
      avatar: string;
      totalProblemsSolved?: number;
    };
    submittedAt: string;
  }>;
}

export interface CreateChallengeRequest {
  leetcodeLink: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface CreateChallengeResponse {
  success: boolean;
  challenge: Challenge;
  error?: string;
  details?: any;
}

export interface ChallengeResponse {
  success: boolean;
  challenges: Challenge[];
  error?: string;
} 