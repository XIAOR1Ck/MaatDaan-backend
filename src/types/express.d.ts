import db from "../models";

const { Users } = db as any;

declare global {
  namespace Express {
    interface Request {
      user?: Users;
    }
  }
}

export {};
