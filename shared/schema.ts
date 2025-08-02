import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const signatures = pgTable("signatures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  name: text("name").notNull(),
  templateId: text("template_id").notNull(),
  personalInfo: json("personal_info").notNull(),
  images: json("images"),
  animationType: text("animation_type").notNull().default("fade-in"),
  socialMedia: json("social_media"),
  elementPositions: json("element_positions"),
  elementAnimations: json("element_animations"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  previewUrl: text("preview_url"),
  isActive: text("is_active").default("true"),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for validation
export const personalInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export const socialMediaSchema = z.object({
  linkedin: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  youtube: z.string().url().optional().or(z.literal("")),
  tiktok: z.string().url().optional().or(z.literal("")),
});

export const imagesSchema = z.object({
  headshot: z.string().optional(),
  logo: z.string().optional(),
  background: z.string().optional(),
  backgroundOpacity: z.number().min(0).max(100).default(20),
  headshotSize: z.number().min(50).max(200).default(100),
  logoSize: z.number().min(50).max(200).default(100),
});

export const insertSignatureSchema = createInsertSchema(signatures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Signature name is required"),
  personalInfo: personalInfoSchema,
  socialMedia: socialMediaSchema.optional(),
  images: imagesSchema.optional(),
  animationType: z.enum(["none", "fade-in", "pulse", "cross-dissolve"]),
  elementPositions: z.any().optional(),
  elementAnimations: z.any().optional(),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type InsertSignature = z.infer<typeof insertSignatureSchema>;
export type Signature = typeof signatures.$inferSelect;
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type SocialMedia = z.infer<typeof socialMediaSchema>;
export type Images = z.infer<typeof imagesSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type AnimationType = "fade-in" | "pulse" | "cross-dissolve";

export const elementAnimationSchema = z.object({
  headshot: z.enum(["none", "fade-in", "pulse", "zoom-in", "rotate"]).default("none"),
  logo: z.enum(["none", "fade-in", "pulse", "zoom-in", "rotate"]).default("none"), 
  socialIcons: z.enum(["none", "fade-in", "pulse", "zoom-in", "rotate"]).default("none"),
});

export type ElementAnimations = z.infer<typeof elementAnimationSchema>;
