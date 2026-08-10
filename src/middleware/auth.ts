import db from '../models';
import { verifyToken } from '../utils/generateToken';
import { Request, Response, NextFunction } from 'express';
const { User, Admin } = db as any;
import { Role } from '../types/express'


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
     const user = await User.findByPk(decoded.userId, {
  attributes: { exclude: ['password']}
});
req.user = {
userId: user.userId,
name: user.name,
email: user.email,
role: "user"
}

    } else if (decoded.role == "admin") {
      const admin = await Admin.findByPk(decoded.userId, {
  attributes: { exclude: ['password']}
});

req.user = {
userId: admin.userId,
name: admin.name,
email: admin.email,
role: "user"
}

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


const authorize = (...roles: Role[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};

export {protect,  authorize};
