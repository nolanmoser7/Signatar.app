import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const signatures = pgTable("signatures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  templateId: text("template_id").notNull(),
  personalInfo: json("personal_info").notNull(),
  images: json("images"),
  animationType: text("animation_type").notNull().default("fade-in"),
  socialMedia: json("social_media"),
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
});

export const insertSignatureSchema = createInsertSchema(signatures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  personalInfo: personalInfoSchema,
  socialMedia: socialMediaSchema.optional(),
  images: imagesSchema.optional(),
  animationType: z.enum(["fade-in", "pulse", "cross-dissolve"]),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
});

export type InsertSignature = z.infer<typeof insertSignatureSchema>;
export type Signature = typeof signatures.$inferSelect;
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type SocialMedia = z.infer<typeof socialMediaSchema>;
export type Images = z.infer<typeof imagesSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type AnimationType = "fade-in" | "pulse" | "cross-dissolve";
