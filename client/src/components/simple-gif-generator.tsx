import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Download, Copy } from "lucide-react";

interface SimpleGifGeneratorProps {
  signature: any;
  onClose?: () => void;
}

export function SimpleGifGenerator({ signature, onClose }: SimpleGifGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [generatedFrames, setGeneratedFrames] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const generateSimpleGif = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);
      setCurrentStep("Preparing canvas...");

      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not available");

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      // Set canvas size
      canvas.width = 600;
      canvas.height = 300;

      setCurrentStep("Loading images...");
      setProgress(20);

      // Load images
      const loadedImages: { [key: string]: HTMLImageElement } = {};
      const imageKeys = ["headshot", "logo"];
      
      for (const key of imageKeys) {
        const url = signature.images?.[key];
        if (url && typeof url === "string") {
          try {
            const img = new Image();
            img.crossOrigin = "anonymous";
            
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = url;
            });
            loadedImages[key] = img;
          } catch (error) {
            console.warn(`Skipping image ${key}:`, error);
          }
        }
      }

      setCurrentStep("Generating frames...");
      setProgress(40);

      // Generate multiple frames for animation
      const frames: string[] = [];
      const frameCount = 10;
      
      for (let frame = 0; frame < frameCount; frame++) {
        const progress = frame / (frameCount - 1);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Render signature frame
        await renderFrame(ctx, progress, loadedImages, signature);
        
        // Capture frame as data URL
        frames.push(canvas.toDataURL("image/png"));
        
        setProgress(40 + (frame / frameCount) * 40);
      }

      setGeneratedFrames(frames);
      setProgress(100);
      setCurrentStep("Complete!");
      setIsGenerating(false);
      
      toast({
        title: "Animation Generated!",
        description: "Your animated signature frames are ready to view.",
      });

    } catch (error) {
      console.error("Simple GIF generation error:", error);
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate animation",
        variant: "destructive",
      });
    }
  };

  const renderFrame = async (
    ctx: CanvasRenderingContext2D,
    progress: number,
    loadedImages: { [key: string]: HTMLImageElement },
    signature: any
  ) => {
    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Get animation values
    const getAnimationValues = (animationType: string) => {
      let opacity = 1;
      let scale = 1;

      if (animationType === "fade-in") {
        opacity = progress;
      } else if (animationType === "zoom-in") {
        scale = 0.5 + (0.5 * progress);
        opacity = progress;
      } else if (animationType === "pulse") {
        opacity = 0.7 + 0.3 * Math.sin(progress * Math.PI * 4);
      }

      return { opacity, scale };
    };

    // Render name with animation
    const nameAnimation = getAnimationValues(signature.elementAnimations?.name || "fade-in");
    ctx.save();
    ctx.globalAlpha = nameAnimation.opacity;
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 28px Arial";
    ctx.fillText(signature.personalInfo?.name || "Your Name", 50, 80);
    ctx.restore();

    // Render title with animation
    const titleAnimation = getAnimationValues(signature.elementAnimations?.title || "fade-in");
    ctx.save();
    ctx.globalAlpha = titleAnimation.opacity;
    ctx.fillStyle = "#666666";
    ctx.font = "18px Arial";
    ctx.fillText(signature.personalInfo?.title || "Your Title", 50, 110);
    ctx.restore();

    // Render contact info with animation
    const contactAnimation = getAnimationValues(signature.elementAnimations?.contact || "fade-in");
    ctx.save();
    ctx.globalAlpha = contactAnimation.opacity;
    ctx.fillStyle = "#333333";
    ctx.font = "14px Arial";
    let yPos = 140;
    
    if (signature.personalInfo?.email) {
      ctx.fillText(`📧 ${signature.personalInfo.email}`, 50, yPos);
      yPos += 25;
    }
    if (signature.personalInfo?.phone) {
      ctx.fillText(`📞 ${signature.personalInfo.phone}`, 50, yPos);
      yPos += 25;
    }
    if (signature.personalInfo?.website) {
      ctx.fillText(`🌐 ${signature.personalInfo.website}`, 50, yPos);
    }
    ctx.restore();

    // Render headshot with animation
    if (loadedImages.headshot) {
      const headshotAnimation = getAnimationValues(signature.elementAnimations?.headshot || "fade-in");
      ctx.save();
      ctx.globalAlpha = headshotAnimation.opacity;
      
      if (headshotAnimation.scale !== 1) {
        ctx.translate(500, 100);
        ctx.scale(headshotAnimation.scale, headshotAnimation.scale);
        ctx.translate(-500, -100);
      }
      
      ctx.drawImage(loadedImages.headshot, 450, 50, 100, 100);
      ctx.restore();
    }

    // Render logo with animation
    if (loadedImages.logo) {
      const logoAnimation = getAnimationValues(signature.elementAnimations?.logo || "fade-in");
      ctx.save();
      ctx.globalAlpha = logoAnimation.opacity;
      
      if (logoAnimation.scale !== 1) {
        ctx.translate(500, 200);
        ctx.scale(logoAnimation.scale, logoAnimation.scale);
        ctx.translate(-500, -200);
      }
      
      ctx.drawImage(loadedImages.logo, 450, 180, 80, 48);
      ctx.restore();
    }
  };

  const downloadFrames = () => {
    generatedFrames.forEach((frame, index) => {
      const link = document.createElement("a");
      link.href = frame;
      link.download = `signature-frame-${index + 1}.png`;
      link.click();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Wand2 className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Simple Animation Generator</h3>
      </div>

      {isGenerating && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">{currentStep}</p>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded-lg"
        style={{ maxWidth: "100%", height: "auto" }}
      />

      <div className="flex gap-2">
        <Button
          onClick={generateSimpleGif}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          <Wand2 className="h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Animation"}
        </Button>

        {generatedFrames.length > 0 && (
          <Button
            onClick={downloadFrames}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Frames
          </Button>
        )}

        {onClose && (
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        )}
      </div>

      {generatedFrames.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Generated Frames:</h4>
          <div className="grid grid-cols-5 gap-2">
            {generatedFrames.map((frame, index) => (
              <img
                key={index}
                src={frame}
                alt={`Frame ${index + 1}`}
                className="border border-gray-200 rounded"
                style={{ width: "100px", height: "auto" }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}