import { type Signature, type InsertSignature, type Template, type InsertTemplate } from "@shared/schema";
import { randomUUID } from "crypto";

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

export const storage = new MemStorage();
