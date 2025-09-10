import jwt, { TokenExpiredError } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

interface JwtPayload {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin" | "agent"; // restrict to valid roles
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload; // Extend Request to include user
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  // ✅ Extract access token
  let token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined;

  // ✅ Fallback to cookie token
  if (!token && req.cookies) {
    token = req.cookies.token; // only allow access token from cookies
  }

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);

    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }

    return res.status(401).json({ error: "Invalid token" });
  }
};
