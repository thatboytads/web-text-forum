export enum UserRole {
  REGULAR = 'regular',
  MODERATOR = 'moderator'
}

export interface User {
  id: number;
  username: string;
  role: UserRole;
  is_active: boolean;
}

export interface UserCreate {
  username: string;
  password: string;
  role?: UserRole;
}

export interface Token {
  access_token: string;
  token_type: string;
}

