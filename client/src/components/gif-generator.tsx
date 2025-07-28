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
      
      // Don't apply global opacity and scale for sales professional template
      if (templateId !== "sales-professional") {
        ctx.globalAlpha = opacity;
        
        // Apply scale transformation
        if (scale !== 1) {
          const centerX = ctx.canvas.width / 2;
          const centerY = ctx.canvas.height / 2;
          ctx.translate(centerX, centerY);
          ctx.scale(scale, scale);
          ctx.translate(-centerX, -centerY);
        }
      }

      if (templateId === "sales-professional") {
        // Sales Professional template - modern design
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Add shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        
        // Main container with rounded corners
        ctx.fillStyle = "#ffffff";
        ctx.roundRect(20, 30, ctx.canvas.width - 40, 240, 12);
        ctx.fill();
        
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Left sidebar with animation
        ctx.save();
        if (animationType === "fade-in") {
          ctx.globalAlpha = opacity;
        } else if (animationType === "pulse") {
          const pulseScale = 1 + 0.1 * Math.sin(progress * Math.PI * 4);
          ctx.translate(60, 150);
          ctx.scale(pulseScale, pulseScale);
          ctx.translate(-60, -150);
        }
        
        ctx.fillStyle = "#4ECDC4";
        ctx.fillRect(20, 30, 80, 240);
        
        // Round left corners
        ctx.clearRect(20, 30, 12, 12);
        ctx.clearRect(20, 258, 12, 12);
        ctx.beginPath();
        ctx.arc(32, 42, 12, Math.PI, 1.5 * Math.PI);
        ctx.arc(32, 258, 12, 0.5 * Math.PI, Math.PI);
        ctx.fill();

        // Social icons in sidebar
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px Arial, sans-serif";
        let socialY = 60;
        if (socialMedia.twitter) {
          ctx.fillText("❌", 45, socialY);
          socialY += 24;
        }
        if (socialMedia.linkedin) {
          ctx.fillText("💼", 45, socialY);
          socialY += 24;
        }
        if (socialMedia.instagram) {
          ctx.fillText("📷", 45, socialY);
          socialY += 24;
        }
        if (socialMedia.youtube) {
          ctx.fillText("📺", 45, socialY);
          socialY += 24;
        }
        if (socialMedia.tiktok) {
          ctx.fillText("🎵", 45, socialY);
          socialY += 24;
        }
        // Default YouTube icon at bottom if no YouTube link
        if (!socialMedia.youtube) {
          ctx.fillText("📺", 45, 250);
        }
        ctx.restore();

        // Company branding section with animation
        const contentX = 120;
        
        ctx.save();
        if (animationType === "fade-in") {
          ctx.globalAlpha = opacity;
        } else if (animationType === "pulse") {
          const pulseScale = 1 + 0.1 * Math.sin(progress * Math.PI * 4);
          ctx.translate(contentX + 24, 74);
          ctx.scale(pulseScale, pulseScale);
          ctx.translate(-(contentX + 24), -74);
        }
        
        // Company logo background
        ctx.fillStyle = "#4ECDC4";
        ctx.fillRect(contentX, 50, 48, 48);
        ctx.roundRect(contentX, 50, 48, 48, 8);
        ctx.fill();
        
        // Logo or initial
        if (loadedImages.logo) {
          ctx.drawImage(loadedImages.logo, contentX + 8, 58, 32, 32);
        } else {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 18px Helvetica, Arial, sans-serif";
          ctx.fillText("J", contentX + 20, 80);
        }
        ctx.restore();

        // Company name
        ctx.fillStyle = "#333333";
        ctx.font = "bold 24px Helvetica, Arial, sans-serif";
        const companyName = (personalInfo.company || "COMPANY").toUpperCase();
        ctx.fillText(companyName, contentX + 60, 75);
        
        // "GRAPHICS" subtitle
        ctx.fillStyle = "#777777";
        ctx.font = "12px Helvetica, Arial, sans-serif";
        ctx.fillText("GRAPHICS", contentX + 60, 90);

        // Name with checkmark
        ctx.fillStyle = "#333333";
        ctx.font = "bold 32px Helvetica, Arial, sans-serif";
        const nameText = personalInfo.name || "Your Name";
        ctx.fillText(nameText, contentX, 130);
        
        // Checkmark
        ctx.fillStyle = "#4ECDC4";
        const nameWidth = ctx.measureText(nameText).width;
        ctx.fillText("✓", contentX + nameWidth + 8, 130);

        // Title
        ctx.fillStyle = "#666666";
        ctx.font = "20px Helvetica, Arial, sans-serif";
        ctx.fillText(personalInfo.title || "Your Title", contentX, 155);

        // Contact information
        ctx.fillStyle = "#333333";
        ctx.font = "16px Helvetica, Arial, sans-serif";
        let contactY = 185;

        if (personalInfo.phone) {
          ctx.fillText(`📞 ${personalInfo.phone}`, contentX, contactY);
          contactY += 24;
        }

        if (personalInfo.email) {
          ctx.fillText(`✉️ ${personalInfo.email}`, contentX, contactY);
          contactY += 24;
        }

        if (personalInfo.website) {
          ctx.fillText(`🌐 ${personalInfo.website}`, contentX, contactY);
        }

        // Portrait section with clipping and animation
        const portraitX = ctx.canvas.width - 240;
        const portraitY = 30;
        const portraitWidth = 220;
        const portraitHeight = 240;

        // Create clipping path for angled portrait
        ctx.save();
        
        // Apply animation to portrait
        if (animationType === "fade-in") {
          ctx.globalAlpha = opacity;
        } else if (animationType === "pulse") {
          const pulseScale = 1 + 0.05 * Math.sin(progress * Math.PI * 4);
          ctx.translate(portraitX + portraitWidth/2, portraitY + portraitHeight/2);
          ctx.scale(pulseScale, pulseScale);
          ctx.translate(-(portraitX + portraitWidth/2), -(portraitY + portraitHeight/2));
        }
        
        ctx.beginPath();
        ctx.moveTo(portraitX + portraitWidth * 0.25, portraitY);
        ctx.lineTo(portraitX + portraitWidth, portraitY);
        ctx.lineTo(portraitX + portraitWidth, portraitY + portraitHeight);
        ctx.lineTo(portraitX, portraitY + portraitHeight);
        ctx.closePath();
        ctx.clip();

        if (loadedImages.headshot) {
          ctx.drawImage(loadedImages.headshot, portraitX, portraitY, portraitWidth, portraitHeight);
          
          // Overlay gradient
          const gradient = ctx.createLinearGradient(portraitX, portraitY, portraitX + portraitWidth, portraitY + portraitHeight);
          gradient.addColorStop(0, "rgba(78, 205, 196, 0.2)");
          gradient.addColorStop(1, "rgba(107, 114, 128, 0.2)");
          ctx.fillStyle = gradient;
          ctx.fillRect(portraitX, portraitY, portraitWidth, portraitHeight);
        } else {
          // Default background
          const gradient = ctx.createLinearGradient(portraitX, portraitY, portraitX + portraitWidth, portraitY + portraitHeight);
          gradient.addColorStop(0, "#E5E7EB");
          gradient.addColorStop(1, "#9CA3AF");
          ctx.fillStyle = gradient;
          ctx.fillRect(portraitX, portraitY, portraitWidth, portraitHeight);
        }
        
        ctx.restore();

        // Geometric decorations
        ctx.save();
        ctx.globalAlpha = 0.3;
        
        // Teal square
        ctx.fillStyle = "#4ECDC4";
        ctx.translate(portraitX + 80, portraitY + 64);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-64, -64, 128, 128);
        ctx.restore();
        
        ctx.save();
        ctx.globalAlpha = 0.4;
        
        // Gray square
        ctx.fillStyle = "#6B7280";
        ctx.translate(portraitX + 160, portraitY + 128);
        ctx.rotate(-Math.PI / 15);
        ctx.fillRect(-48, -48, 96, 96);
        ctx.restore();

      } else if (templateId === "minimal") {
        // Minimal template rendering
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Border
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;
        ctx.strokeRect(20, 20, ctx.canvas.width - 40, ctx.canvas.height - 40);
        
        const contentX = 60;
        const contentY = 80;
        
        // Company logo with animation
        ctx.save();
        if (animationType === "fade-in") {
          ctx.globalAlpha = opacity;
        } else if (animationType === "pulse") {
          const pulseScale = 1 + 0.1 * Math.sin(progress * Math.PI * 4);
          ctx.translate(contentX + 24, contentY);
          ctx.scale(pulseScale, pulseScale);
          ctx.translate(-(contentX + 24), contentY);
        }
        
        // Apex logo recreation
        ctx.fillStyle = "#7C3AED";
        ctx.save();
        ctx.translate(contentX + 24, contentY);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-16, -16, 32, 32);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-6, -6, 12, 12);
        ctx.restore();
        
        // Company text
        ctx.fillStyle = "#1f2937";
        ctx.font = "bold 24px Arial, sans-serif";
        ctx.fillText((personalInfo.company || "APEX").toUpperCase(), contentX + 60, contentY - 5);
        if (!personalInfo.company) {
          ctx.font = "14px Arial, sans-serif";
          ctx.fillText("SOLUTIONS", contentX + 60, contentY + 15);
        }
        ctx.restore();
        
        // Name and title
        ctx.fillStyle = "#1f2937";
        ctx.font = "bold 36px Arial, sans-serif";
        ctx.fillText(personalInfo.name || "Mark Johnson", contentX, contentY + 80);
        
        ctx.font = "18px Arial, sans-serif";
        ctx.fillStyle = "#6b7280";
        ctx.fillText(personalInfo.title || "Marketing Manager", contentX, contentY + 110);
        
        // Contact info
        let contactY = contentY + 150;
        ctx.font = "16px Arial, sans-serif";
        ctx.fillStyle = "#1f2937";
        
        if (personalInfo.phone) {
          ctx.fillText(`📞 ${personalInfo.phone}`, contentX, contactY);
          contactY += 25;
        }
        if (personalInfo.email) {
          ctx.fillText(`✉️ ${personalInfo.email}`, contentX, contactY);
          contactY += 25;
        }
        if (personalInfo.website) {
          ctx.fillText(`🌐 ${personalInfo.website}`, contentX, contactY);
        }
        
        // Portrait with animation
        const portraitX = ctx.canvas.width - 200;
        const portraitY = contentY + 20;
        const portraitSize = 140;
        
        ctx.save();
        if (animationType === "fade-in") {
          ctx.globalAlpha = opacity;
        } else if (animationType === "pulse") {
          const pulseScale = 1 + 0.05 * Math.sin(progress * Math.PI * 4);
          ctx.translate(portraitX + portraitSize/2, portraitY + portraitSize/2);
          ctx.scale(pulseScale, pulseScale);
          ctx.translate(-(portraitX + portraitSize/2), -(portraitY + portraitSize/2));
        }
        
        // Gradient border
        const gradient = ctx.createLinearGradient(portraitX, portraitY, portraitX + portraitSize, portraitY + portraitSize);
        gradient.addColorStop(0, "#A855F7");
        gradient.addColorStop(0.5, "#3B82F6");
        gradient.addColorStop(1, "#06B6D4");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(portraitX + portraitSize/2, portraitY + portraitSize/2, portraitSize/2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Inner white circle
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(portraitX + portraitSize/2, portraitY + portraitSize/2, portraitSize/2 - 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Portrait image or placeholder
        ctx.save();
        ctx.beginPath();
        ctx.arc(portraitX + portraitSize/2, portraitY + portraitSize/2, portraitSize/2 - 8, 0, 2 * Math.PI);
        ctx.clip();
        
        if (loadedImages.headshot) {
          ctx.drawImage(loadedImages.headshot, portraitX + 8, portraitY + 8, portraitSize - 16, portraitSize - 16);
        } else {
          const portraitGradient = ctx.createLinearGradient(portraitX, portraitY, portraitX + portraitSize, portraitY + portraitSize);
          portraitGradient.addColorStop(0, "#A855F7");
          portraitGradient.addColorStop(0.5, "#3B82F6");
          portraitGradient.addColorStop(1, "#06B6D4");
          ctx.fillStyle = portraitGradient;
          ctx.fillRect(portraitX + 8, portraitY + 8, portraitSize - 16, portraitSize - 16);
        }
        ctx.restore();
        ctx.restore();
        
        // Social media icons with animation
        const socialY = portraitY + portraitSize + 30;
        const socialStartX = portraitX - 20;
        
        ctx.save();
        if (animationType === "fade-in") {
          ctx.globalAlpha = opacity;
        } else if (animationType === "pulse") {
          const pulseScale = 1 + 0.1 * Math.sin(progress * Math.PI * 4);
          ctx.translate(socialStartX + 100, socialY);
          ctx.scale(pulseScale, pulseScale);
          ctx.translate(-(socialStartX + 100), -socialY);
        }
        
        let socialX = socialStartX;
        const socialIcons = [
          { active: socialMedia.linkedin, emoji: "💼" },
          { active: socialMedia.twitter, emoji: "🐦" },
          { active: socialMedia.instagram, emoji: "📷" },
          { active: socialMedia.youtube, emoji: "📺" },
          { active: socialMedia.tiktok, emoji: "🎵" }
        ];
        
        // Add default circular icon if no social media is present
        if (!socialMedia.linkedin && !socialMedia.twitter && !socialMedia.instagram && !socialMedia.youtube && !socialMedia.tiktok) {
          socialIcons.push({ active: true, emoji: "⚪" });
        }
        
        socialIcons.forEach(({ active, emoji }) => {
          if (active) {
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.arc(socialX + 20, socialY, 20, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = "#ffffff";
            ctx.font = "16px Arial, sans-serif";
            ctx.fillText(emoji, socialX + 14, socialY + 6);
            
            socialX += 50;
          }
        });
        ctx.restore();

      } else {
        // Default template rendering
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
