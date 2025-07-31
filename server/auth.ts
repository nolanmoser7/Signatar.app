import bcrypt from "bcrypt";
import { storage } from "./storage";
import type { LoginData, RegisterData, User } from "@shared/schema";

const SALT_ROUNDS = 10;

export class AuthService {
  async login(loginData: LoginData): Promise<{ user: User; token: string }> {
    const user = await storage.getUserByEmail(loginData.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValidPassword = await bcrypt.compare(loginData.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // For now, we'll use a simple token (in production, use JWT)
    const token = `user_${user.id}_${Date.now()}`;

    return { user, token };
  }

  async register(registerData: RegisterData): Promise<User> {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(registerData.email);
    if (existingUser) {
      throw new Error("An account with this email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerData.password, SALT_ROUNDS);

    // Create user
    const user = await storage.createUser({
      email: registerData.email,
      passwordHash,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
    });

    return user;
  }

  async getUserFromToken(token: string): Promise<User | null> {
    // Simple token validation (in production, use JWT)
    if (!token.startsWith("user_")) {
      return null;
    }

    const userId = token.split("_")[1];
    const user = await storage.getUser(userId);
    return user || null;
  }
}

export const authService = new AuthService();