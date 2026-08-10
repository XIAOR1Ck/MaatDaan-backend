import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { signToken } from '../utils/generateToken';
import * as db from '../models';
const { User , EmailVerification, Admin } = db as any;

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      });
      return;
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'A user with this email already exists',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name,
      email: email,
      password: passwordHash,
    });

    const token = crypto.randomBytes(32).toString('hex');

    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const expiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await EmailVerification.create({
      userId: user.userId,
      tokenHash,
      expiresAt,
    });

    // TODO: Send `token` using Nodemailer
      const jwtToken = signToken({userId: user.userId, email: user.email, role: "user"});

    res.status(201).json({
      success: true,
      message: 'User created. Please verify your email.',
      token: jwtToken,
      data: {
        userId: user.userId,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to create user',
    });
  }
};

export const loginUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const role = "user";
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    } 

    const jwtToken = signToken({
      userId: user.userId,
      email: user.email,
      role: role,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: jwtToken,
      data: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log in',
    });
  }
};

export const createAdmin = async (
req: Request,
res: Response
) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: { email },
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin
    const admin = await Admin.create({
      email,
      password: hashedPassword,
    });
const jwtToken = signToken({userId: admin.adminId, email: admin.email, role: "user"});

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      token: jwtToken,
      data: {
        adminId: admin.adminId,
        email: admin.email,
        role: "admin"
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create admin",
    });
  }
};

export const loginAdmin = async (
req: Request,
res: Response
) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find admin
    const admin = await Admin.findOne({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = signToken({userId: admin.adminId, email: admin.email, role: "admin"});
    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        adminId: admin.adminId,
        email: admin.email,
        role: "admin"
      },
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};

