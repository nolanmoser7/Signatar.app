import { type Signature, type InsertSignature, type Template, type InsertTemplate, signatures, templates } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
}

export class MemStorage implements IStorage {
  private signatures: Map<string, Signature>;
  private templates: Map<string, Template>;

  constructor() {
    this.signatures = new Map();
    this.templates = new Map();
    
    // Initialize with default templates
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const defaultTemplates: Template[] = [
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
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with default templates if database is empty
    this.initializeTemplates();
  }

  private async initializeTemplates() {
    try {
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
    const signatureData = {
      ...insertSignature,
      id,
      userId: insertSignature.userId || null,
      images: insertSignature.images || null,
      socialMedia: insertSignature.socialMedia || null,
    };
    
    const [signature] = await db
      .insert(signatures)
      .values(signatureData)
      .returning();
    return signature;
  }

  async updateSignature(id: string, updateData: Partial<InsertSignature>): Promise<Signature | undefined> {
    const [signature] = await db
      .update(signatures)
      .set({ ...updateData, updatedAt: new Date() })
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
}

export const storage = new DatabaseStorage();
