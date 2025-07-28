import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, Download, Copy, Dock, Smartphone, Play } from "lucide-react";
import TemplateSelector from "@/components/template-selector";
import PersonalInfoForm from "@/components/personal-info-form";
import ImageUploader from "@/components/image-uploader";
import AnimationSelector from "@/components/animation-selector";
import SocialMediaForm from "@/components/social-media-form";
import SignaturePreview from "@/components/signature-preview";
import GifGenerator from "@/components/gif-generator";
import { useToast } from "@/hooks/use-toast";
import type { PersonalInfo, SocialMedia, Images, AnimationType } from "@shared/schema";

export default function SignatureBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    title: "",
    company: "",
    email: "",
    phone: "",
    website: "",
  });
  const [images, setImages] = useState<Images>({});
  const [animationType, setAnimationType] = useState<AnimationType>("fade-in");
  const [socialMedia, setSocialMedia] = useState<SocialMedia>({});
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showGifGenerator, setShowGifGenerator] = useState(false);
  
  const { toast } = useToast();

  const handlePlayAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 2500);
  };

  const handleCopyHtml = async () => {
    try {
      // Generate HTML version of the signature
      const htmlContent = generateSignatureHtml();
      await navigator.clipboard.writeText(htmlContent);
      toast({
        title: "HTML Copied!",
        description: "Signature HTML has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy HTML to clipboard.",
        variant: "destructive",
      });
    }
  };

  const generateSignatureHtml = (): string => {
    return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right: 20px; vertical-align: top;">
            ${images.headshot ? `<img src="${images.headshot}" alt="${personalInfo.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb;" />` : ''}
          </td>
          <td style="vertical-align: top;">
            <h3 style="margin: 0 0 4px 0; font-size: 18px; font-weight: bold; color: #1f2937;">${personalInfo.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #6366f1;">${personalInfo.title}</p>
            <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 500; color: #6b7280;">${personalInfo.company}</p>
            <div style="font-size: 13px; line-height: 1.6;">
              ${personalInfo.email ? `<div style="margin-bottom: 4px;"><span style="color: #6366f1;">✉</span> ${personalInfo.email}</div>` : ''}
              ${personalInfo.phone ? `<div style="margin-bottom: 4px;"><span style="color: #6366f1;">📞</span> ${personalInfo.phone}</div>` : ''}
              ${personalInfo.website ? `<div style="margin-bottom: 4px;"><span style="color: #6366f1;">🌐</span> ${personalInfo.website}</div>` : ''}
            </div>
            <div style="margin-top: 16px;">
              ${socialMedia.linkedin ? `<a href="${socialMedia.linkedin}" style="display: inline-block; margin-right: 8px; width: 32px; height: 32px; background-color: #0077b5; border-radius: 50%; text-align: center; line-height: 32px; color: white; text-decoration: none;">in</a>` : ''}
              ${socialMedia.twitter ? `<a href="${socialMedia.twitter}" style="display: inline-block; margin-right: 8px; width: 32px; height: 32px; background-color: #1da1f2; border-radius: 50%; text-align: center; line-height: 32px; color: white; text-decoration: none;">tw</a>` : ''}
              ${socialMedia.instagram ? `<a href="${socialMedia.instagram}" style="display: inline-block; margin-right: 8px; width: 32px; height: 32px; background-color: #e4405f; border-radius: 50%; text-align: center; line-height: 32px; color: white; text-decoration: none;">ig</a>` : ''}
            </div>
          </td>
          <td style="padding-left: 20px; vertical-align: top;">
            ${images.logo ? `<img src="${images.logo}" alt="${personalInfo.company} logo" style="height: 48px; width: auto; object-fit: contain;" />` : ''}
          </td>
        </tr>
      </table>
    </div>`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">S</span>
              </div>
              <h1 className="text-xl font-semibold text-neutral">SignaturePro</h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" className="text-gray-600">
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
            <Button onClick={() => setShowGifGenerator(true)}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-8">
            <TemplateSelector 
              selectedTemplate={selectedTemplate}
              onSelectTemplate={setSelectedTemplate}
            />
            
            <PersonalInfoForm 
              personalInfo={personalInfo}
              onPersonalInfoChange={setPersonalInfo}
            />
            
            <ImageUploader 
              images={images}
              onImagesChange={setImages}
            />
            
            <AnimationSelector 
              selectedAnimation={animationType}
              onAnimationChange={setAnimationType}
            />
            
            <SocialMediaForm 
              socialMedia={socialMedia}
              onSocialMediaChange={setSocialMedia}
            />
          </div>
        </aside>

        {/* Main Preview Area */}
        <main className="flex-1 flex flex-col">
          {/* Preview Toolbar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-neutral">Preview</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={deviceView === "desktop" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setDeviceView("desktop")}
                  >
                    <Dock className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={deviceView === "mobile" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setDeviceView("mobile")}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  <span>Live Preview</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleCopyHtml}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy HTML
                </Button>
                <Button variant="outline" size="sm" className="bg-warning text-white hover:bg-warning/90" onClick={() => setShowGifGenerator(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Generate GIF
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-gray-100 p-8 overflow-auto">
            <div className="max-w-2xl mx-auto space-y-6">
              <SignaturePreview
                personalInfo={personalInfo}
                images={images}
                socialMedia={socialMedia}
                animationType={animationType}
                templateId={selectedTemplate}
                isAnimating={isAnimating}
                deviceView={deviceView}
              />

              {/* Animation Preview Controls */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-neutral">Animation Preview</h3>
                  <Button onClick={handlePlayAnimation} size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Play Animation
                  </Button>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span>Current: {animationType.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span>Duration: 2.0s</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* GIF Generator Modal */}
      {showGifGenerator && (
        <GifGenerator
          personalInfo={personalInfo}
          images={images}
          socialMedia={socialMedia}
          animationType={animationType}
          templateId={selectedTemplate}
          onClose={() => setShowGifGenerator(false)}
        />
      )}
    </div>
  );
}
