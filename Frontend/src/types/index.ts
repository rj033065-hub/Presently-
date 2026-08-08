export type UserRole = 'guest' | 'registered_user' | 'moderator' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  fullName?: string;
  avatarUrl?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}
