
import { Request, Response } from "express";
import crypto from "crypto";

import db from "../models";
import { sendEmail } from "../services/mail.service";

const { User, EmailVerification } = db as any;

/**
 * Get all verified users
 */
export const findVerifiedUser = async (
  req: Request,
  res: Response
) => {
  try {
    const users = await User.findAll({
      where: {
        isVerified: true,
      },
      attributes: {
        exclude: ["password"],
      },
    });

    return res.status(200).json({
      success: true,
      message: "Verified users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Find verified users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch verified users",
    });
  }
};

/**
 * Get all unverified users
 */
export const findUnverifiedUser = async (
  req: Request,
  res: Response
) => {
  try {
    const users = await User.findAll({
      where: {
        isVerified: false,
      },
      attributes: {
        exclude: ["password"],
      },
    });

    return res.status(200).json({
      success: true,
      message: "Unverified users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Find unverified users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unverified users",
    });
  }
};

/**
 * Send account verification email to a user
 */
export const sendVerificationEmail = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find the user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate a cryptographically secure verification token
    const verificationToken = crypto
      .randomBytes(16)
      .toString("hex");

    // Store only the hash in the database
    const tokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // Token expires after 24 hours
    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    // Remove any existing verification tokens for this user
    await EmailVerification.destroy({
      where: {
        userId,
      },
    });

    // Store the new verification token
    await EmailVerification.create({
      userId,
      tokenHash,
      expiresAt,
    });

    // Send the RAW token to the user.
    // Never send tokenHash because that is what is stored in the DB.
    await sendEmail(
      user.email,
      "MaatDaan Account Verification",
      `
        <h1>Hello ${user.name},</h1>

        <p>
          Thank you for registering with <strong>MaatDaan E-Voting</strong>.
        </p>

        <p>
          Your account details have been reviewed by an administrator.
          Please verify your email address to continue.
        </p>

        <p>
          Please open the verification page on the same device where
          you are logged in.
        </p>

        <p>
          <a href="http://localhost:5173/user/verification">
            Verify Your Account
          </a>
        </p>

        <p>
          <strong>Verification Token:</strong>
        </p>

        <p>
          ${verificationToken}
        </p>

        <p>
          This token will expire in 24 hours.
        </p>

        <p>
          Regards,<br />
          <strong>MaatDaan Team</strong>
        </p>
      `
    );

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Send verification email error:", error);

    // Clean up the newly created token if email sending failed
    await EmailVerification.destroy({
      where: {
        userId,
      },
    });

    return res.status(500).json({
      success: false,
      message: "Failed to send verification email",
    });
  }
};

export const addEligibleVoterList = async (
req: Request,
res: Response
) => {
const {electionId, eligibleVoters} = req.body;

if(!electionId || eligibleVoters ){
res.status(400).json({
        success: false,
        message: 'Election Id and Voter List is required',
      });
      return;
}

}
