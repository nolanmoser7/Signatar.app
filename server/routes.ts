import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { insertSignatureSchema } from "@shared/schema";
import { registerAuthRoutes } from "./routes/auth";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG, SVG, and WebP are allowed."));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Register authentication routes
  registerAuthRoutes(app);

  // Get all templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Get a specific template
  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // Create a new signature
  app.post("/api/signatures", async (req, res) => {
    try {
      const validatedData = insertSignatureSchema.parse(req.body);
      const signature = await storage.createSignature(validatedData);
      res.status(201).json(signature);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create signature" });
      }
    }
  });

  // Get user signatures
  app.get("/api/signatures/user/:userId", async (req, res) => {
    try {
      const signatures = await storage.getUserSignatures(req.params.userId);
      res.json(signatures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch signatures" });
    }
  });

  // Get a specific signature
  app.get("/api/signatures/:id", async (req, res) => {
    try {
      const signature = await storage.getSignature(req.params.id);
      if (!signature) {
        return res.status(404).json({ message: "Signature not found" });
      }
      res.json(signature);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch signature" });
    }
  });

  // Update a signature
  app.patch("/api/signatures/:id", async (req, res) => {
    try {
      const validatedData = insertSignatureSchema.partial().parse(req.body);
      const signature = await storage.updateSignature(req.params.id, validatedData);
      if (!signature) {
        return res.status(404).json({ message: "Signature not found" });
      }
      res.json(signature);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update signature" });
      }
    }
  });

  // Delete a signature
  app.delete("/api/signatures/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSignature(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Signature not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete signature" });
    }
  });

  // Upload image
  app.post("/api/upload", upload.single("image"), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { originalname, filename, mimetype, size } = req.file;
      const extension = path.extname(originalname);
      const newFilename = `${filename}${extension}`;
      const newPath = path.join("uploads", newFilename);

      // Rename file to include extension
      await fs.rename(req.file.path, newPath);

      // Return file info
      res.json({
        id: filename,
        filename: newFilename,
        originalName: originalname,
        mimetype,
        size,
        url: `/api/files/${newFilename}`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Serve uploaded files
  app.get("/api/files/:filename", async (req, res) => {
    try {
      const filePath = path.join("uploads", req.params.filename);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({ message: "File not found" });
      }

      res.sendFile(path.resolve(filePath));
    } catch (error) {
      res.status(500).json({ message: "Failed to serve file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
