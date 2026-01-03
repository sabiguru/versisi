import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendEmail } from "@/lib/emails/send";
import { otpEmail } from "@/lib/emails/otp-email";

const sendOtpSchema = z.object({
  email: z.string().email(),
  isSignup: z.boolean().optional(),
});

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = sendOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email, isSignup } = validation.data;

    // For login, check if user exists
    if (!isSignup) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!existingUser) {
        return NextResponse.json(
          { error: "No account found with this email. Please sign up first." },
          { status: 404 }
        );
      }
    }

    // Generate OTP
    const token = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unused OTP tokens for this email
    await prisma.oTPToken.deleteMany({
      where: {
        email,
        used: false,
      },
    });

    // Create new OTP token
    await prisma.oTPToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // Send OTP email
    const emailTemplate = otpEmail({ email, token, isSignup: !!isSignup });

    try {
      await sendEmail({
        to: email,
        ...emailTemplate,
      });
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      // Continue even if email fails - OTP is still valid
    }

    // In development, return the OTP in the response for testing
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        message: "OTP sent successfully",
        debug: { token }, // Only in development!
      });
    }

    return NextResponse.json({
      message: "OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
