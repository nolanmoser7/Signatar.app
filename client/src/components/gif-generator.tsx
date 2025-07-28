import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, Download, Copy, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { renderFadeInFrame, renderPulseFrame, renderCrossDissolveFrame } from "@/lib/animations";
import type { PersonalInfo, SocialMedia, Images, AnimationType } from "@shared/schema";

// Import gif.js (assuming it's available via CDN or npm)
declare global {
  interface Window {
    GIF: any;
  }
}

interface GifGeneratorProps {
  personalInfo: PersonalInfo;
  images: Images;
  socialMedia: SocialMedia;
  animationType: AnimationType;
  templateId: string;
  onClose: () => void;
}

export default function GifGenerator({
  personalInfo,
  images,
  socialMedia,
  animationType,
  templateId,
  onClose,
}: GifGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [generatedGifUrl, setGeneratedGifUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Load gif.js library if not already loaded
  useEffect(() => {
    if (!window.GIF) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js";
      script.async = true;
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);

  const generateGif = async () => {
    if (!window.GIF) {
      toast({
        title: "Library Loading",
        description: "GIF library is still loading. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setCurrentStep("Setting up canvas...");

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not available");

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      // Set canvas size
      canvas.width = 600;
      canvas.height = 300;

      setCurrentStep("Initializing GIF encoder...");
      setProgress(10);

      // Initialize gif.js
      const gif = new window.GIF({
        workers: 2,
        quality: 10,
        width: canvas.width,
        height: canvas.height,
        workerScript: "https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js",
      });

      setCurrentStep("Loading images...");
      setProgress(20);

      // Load images
      const loadedImages: { [key: string]: HTMLImageElement } = {};
      
      for (const [key, url] of Object.entries(images)) {
        if (url) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
          });
          loadedImages[key] = img;
        }
      }

      setCurrentStep("Rendering animation frames...");
      setProgress(40);

      // Generate frames based on animation type
      const frameCount = 20;
      const frameDuration = 100; // milliseconds

      for (let frame = 0; frame < frameCount; frame++) {
        const progress = frame / (frameCount - 1);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Render signature based on animation type
        await renderSignatureFrame(ctx, progress, loadedImages);
        
        // Add frame to GIF
        gif.addFrame(canvas, { delay: frameDuration });
        
        setProgress(40 + (frame / frameCount) * 40);
      }

      setCurrentStep("Generating GIF file...");
      setProgress(80);

      // Render GIF
      gif.on("finished", (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        setGeneratedGifUrl(url);
        setProgress(100);
        setCurrentStep("Complete!");
        setIsGenerating(false);
        
        toast({
          title: "GIF Generated!",
          description: "Your animated signature is ready to download.",
        });
      });

      gif.render();

    } catch (error) {
      console.error("GIF generation error:", error);
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate GIF",
        variant: "destructive",
      });
    }
  };

  const renderSignatureFrame = async (
    ctx: CanvasRenderingContext2D,
    progress: number,
    loadedImages: { [key: string]: HTMLImageElement }
  ) => {
    const renderSignature = (ctx: CanvasRenderingContext2D, opacity: number, scale = 1) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      
      // Apply scale transformation
      if (scale !== 1) {
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);
      }

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Background image if available
      if (loadedImages.background) {
        ctx.globalAlpha = opacity * 0.1;
        ctx.drawImage(loadedImages.background, 0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.globalAlpha = opacity;
      }

      const startX = 50;
      const startY = 80;

      // Headshot
      if (loadedImages.headshot) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(startX + 40, startY, 40, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(loadedImages.headshot, startX, startY - 40, 80, 80);
        ctx.restore();
        
        // Border
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(startX + 40, startY, 40, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Text content
      ctx.fillStyle = "#1f2937";
      ctx.font = "bold 24px Inter, Arial, sans-serif";
      ctx.fillText(personalInfo.name || "Your Name", startX + 120, startY - 20);

      ctx.fillStyle = "#6366f1";
      ctx.font = "600 18px Inter, Arial, sans-serif";
      ctx.fillText(personalInfo.title || "Your Title", startX + 120, startY + 5);

      ctx.fillStyle = "#6b7280";
      ctx.font = "500 16px Inter, Arial, sans-serif";
      ctx.fillText(personalInfo.company || "Your Company", startX + 120, startY + 30);

      // Contact info
      let contactY = startY + 60;
      ctx.fillStyle = "#374151";
      ctx.font = "14px Inter, Arial, sans-serif";

      if (personalInfo.email) {
        ctx.fillText(`✉ ${personalInfo.email}`, startX + 120, contactY);
        contactY += 20;
      }

      if (personalInfo.phone) {
        ctx.fillText(`📞 ${personalInfo.phone}`, startX + 120, contactY);
        contactY += 20;
      }

      if (personalInfo.website) {
        ctx.fillText(`🌐 ${personalInfo.website}`, startX + 120, contactY);
      }

      // Company logo
      if (loadedImages.logo) {
        const logoWidth = 80;
        const logoHeight = 48;
        ctx.drawImage(
          loadedImages.logo,
          ctx.canvas.width - logoWidth - 50,
          startY - 20,
          logoWidth,
          logoHeight
        );
      }

      ctx.restore();
    };

    // Apply animation-specific rendering
    switch (animationType) {
      case "fade-in":
        renderFadeInFrame(ctx, progress, renderSignature);
        break;
      case "pulse":
        renderPulseFrame(ctx, progress, renderSignature);
        break;
      case "cross-dissolve":
        renderCrossDissolveFrame(ctx, progress, renderSignature);
        break;
      default:
        renderSignature(ctx, 1);
    }
  };

  const downloadGif = () => {
    if (generatedGifUrl) {
      const link = document.createElement("a");
      link.href = generatedGifUrl;
      link.download = `email-signature-${Date.now()}.gif`;
      link.click();
    }
  };

  const copyGifUrl = async () => {
    if (generatedGifUrl) {
      try {
        await navigator.clipboard.writeText(generatedGifUrl);
        toast({
          title: "URL Copied!",
          description: "GIF URL has been copied to clipboard.",
        });
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Failed to copy URL to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral">Generate Animated Signature</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {!generatedGifUrl ? (
          <div className="text-center">
            {!isGenerating ? (
              <>
                <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="text-warning text-2xl" />
                </div>
                <h4 className="text-lg font-semibold text-neutral mb-2">Ready to Generate</h4>
                <p className="text-gray-600 mb-6">
                  Create an animated GIF version of your email signature with {animationType.replace("-", " ")} animation.
                </p>
                <Button onClick={generateGif} className="w-full">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate GIF
                </Button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="text-warning text-2xl animate-pulse" />
                </div>
                <h4 className="text-lg font-semibold text-neutral mb-2">Generating Your Signature</h4>
                <p className="text-gray-600 mb-4">Processing animations and creating GIF file...</p>
                <Progress value={progress} className="w-full mb-2" />
                <p className="text-sm text-gray-500">{currentStep}</p>
              </>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="text-success text-2xl" />
            </div>
            <h4 className="text-lg font-semibold text-neutral mb-2">Signature Generated!</h4>
            <p className="text-gray-600 mb-6">Your animated email signature is ready to download.</p>
            
            {/* Preview */}
            <div className="mb-6">
              <img src={generatedGifUrl} alt="Generated signature" className="mx-auto border rounded" />
            </div>
            
            <div className="flex space-x-3">
              <Button onClick={downloadGif} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download GIF
              </Button>
              <Button variant="outline" onClick={copyGifUrl} className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy URL
              </Button>
            </div>
          </div>
        )}

        {/* Hidden canvas for rendering */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </Card>
    </div>
  );
}
