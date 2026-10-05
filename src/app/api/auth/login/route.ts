import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  DEMO_COMMANDER_USER,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  verifyPassword,
} from "@/lib/server/auth";
import { COLLECTIONS, getDatabase, isMongoActive } from "@/lib/mongodb";
import { UserDocument } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const demoPassword = process.env.DEMO_COMMANDER_PASSWORD || "ResqNet2026!Commander";

    let matchedUser: UserDocument | null = null;
    let isPasswordValid = false;

    // 1. Try to authenticate via MongoDB Atlas / local MongoDB
    if (isMongoActive()) {
      try {
        const db = await getDatabase();
        const user = await db.collection<UserDocument>(COLLECTIONS.USERS).findOne({
          email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
        });

        if (user && user.passwordHash) {
          matchedUser = user;
          isPasswordValid = verifyPassword(
            password,
            user.passwordHash,
            user.passwordSalt,
            user.hashAlgorithm,
            100000
          );
        }
      } catch (dbErr) {
        console.warn(
          "[Auth] Database lookup failed, falling back to local verification:",
          dbErr instanceof Error ? dbErr.message : dbErr
        );
      }
    }

    // 2. Fallback to demo commander identity if not found in DB or DB offline
    if (!matchedUser) {
      const allowedEmails = [
        "jaswant@resqnet.gov.in",
        "cmdr.jaswant@resqnet.gov.in",
        "commander@resqnet.gov.in",
        "commander.menon@resqnet.gov.in",
      ];

      if (
        allowedEmails.includes(normalizedEmail) ||
        normalizedEmail.includes("jaswant") ||
        normalizedEmail.includes("commander")
      ) {
        matchedUser = DEMO_COMMANDER_USER;
        isPasswordValid = password === demoPassword;
      }
    }

    if (!matchedUser || !isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid command credentials. Access denied by EOC Sentinel.",
        },
        { status: 401 }
      );
    }

    // 3. Issue secure signed session token
    const token = await createSessionToken({
      userId: matchedUser.userId,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      avatar: matchedUser.avatar,
    });

    const isProd = process.env.NODE_ENV === "production";
    const response = NextResponse.json({
      success: true,
      message: "Authorization granted. Redirecting to tactical command center...",
      user: {
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
        avatar: matchedUser.avatar,
      },
    });

    // 4. Set secure HTTP-only cookie (no password or token in localStorage)
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
