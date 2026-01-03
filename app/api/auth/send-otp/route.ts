import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

    // TODO: Send email with OTP
    // For now, log to console (in production, use a service like Resend, SendGrid, etc.)
    console.log(`OTP for ${email}: ${token}`);
    console.log(`Expires at: ${expires.toISOString()}`);

    // In development, you might want to return the OTP in the response
    // REMOVE THIS IN PRODUCTION
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
