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
  const [selectedTemplate, setSelectedTemplate] = useState("sales-professional");
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
    if (selectedTemplate === "sales-professional") {
      return `
<table cellpadding="0" cellspacing="0" style="width:600px; background:#FFFFFF; border:1px solid #E0E0E0; border-radius:8px; font-family:Helvetica, Arial, sans-serif; color:#333333;">
  <tr>
    <td style="width:8px; background:#4ECDC4; border-top-left-radius:8px; border-bottom-left-radius:8px;"></td>
    <td style="width:100px; padding:12px 10px; vertical-align:top; text-align:center;">
      ${images.headshot ? `<img src="${images.headshot}" alt="${personalInfo.name}" width="80" style="display:block; margin:0 auto; border-radius:50%; border:2px solid #4ECDC4;">` : ''}
    </td>
    <td style="padding:12px 10px; vertical-align:top;">
      ${images.logo ? `<img src="${images.logo}" alt="Logo" width="100" style="display:block; margin-bottom:8px;">` : ''}
      <p style="margin:0; font-size:18px; font-weight:bold; color:#4ECDC4;">${personalInfo.name || 'Your Name'}</p>
      <p style="margin:4px 0 12px; font-size:12px; color:#777777; text-transform:uppercase; letter-spacing:1px;">${personalInfo.title || 'Your Title'}</p>
      ${personalInfo.phone ? `<p style="margin:6px 0; font-size:14px;">📞 <a href="tel:${personalInfo.phone}" style="color:#333333; text-decoration:none;">${personalInfo.phone}</a></p>` : ''}
      ${personalInfo.email ? `<p style="margin:6px 0; font-size:14px;">✉️ <a href="mailto:${personalInfo.email}" style="color:#333333; text-decoration:none;">${personalInfo.email}</a></p>` : ''}
      ${personalInfo.website ? `<p style="margin:6px 0; font-size:14px;">🌐 <a href="${personalInfo.website}" style="color:#333333; text-decoration:none;">${personalInfo.website}</a></p>` : ''}
    </td>
    <td style="padding:12px 10px; vertical-align:top; text-align:right;">
      <a href="${personalInfo.website || '#'}" style="display:inline-block; padding:8px 14px; background:#4ECDC4; color:#FFFFFF; text-decoration:none; border-radius:4px; font-size:13px; margin-bottom:8px;">Schedule Call</a><br>
      <a href="mailto:${personalInfo.email || '#'}" style="display:inline-block; padding:8px 14px; background:#FF6B6B; color:#FFFFFF; text-decoration:none; border-radius:4px; font-size:13px;">Get Quote</a>
      <div style="margin-top:12px;">
        ${socialMedia.linkedin ? `<a href="${socialMedia.linkedin}" style="margin:0 4px; text-decoration:none;"><img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwNzdCNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwLjQ0NyAyMC40NTJoLTMuNTU0di01LjU2OWMwLTEuMzI4LS4wMjctMy4wMzctMS44NTItMy4wMzctMS44NTMgMC0yLjEzNiAxLjQ0NS0yLjEzNiAyLjkzOXY1LjY2N0g5LjM1MVY5aDMuNDE0djEuNTYxaC4wNDZjLjQ3Ny0uOSAxLjYzNy0xLjg1IDMuMzctMS44NSAzLjYwMSAwIDQuMjY3IDIuMzcgNC4yNjcgNS40NTV2Ni4yODZ6TTUuMzM3IDcuNDMzYTIuMDYyIDIuMDYyIDAgMCAxLTIuMDYzLTIuMDY1IDIuMDY0IDIuMDY0IDAgMSAxIDIuMDYzIDIuMDY1em0xLjc4MiAxMy4wMTlIMy41NTVWOWgzLjU2NHYxMS40NTJ6TTIyLjIyNSAwSDEuNzcxQy43OTIgMCAwIC43NzQgMCAxLjcyOXYyMC41NDJDMCAyMy4yMjcuNzkyIDI0IDEuNzcxIDI0aDIwLjQ1MUMyMy4yIDI0IDI0IDIzLjIyNyAyNCAyMi4yNzFWMS43MjlDMjQgLjc3NCAyMy4yIDAgMjIuMjI1IDB6Ii8+Cjwvc3ZnPgo=" width="20" alt="LinkedIn"></a>` : ''}
        ${socialMedia.twitter ? `<a href="${socialMedia.twitter}" style="margin:0 4px; text-decoration:none;"><img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzFEQTFGMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIzLjk1MyA0LjU3YTEwIDEwIDAgMCAxLTIuODI1Ljc3NSA0Ljk1OCA0Ljk1OCAwIDAgMCAyLjE2My0yLjcyM2MtLjk1MS41NTUtMi4wMDMuOTU5LTMuMTI3IDEuMTg0YTQuOTIgNC45MiAwIDAgMC04LjM4NCA0LjQ4MkM3LjY5IDguMDk1IDQuMDY3IDYuMTMgMS42NCAzLjE2MmE0LjgyMiA0LjgyMiAwIDAgMC0uNjY2IDIuNDc1YzAgMS43MS44NyAzLjIxMyAyLjE4OCA0LjA5NmE0LjkwNCA0LjkwNCAwIDAgMS0yLjIyOC0uNjE2di4wNmE0LjkyMyA0LjkyMyAwIDAgMCAzLjk0NiA0LjgyNyA0Ljk5NiA0Ljk5NiAwIDAgMS0yLjIxMi4wODUgNC45MzYgNC45MzYgMCAwIDAgNC42MDQgMy40MTcgOS44NjcgOS44NjcgMCAwIDEtNi4xMDIgMi4xMDVjLS4zOSAwLS43NzktLjAyMy0xLjE3LS4wNjdhMTMuOTk1IDEzLjk5NSAwIDAgMCA3LjU1NyAyLjIwOWM5LjA1NCAwIDE0LjAwMS04LjUwOCAxNC4wMDEtMTUuODggMC0uMjQxLS4wMDUtLjQ4Mi0uMDE1LS43MjJBMTAuMDI1IDEwLjAyNSAwIDAgMCAyNCA0LjU5eiIvPgo8L3N2Zz4K" width="20" alt="Twitter"></a>` : ''}
        ${socialMedia.instagram ? `<a href="${socialMedia.instagram}" style="margin:0 4px; text-decoration:none;"><img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0U0NDA1RiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDIuMTYzYzMuMjA0IDAgMy41ODQuMDEyIDQuODUuMDcgMy4yNTIuMTQ4IDQuNzcxIDEuNjkxIDQuOTE5IDQuOTE5LjA1OCAxLjI2NS4wNjkgMS42NDUuMDY5IDQuODQ4IDAgMy4yMDQtLjAxMiAzLjU4NC0uMDY5IDQuODQ5LS4xNDkgMy4yMjUtMS42NjQgNC43NzEtNC45MTkgNC45MTktMS4yNjYuMDU4LTEuNjQ0LjA3LTQuODUuMDctMy4yMDQgMC0zLjU4NC0uMDEyLTQuODQ5LS4wNy0zLjI2LS4xNDktNC43NzEtMS42OTktNC45MTktNC45MjQtLjA1Ny0xLjI2NS0uMDctMS42NDQtLjA3LTQuODQ5IDAtMy4yMDQuMDEzLTMuNTgzLjA3LTQuODQ4LjE0OS0zLjIyNyAxLjY2NC00Ljc3MSA0LjkxOS00LjkyIDEuMjY2LS4wNTcgMS42NDUtLjA2OSA0Ljg0OS0uMDY5ek0xMiAwQzguNzQxIDAgOC4zMzMuMDE0IDcuMDUzLjA3MiAyLjY5NS4yNzIuMjczIDIuNjkuMDcyIDcuMDUyLjAxNCA4LjMzMyAwIDguNzQxIDAgMTJzLjAxNCAzLjY2OC4wNzIgNC45NDhjLjIgNC4zNTggMi42MTggNi43OCA2Ljk4IDYuOThDOC4zMzMgMjMuOTg3IDguNzQxIDI0IDEyIDI0czMuNjY4LS4wMTMgNC45NDgtLjA3MmM0LjM1NC0uMiA2Ljc4Mi0yLjYxOCA2Ljk3OS02Ljk4LjA1OS0xLjI4LjA3My0xLjY4OS4wNzMtNC45NDhzLS4wMTQtMy42NjctLjA3Mi00Ljk0N0MyMy45MjcgMi42OSAyMS4zMDUuMjcyIDE2Ljk0OC4wNzIgMTUuNjY4LjAxNCAxNS4yNTkgMCAxMiAweiIvPgo8cGF0aCBkPSJNMTIgNS44MzhBNi4xNjIgNi4xNjIgMCAxIDAgMTggMTJhNi4xNjIgNi4xNjIgMCAwIDAtNi02LjE2MnpNMTIgMTZhNCA0IDAgMSAxIDQtNCA0IDQgMCAwIDEtNCA0ek0xOC40MDYgNC4xNTRhMS40NCAxLjQ0IDAgMSAxLTIuODggMCAxLjQ0IDEuNDQgMCAwIDEgMi44OCAweiIvPgo8L3N2Zz4K" width="20" alt="Instagram"></a>` : ''}
      </div>
    </td>
    <td style="width:8px; background:#4ECDC4; border-top-right-radius:8px; border-bottom-right-radius:8px;"></td>
  </tr>
</table>`;
    }

    // Default template HTML for other templates
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
