
export type Role = "user" | "admin";


interface AuthUser {
  userId: string;
  email: string;
  name?: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
