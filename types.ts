
export type UserRole = 'user' | 'admin';
export type AccountType = 'free' | 'premium';

export interface UserData {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  refCode: string;
  uplineRefCode: string;
  role: UserRole;
  accountType: AccountType;
  joiningDate: string;
  balanceFree: number;
  balancePremium: number;
  balanceDeposit: number; 
  totalWithdraw: number;
  withdrawCount: number; 
  isBlocked: boolean;
  profileImage?: string;
  availableTypingJobIds?: number[]; 
  activePackageId?: string; 
  packageExpiryDate?: string; // ISO Date string
  totalActiveSeconds?: number;
  joiningBonusClaimed?: boolean;
  quizUsage?: { date: string; count: number };
}

export interface QuizPackage {
  id: string;
  name: string;
  desc: string;
  cost: number;
  reward: number;
  dailyLimit: number;
  durationSeconds: number; 
  adLinks: string[]; 
  status: 'active' | 'inactive';
  color: string;
}

export interface GmailRequest {
  id: string;
  userId: string;
  status: 'requested' | 'credentials_sent' | 'recovery_requested' | 'recovery_sent' | 'submitted' | 'approved' | 'rejected';
  adminProvidedFirstName?: string;
  adminProvidedLastName?: string;
  adminProvidedPassword?: string;
  adminProvidedRecoveryEmail?: string;
  userCreatedEmail?: string; 
  date: string;
}

export interface PremiumRequest {
  id: string;
  userId: string;
  method: string;
  senderNumber: string;
  trxId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export const DB_KEYS = {
  USERS: 'app_users',
  CURRENT_USER: 'app_current_user',
  SETTINGS: 'app_settings',
  TASKS: 'app_tasks',
  RECOVERY_REQUESTS: 'app_recovery_requests',
  GMAIL_REQUESTS: 'app_gmail_requests',
  PREMIUM_REQUESTS: 'app_premium_requests', // Added new key
  QUIZ_PACKAGES: 'app_quiz_packages'
};
