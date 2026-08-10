import db from '../models';
import { verifyToken } from '../utils/generateToken';
import { Request, Response, NextFunction } from 'express';

const { User } = db as any;


const protect = async (
req: Request,
res: Response,
next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    console.log(decoded);
    
    if (decoded.role === "user") {
      req.user = await User.findByPk(decoded.userId, {
  attributes: { exclude: ['password']}
});
    }
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Protect middleware error:", error);

  return res.status(401).json({
    message: "Authentication failed",
    error: error instanceof Error ? error.message : error,
  });
  }
};

export {protect};
