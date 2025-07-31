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
import signatarLogo from "@assets/signatar-logo.png";

export default function SignatureBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState("sales-professional");
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "Sarah Johnson",
    title: "Senior Marketing Director",
    company: "Signatar",
    email: "sarah.johnson@signatar.com",
    phone: "+1 (555) 123-4567",
    website: "https://www.signatar.com",
  });
  const [images, setImages] = useState<Images>({ 
    logo: signatarLogo,
    backgroundOpacity: 20,
    headshotSize: 100,
    logoSize: 160
  });
  const [animationType, setAnimationType] = useState<AnimationType>("fade-in");
  const [socialMedia, setSocialMedia] = useState<SocialMedia>({
    linkedin: "https://linkedin.com/in/sarahjohnson",
    twitter: "https://twitter.com/sarahjohnson",
    instagram: "https://instagram.com/sarahjohnson_tech",
    youtube: "https://youtube.com/@signatar",
    tiktok: "https://tiktok.com/@signatar"
  });
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
    if (selectedTemplate === "minimal") {
      return `
<table cellpadding="0" cellspacing="0" style="width:600px; background:#FFFFFF; border-radius:8px; border:1px solid #e5e7eb; font-family:Helvetica, Arial, sans-serif; color:#333333; padding:32px;">
  <tr>
    <td style="vertical-align:top; width:60%;">
      <!-- Company Logo and Name -->
      <div style="display:flex; align-items:center; margin-bottom:24px;">
        <div style="width:48px; height:48px; margin-right:12px; position:relative;">
          ${images.logo ? `<img src="${images.logo}" alt="Logo" style="width:48px; height:48px; object-fit:contain;">` : `
            <div style="width:32px; height:32px; background:#7C3AED; transform:rotate(45deg); border-radius:4px; position:relative;">
              <div style="width:12px; height:12px; background:#FFFFFF; position:absolute; top:10px; left:10px; transform:rotate(-45deg);"></div>
            </div>
          `}
        </div>
        <div>
          <div style="font-size:24px; font-weight:bold; letter-spacing:2px; color:#1f2937;">${(personalInfo.company || 'APEX').toUpperCase()}</div>
          ${personalInfo.company ? '' : '<div style="font-size:14px; color:#6b7280; letter-spacing:4px; margin-top:-4px;">SOLUTIONS</div>'}
        </div>
      </div>
      
      <!-- Name and Title -->
      <div style="margin-bottom:24px;">
        <h1 style="margin:0 0 8px 0; font-size:36px; font-weight:bold; color:#1f2937;">
          ${personalInfo.name || 'Mark Johnson'}
        </h1>
        <p style="margin:0; font-size:18px; color:#6b7280; font-weight:500;">${personalInfo.title || 'Marketing Manager'}</p>
      </div>
      
      <!-- Contact Info -->
      <div style="font-size:16px; line-height:1.8; color:#1f2937;">
        ${personalInfo.phone ? `<div style="margin-bottom:8px; display:flex; align-items:center;"><span style="margin-right:8px;">📞</span> <a href="tel:${personalInfo.phone}" style="color:#1f2937; text-decoration:none;">${personalInfo.phone}</a></div>` : ''}
        ${personalInfo.email ? `<div style="margin-bottom:8px; display:flex; align-items:center;"><span style="margin-right:8px;">✉️</span> <a href="mailto:${personalInfo.email}" style="color:#1f2937; text-decoration:none;">${personalInfo.email}</a></div>` : ''}
        ${personalInfo.website ? `<div style="margin-bottom:8px; display:flex; align-items:center;"><span style="margin-right:8px;">🌐</span> <a href="${personalInfo.website}" style="color:#1f2937; text-decoration:none;">${personalInfo.website}</a></div>` : ''}
      </div>
    </td>
    
    <!-- Right Side - Portrait and Social -->
    <td style="vertical-align:top; text-align:center; width:40%;">
      <!-- Portrait Circle -->
      <div style="margin-bottom:24px;">
        ${images.headshot ? `
          <div style="width:140px; height:140px; border-radius:50%; background:linear-gradient(135deg, #A855F7 0%, #3B82F6 50%, #06B6D4 100%); padding:4px; margin:0 auto;">
            <div style="width:132px; height:132px; border-radius:50%; overflow:hidden; background:#FFFFFF;">
              <img src="${images.headshot}" alt="${personalInfo.name}" style="width:100%; height:100%; object-fit:cover;">
            </div>
          </div>
        ` : `
          <div style="width:140px; height:140px; border-radius:50%; background:linear-gradient(135deg, #A855F7 0%, #3B82F6 50%, #06B6D4 100%); padding:4px; margin:0 auto; display:flex; align-items:center; justify-content:center;">
            <div style="width:132px; height:132px; border-radius:50%; background:linear-gradient(135deg, #A855F7 0%, #3B82F6 50%, #06B6D4 100%); display:flex; align-items:center; justify-content:center;">
              <span style="color:#FFFFFF; font-size:48px; font-weight:bold;">${(personalInfo.name || 'M').charAt(0)}</span>
            </div>
          </div>
        `}
      </div>
      
      <!-- Social Media Icons -->
      <div style="display:flex; justify-content:center; gap:16px;">
        ${socialMedia.linkedin ? `<a href="${socialMedia.linkedin}" style="display:flex; align-items:center; justify-content:center; width:40px; height:40px; background:#000000; border-radius:50%; text-decoration:none;"><span style="color:#FFFFFF; font-size:16px;">💼</span></a>` : ''}
        ${socialMedia.twitter ? `<a href="${socialMedia.twitter}" style="display:flex; align-items:center; justify-content:center; width:40px; height:40px; background:#000000; border-radius:50%; text-decoration:none;"><span style="color:#FFFFFF; font-size:16px;">🐦</span></a>` : ''}
        ${socialMedia.instagram ? `<a href="${socialMedia.instagram}" style="display:flex; align-items:center; justify-content:center; width:40px; height:40px; background:#000000; border-radius:50%; text-decoration:none;"><span style="color:#FFFFFF; font-size:16px;">📷</span></a>` : ''}
        ${socialMedia.youtube ? `<a href="${socialMedia.youtube}" style="display:flex; align-items:center; justify-content:center; width:40px; height:40px; background:#000000; border-radius:50%; text-decoration:none;"><span style="color:#FFFFFF; font-size:16px;">📺</span></a>` : ''}
        ${socialMedia.tiktok ? `<a href="${socialMedia.tiktok}" style="display:flex; align-items:center; justify-content:center; width:40px; height:40px; background:#000000; border-radius:50%; text-decoration:none;"><span style="color:#FFFFFF; font-size:16px;">🎵</span></a>` : ''}
        ${!socialMedia.linkedin && !socialMedia.twitter && !socialMedia.instagram && !socialMedia.youtube && !socialMedia.tiktok ? '<div style="display:flex; align-items:center; justify-content:center; width:40px; height:40px; background:#000000; border-radius:50%;"><span style="color:#FFFFFF; font-size:20px;">⚪</span></div>' : ''}
      </div>
    </td>
  </tr>
</table>`;
    }

    if (selectedTemplate === "modern") {
      return `
<table cellpadding="0" cellspacing="0" style="width:650px; background:linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%); border-radius:12px; font-family:Helvetica, Arial, sans-serif; color:#ffffff; overflow:hidden; min-height:300px; position:relative;">
  <!-- Background decorative elements -->
  <tr>
    <td colspan="2" style="position:relative; height:0; overflow:visible;">
      <div style="position:absolute; top:40px; left:40px; width:80px; height:80px; border:1px solid #00bcd4; border-radius:50%; opacity:0.1;"></div>
      <div style="position:absolute; bottom:40px; right:40px; width:60px; height:60px; border:1px solid #00bcd4; border-radius:50%; opacity:0.1;"></div>
      <div style="position:absolute; top:50%; left:35%; width:30px; height:30px; border:1px solid #00bcd4; border-radius:50%; opacity:0.1;"></div>
    </td>
  </tr>
  
  <tr>
    <!-- Left side - Company and contact info -->
    <td style="padding:32px; vertical-align:top; width:60%; position:relative; z-index:1;">
      <!-- Company Logo -->
      <div style="display:flex; align-items:center; margin-bottom:32px;">
        <div style="width:40px; height:40px; margin-right:16px;">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <rect x="6" y="8" width="28" height="5" fill="#00bcd4" rx="2.5"/>
            <rect x="6" y="17.5" width="28" height="5" fill="#00bcd4" rx="2.5"/>
            <rect x="6" y="27" width="28" height="5" fill="#00bcd4" rx="2.5"/>
          </svg>
        </div>
        <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:300; letter-spacing:0.3em;">
          ${(personalInfo.company || 'TECHSPACE').toUpperCase()}
        </h1>
      </div>

      <!-- Name and Title -->
      <div style="margin-bottom:32px;">
        <h2 style="margin:0 0 12px 0; color:#ffffff; font-size:36px; font-weight:300;">
          ${personalInfo.name || 'David Harrison'}
        </h2>
        <p style="margin:0; color:#00bcd4; font-size:20px; font-weight:300;">
          ${personalInfo.title || 'CEO'}
        </p>
      </div>

      <!-- Contact Information -->
      <div style="margin-bottom:32px;">
        ${personalInfo.phone ? `
          <div style="display:flex; align-items:center; margin-bottom:16px;">
            <span style="color:#00bcd4; margin-right:16px; font-size:18px;">📞</span>
            <a href="tel:${personalInfo.phone}" style="color:#ffffff; text-decoration:none; font-size:18px;">${personalInfo.phone}</a>
          </div>
        ` : ''}
        ${personalInfo.email ? `
          <div style="display:flex; align-items:center; margin-bottom:16px;">
            <span style="color:#00bcd4; margin-right:16px; font-size:18px;">✉️</span>
            <a href="mailto:${personalInfo.email}" style="color:#ffffff; text-decoration:none; font-size:18px;">${personalInfo.email}</a>
          </div>
        ` : ''}
        ${personalInfo.website ? `
          <div style="display:flex; align-items:center; margin-bottom:16px;">
            <span style="color:#00bcd4; margin-right:16px; font-size:18px;">🌐</span>
            <a href="${personalInfo.website}" style="color:#ffffff; text-decoration:none; font-size:18px;">${personalInfo.website}</a>
          </div>
        ` : ''}
      </div>

      <!-- Social Media Icons -->
      <div style="display:flex; gap:24px;">
        ${socialMedia.twitter ? `<a href="${socialMedia.twitter}" style="color:#00bcd4; text-decoration:none; font-size:20px;">❌</a>` : ''}
        ${socialMedia.linkedin ? `<a href="${socialMedia.linkedin}" style="color:#00bcd4; text-decoration:none; font-size:20px;">💼</a>` : ''}
        ${socialMedia.instagram || socialMedia.youtube || socialMedia.tiktok ? `<a href="${socialMedia.instagram || socialMedia.youtube || socialMedia.tiktok}" style="color:#00bcd4; text-decoration:none; font-size:20px;">🔗</a>` : ''}
      </div>
    </td>

    <!-- Right side - Profile Image -->
    <td style="vertical-align:top; text-align:center; width:40%; padding:32px; position:relative; z-index:1;">
      ${images.headshot ? `
        <div style="position:relative; display:inline-block;">
          <!-- Cyan glow effect -->
          <div style="width:160px; height:160px; border-radius:50%; background:linear-gradient(135deg, #00bcd4 0%, #00acc1 100%); padding:4px; box-shadow:0 0 40px rgba(0,188,212,0.6);">
            <div style="width:152px; height:152px; border-radius:50%; overflow:hidden; border:4px solid #00bcd4;">
              <img src="${images.headshot}" alt="${personalInfo.name}" style="width:100%; height:100%; object-fit:cover;">
            </div>
          </div>
        </div>
      ` : `
        <div style="width:160px; height:160px; border-radius:50%; background:linear-gradient(135deg, #00bcd4 0%, #00acc1 100%); display:flex; align-items:center; justify-content:center; margin:0 auto; box-shadow:0 0 40px rgba(0,188,212,0.6);">
          <span style="color:#ffffff; font-size:64px; font-weight:300;">${(personalInfo.name || 'D').charAt(0)}</span>
        </div>
      `}
    </td>
  </tr>
</table>`;
    }

    if (selectedTemplate === "sales-professional") {
      return `
<table cellpadding="0" cellspacing="0" style="width:600px; background:#FFFFFF; border-radius:12px; font-family:Helvetica, Arial, sans-serif; color:#333333; overflow:hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
  <tr>
    <!-- Left Sidebar -->
    <td style="width:80px; background:#4ECDC4; vertical-align:top; text-align:center; padding:24px 0;">
      <div style="display:flex; flex-direction:column; align-items:center; gap:16px;">
        ${socialMedia.twitter ? `<a href="${socialMedia.twitter}" style="color:#FFFFFF; text-decoration:none;">❌</a>` : ''}
        ${socialMedia.linkedin ? `<a href="${socialMedia.linkedin}" style="color:#FFFFFF; text-decoration:none;">💼</a>` : ''}
        ${socialMedia.instagram ? `<a href="${socialMedia.instagram}" style="color:#FFFFFF; text-decoration:none;">📷</a>` : ''}
        ${socialMedia.youtube ? `<a href="${socialMedia.youtube}" style="color:#FFFFFF; text-decoration:none;">📺</a>` : ''}
        ${socialMedia.tiktok ? `<a href="${socialMedia.tiktok}" style="color:#FFFFFF; text-decoration:none;">🎵</a>` : ''}
        ${!socialMedia.youtube ? '<div style="margin-top:auto;">📺</div>' : ''}
      </div>
    </td>
    
    <!-- Main Content -->
    <td style="padding:32px; vertical-align:top; position:relative;">
      <!-- Company Branding -->
      <div style="display:flex; align-items:center; margin-bottom:24px;">
        <div style="width:48px; height:48px; background:#4ECDC4; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-right:12px;">
          ${images.logo ? `<img src="${images.logo}" alt="Logo" style="width:32px; height:32px; object-fit:contain;">` : '<span style="color:#FFFFFF; font-weight:bold; font-size:18px;">J</span>'}
        </div>
        <div>
          <div style="font-size:24px; font-weight:bold; letter-spacing:2px; color:#333333;">${(personalInfo.company || 'COMPANY').toUpperCase()}</div>
          <div style="font-size:12px; color:#777777; letter-spacing:3px;">GRAPHICS</div>
        </div>
      </div>
      
      <!-- Name and Title -->
      <div style="margin-bottom:24px;">
        <h1 style="margin:0 0 8px 0; font-size:32px; font-weight:bold; color:#333333;">
          ${personalInfo.name || 'Your Name'} <span style="color:#4ECDC4;">✓</span>
        </h1>
        <p style="margin:0; font-size:20px; color:#666666; font-weight:500;">${personalInfo.title || 'Your Title'}</p>
      </div>
      
      <!-- Contact Info -->
      <div style="font-size:16px; line-height:1.8;">
        ${personalInfo.phone ? `<div style="margin-bottom:8px;">📞 <a href="tel:${personalInfo.phone}" style="color:#333333; text-decoration:none;">${personalInfo.phone}</a></div>` : ''}
        ${personalInfo.email ? `<div style="margin-bottom:8px;">✉️ <a href="mailto:${personalInfo.email}" style="color:#333333; text-decoration:none;">${personalInfo.email}</a></div>` : ''}
        ${personalInfo.website ? `<div style="margin-bottom:8px;">🌐 <a href="${personalInfo.website}" style="color:#333333; text-decoration:none;">${personalInfo.website}</a></div>` : ''}
      </div>
    </td>
    
    <!-- Portrait Section -->
    <td style="width:240px; vertical-align:top; position:relative; background: linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, rgba(107, 114, 128, 0.1) 100%);">
      ${images.headshot ? `
        <div style="position:relative; height:300px; overflow:hidden;">
          <img src="${images.headshot}" alt="${personalInfo.name}" style="width:100%; height:100%; object-fit:cover; clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);">
          <div style="position:absolute; top:0; left:0; right:0; bottom:0; background: linear-gradient(135deg, rgba(78, 205, 196, 0.2) 0%, rgba(107, 114, 128, 0.2) 100%); clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);"></div>
        </div>
      ` : `
        <div style="height:300px; background: linear-gradient(135deg, #E5E7EB 0%, #9CA3AF 100%); display:flex; align-items:center; justify-content:center; clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);">
          <span style="color:#6B7280;">Portrait</span>
        </div>
      `}
      
      <!-- Geometric decorations -->
      <div style="position:absolute; top:64px; right:80px; width:128px; height:128px; background: linear-gradient(45deg, rgba(78, 205, 196, 0.2), rgba(78, 205, 196, 0.4)); transform: rotate(45deg); opacity:0.3;"></div>
      <div style="position:absolute; top:128px; right:32px; width:96px; height:96px; background: linear-gradient(45deg, rgba(107, 114, 128, 0.3), rgba(107, 114, 128, 0.5)); transform: rotate(-12deg); opacity:0.4;"></div>
    </td>
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
