
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const User = require("../models/Users");
const generateToken = require("../util/generateToken");

require("dotenv").config();

// Email transporter
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT || 587),
    secure: Number(process.env.MAIL_PORT || 587) === 465,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
});

const genericMessage =
    "If an account exists with this email, a password reset link will be sent.";

// SIGNUP
const signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// LOGIN
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated",
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const token = generateToken(user._id.toString(), user.role);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// FORGOT PASSWORD
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address",
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        });

        // Do not reveal whether the email exists.
        if (!user || !user.isActive) {
            return res.status(200).json({
                success: true,
                message: genericMessage,
            });
        }

        if (
            !process.env.MAIL_USER ||
            !process.env.MAIL_PASS ||
            !process.env.MAIL_HOST
        ) {
            console.error("Password reset email configuration is missing.");

            return res.status(503).json({
                success: false,
                message: "Email service is not configured. Please contact support.",
            });
        }

        // Create a cryptographically secure token.
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

        await user.save();

        const frontendUrl =
            process.env.FRONTEND_URL || "http://localhost:5173";

        const resetLink =
            `${frontendUrl.replace(/\/$/, "")}/reset-password/${resetToken}`;

        try {
            await transporter.sendMail({
                from: process.env.MAIL_FROM || process.env.MAIL_USER,
                to: user.email,
                subject: "CRM Portal - Password Reset",
                text: [
                    `Hello ${user.name},`,
                    "",
                    "We received a request to reset your CRM Portal password.",
                    `Reset your password using this link: ${resetLink}`,
                    "This link expires in 15 minutes and can only be used once.",
                    "",
                    "If you did not request this, please ignore this email.",
                ].join("\n"),
            });


            transporter.verify((error, success) => {
                if (error) {
                    console.error("SMTP verification failed:", error);
                } else {
                    console.log("SMTP server is ready:", success);
                }
            });

        } catch (mailError) {
            // Invalidate the token if the email was not sent.
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();

            console.error("Password reset email failed:", {
                code: mailError.code,
                command: mailError.command,
                responseCode: mailError.responseCode,
                message: mailError.message,
            });

            return res.status(503).json({
                success: false,
                message:
                    "Unable to send the reset email. Check your SMTP settings and try again.",
            });
        }

        return res.status(200).json({
            success: true,
            message: genericMessage,
        });
    } catch (error) {
        next(error);
    }
};

// RESET PASSWORD
const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (
            typeof password !== "string" ||
            password.length < 6
        ) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        if (typeof token !== "string" || !token) {
            return res.status(400).json({
                success: false,
                message: "Reset link is invalid or has expired",
            });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() },
            isActive: true,
        }).select("+passwordResetToken +passwordResetExpires");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Reset link is invalid or has expired",
            });
        }

        user.password = await bcrypt.hash(password, 10);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful. Please log in.",
        });
    } catch (error) {
        next(error);
    }
};


const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      newPassword.length < 6
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid current password and a new password of at least 6 characters.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password.",
      });
    }

    // req.user.id is set by the authentication middleware.
    const user = await User.findById(req.user.userId);

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
    signup,
    login,
    forgotPassword,
    resetPassword,
    changePassword,
};
