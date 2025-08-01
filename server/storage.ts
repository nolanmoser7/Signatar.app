import { type Signature, type InsertSignature, type Template, type InsertTemplate, type User, type InsertUser, signatures, templates, users } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Helper function to determine signature tag based on animations
function determineSignatureTag(elementAnimations: any): 'static' | 'dynamic' {
  if (!elementAnimations) return 'static';
  
  // Check if any element has animations other than 'none'
  const hasAnimations = Object.values(elementAnimations).some(
    (animation: any) => animation && animation !== 'none'
  );
  
  return hasAnimations ? 'dynamic' : 'static';
}

export interface IStorage {
  // Signature operations
  getSignature(id: string): Promise<Signature | undefined>;
  getUserSignatures(userId: string): Promise<Signature[]>;
  createSignature(signature: InsertSignature): Promise<Signature>;
  updateSignature(id: string, signature: Partial<InsertSignature>): Promise<Signature | undefined>;
  deleteSignature(id: string): Promise<boolean>;
  
  // Template operations
  getTemplate(id: string): Promise<Template | undefined>;
  getAllTemplates(): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private signatures: Map<string, Signature>;
  private templates: Map<string, Template>;
  private users: Map<string, User>;

  constructor() {
    this.signatures = new Map();
    this.templates = new Map();
    this.users = new Map();
    
    // Initialize with default templates
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const defaultTemplates: Template[] = [
      {
        id: "sales-professional",
        name: "Sales Professional",
        description: "Corporate design with action buttons and accent colors",
        previewUrl: "",
        isActive: "true",
      },
      {
        id: "professional",
        name: "Professional",
        description: "Clean and professional design",
        previewUrl: "",
        isActive: "true",
      },
      {
        id: "modern",
        name: "Modern",
        description: "Contemporary design with bold elements",
        previewUrl: "",
        isActive: "true",
      },
      {
        id: "minimal",
        name: "Minimal",
        description: "Simple and clean layout",
        previewUrl: "",
        isActive: "true",
      },
      {
        id: "creative",
        name: "Creative",
        description: "Creative design with unique elements",
        previewUrl: "",
        isActive: "true",
      },
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  async getSignature(id: string): Promise<Signature | undefined> {
    return this.signatures.get(id);
  }

  async getUserSignatures(userId: string): Promise<Signature[]> {
    return Array.from(this.signatures.values()).filter(
      (signature) => signature.userId === userId
    );
  }

  async createSignature(insertSignature: InsertSignature): Promise<Signature> {
    const id = randomUUID();
    const now = new Date();
    const signature: Signature = {
      ...insertSignature,
      id,
      userId: insertSignature.userId || null,
      images: insertSignature.images || null,
      socialMedia: insertSignature.socialMedia || null,
      elementPositions: insertSignature.elementPositions || null,
      elementAnimations: insertSignature.elementAnimations || null,
      createdAt: now,
      updatedAt: now,
    };
    this.signatures.set(id, signature);
    return signature;
  }

  async updateSignature(id: string, updateData: Partial<InsertSignature>): Promise<Signature | undefined> {
    const signature = this.signatures.get(id);
    if (!signature) return undefined;
    
    const updatedSignature: Signature = {
      ...signature,
      ...updateData,
      updatedAt: new Date(),
    };
    this.signatures.set(id, updatedSignature);
    return updatedSignature;
  }

  async deleteSignature(id: string): Promise<boolean> {
    return this.signatures.delete(id);
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(
      template => template.isActive === "true"
    );
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const template: Template = { 
      ...insertTemplate, 
      id,
      description: insertTemplate.description || null,
      previewUrl: insertTemplate.previewUrl || null,
      isActive: insertTemplate.isActive || null,
    };
    this.templates.set(id, template);
    return template;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...updateData,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with default templates if database is empty (async, no await)
    this.initializeTemplates().catch(error => {
      console.error("Error initializing database storage:", error);
    });
  }

  private async initializeTemplates() {
    try {
      // Test database connection first
      await db.select().from(templates).limit(1);
      
      const existingTemplates = await db.select().from(templates);
      if (existingTemplates.length === 0) {
        const defaultTemplatesData = [
          {
            id: "professional",
            name: "Professional",
            description: "Clean and professional design",
            previewUrl: "",
            isActive: "true",
          },
          {
            id: "modern",
            name: "Modern",
            description: "Contemporary design with bold elements",
            previewUrl: "",
            isActive: "true",
          },
          {
            id: "minimal",
            name: "Minimal",
            description: "Simple and clean layout",
            previewUrl: "",
            isActive: "true",
          },
          {
            id: "creative",
            name: "Creative",
            description: "Creative design with unique elements",
            previewUrl: "",
            isActive: "true",
          },
          {
            id: "sales-professional",
            name: "Sales Professional",
            description: "Corporate design with action buttons and accent colors",
            previewUrl: "",
            isActive: "true",
          },
        ];

        await db.insert(templates).values(defaultTemplatesData);
      }
    } catch (error) {
      console.error("Error initializing templates:", error);
    }
  }

  async getSignature(id: string): Promise<Signature | undefined> {
    const [signature] = await db.select().from(signatures).where(eq(signatures.id, id));
    return signature || undefined;
  }

  async getUserSignatures(userId: string): Promise<Signature[]> {
    return await db.select().from(signatures).where(eq(signatures.userId, userId));
  }

  async createSignature(insertSignature: InsertSignature): Promise<Signature> {
    const id = randomUUID();
    
    // Automatically determine tag based on animations
    const tag = determineSignatureTag(insertSignature.elementAnimations);
    
    const signatureData = {
      ...insertSignature,
      id,
      userId: insertSignature.userId || null,
      tag,
      images: insertSignature.images || null,
      socialMedia: insertSignature.socialMedia || null,
      elementPositions: insertSignature.elementPositions || null,
      elementAnimations: insertSignature.elementAnimations || null,
    };
    
    const [signature] = await db
      .insert(signatures)
      .values(signatureData)
      .returning();
    return signature;
  }

  async updateSignature(id: string, updateData: Partial<InsertSignature>): Promise<Signature | undefined> {
    // If animations are being updated, recalculate the tag
    const updateDataWithTag = { ...updateData };
    if (updateData.elementAnimations !== undefined) {
      updateDataWithTag.tag = determineSignatureTag(updateData.elementAnimations);
    }
    
    const [signature] = await db
      .update(signatures)
      .set({ ...updateDataWithTag, updatedAt: new Date() })
      .where(eq(signatures.id, id))
      .returning();
    return signature || undefined;
  }

  async deleteSignature(id: string): Promise<boolean> {
    const result = await db.delete(signatures).where(eq(signatures.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async getAllTemplates(): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.isActive, "true"));
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const templateData = { 
      ...insertTemplate, 
      id,
      description: insertTemplate.description || null,
      previewUrl: insertTemplate.previewUrl || null,
      isActive: insertTemplate.isActive || null,
    };
    
    const [template] = await db
      .insert(templates)
      .values(templateData)
      .returning();
    return template;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const userData = {
      ...insertUser,
      id,
    };
    
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }
}

export const storage = new DatabaseStorage();
