
export type Role = "user" | "admin";


interface AuthUser {
  userId: string;
  email: string;
  name?: string;
  role: Role;
  isVerified?: boolean
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
