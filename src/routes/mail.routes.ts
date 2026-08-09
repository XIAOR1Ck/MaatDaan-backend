import { Router } from "express";
import { sendEmail } from "../services/mail.service";

const mailRouter = Router();

mailRouter.post("/test-email", async (req, res) => {
  try {
    const { email } = req.body;

    await sendEmail(
      email,
      "Test Email",
      `
        <h1>Hello!</h1>
        <p>This email was sent using Nodemailer.</p>
      `,
    );

    return res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Email error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
});

export default mailRouter;
