import type { Express } from "express";
import { authService } from "../auth";
import { loginSchema, registerSchema } from "@shared/schema";

export function registerAuthRoutes(app: Express) {
  // Login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const { user, token } = await authService.login(loginData);
      
      // Set auth cookie (in production, use httpOnly secure cookies)
      res.cookie("auth_token", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      // Return user data (without password hash)
      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Login failed" 
      });
    }
  });

  // Register route
  app.post("/api/auth/register", async (req, res) => {
    try {
      const registerData = registerSchema.parse(req.body);
      const user = await authService.register(registerData);
      
      // Return user data (without password hash)
      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword,
        message: "Account created successfully"
      });
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Registration failed" 
      });
    }
  });

  // Get current user route
  app.get("/api/auth/user", async (req, res) => {
    try {
      const token = req.cookies.auth_token;
      if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await authService.getUserFromToken(token);
      if (!user) {
        return res.status(401).json({ message: "Invalid token" });
      }

      // Return user data (without password hash)
      const { passwordHash, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(401).json({ 
        message: "Authentication failed" 
      });
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("auth_token");
    res.json({ message: "Logged out successfully" });
  });
}