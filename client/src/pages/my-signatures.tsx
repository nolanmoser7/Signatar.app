import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Download, Trash2, Plus, Eye, Copy } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Signature, PersonalInfo, SocialMedia, Images } from "@shared/schema";
import signatarLogo from "@assets/signatar-logo-new.png";
import SignaturePreview from "@/components/signature-preview";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Generate Gmail-compatible HTML signature that renders the exact signature the user created
function renderSignatureAsHtml(signature: Signature): string {
  const personalInfo = signature.personalInfo as PersonalInfo;
  const socialMedia = signature.socialMedia as SocialMedia;
  const images = signature.images as Images;
  const templateId = signature.templateId || 'professional';

  const socialIcons = [
    { key: "linkedin", url: socialMedia.linkedin, text: "LinkedIn", color: "#0077B5" },
    { key: "twitter", url: socialMedia.twitter, text: "Twitter", color: "#1DA1F2" },
    { key: "instagram", url: socialMedia.instagram, text: "Instagram", color: "#E4405F" },
    { key: "youtube", url: socialMedia.youtube, text: "YouTube", color: "#FF0000" },
    { key: "tiktok", url: socialMedia.tiktok, text: "TikTok", color: "#000000" },
  ];

  const activeSocialLinks = socialIcons.filter(social => socialMedia[social.key as keyof SocialMedia]);

  // Generate template-specific HTML that matches the actual rendered signature
  switch (templateId) {
    case "sales-professional":
      return `<table cellpadding="0" cellspacing="0" style="max-width: 600px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; border: none; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden;">
  <tr>
    <td style="padding: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <table cellpadding="0" cellspacing="0" style="width: 100%; border: none;">
        <tr>
          <td style="vertical-align: top; padding-right: 20px;">
            ${images.headshot ? `<img src="${images.headshot}" alt="${personalInfo.name}" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />` : ''}
          </td>
          <td style="vertical-align: top; flex: 1;">
            <div style="color: #ffffff; font-size: 24px; font-weight: 700; margin-bottom: 4px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${personalInfo.name || 'Your Name'}</div>
            <div style="color: #f0f0f0; font-size: 16px; font-weight: 600; margin-bottom: 2px;">${personalInfo.title || 'Your Title'}</div>
            <div style="color: #e0e0e0; font-size: 14px; font-weight: 500; margin-bottom: 16px;">${personalInfo.company || 'Your Company'}</div>
            
            <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 16px;">
              ${personalInfo.email ? `<div style="color: #ffffff; font-size: 14px; margin-bottom: 6px;">✉️ ${personalInfo.email}</div>` : ''}
              ${personalInfo.phone ? `<div style="color: #ffffff; font-size: 14px; margin-bottom: 6px;">📞 ${personalInfo.phone}</div>` : ''}
              ${personalInfo.website ? `<div style="color: #ffffff; font-size: 14px; margin-bottom: 6px;">🌐 ${personalInfo.website}</div>` : ''}
            </div>
            
            ${activeSocialLinks.length > 0 ? `
            <div style="margin-top: 16px;">
              ${activeSocialLinks.map(social => 
                `<a href="${socialMedia[social.key as keyof SocialMedia]}" target="_blank" style="display: inline-block; margin-right: 12px; background-color: rgba(255,255,255,0.2); color: #ffffff; padding: 8px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600; backdrop-filter: blur(10px);">${social.text}</a>`
              ).join('')}
            </div>` : ''}
          </td>
          ${images.logo ? `
          <td style="vertical-align: top; padding-left: 20px;">
            <img src="${images.logo}" alt="${personalInfo.company} logo" style="height: 60px; width: auto; object-fit: contain; filter: brightness(0) invert(1);" />
          </td>` : ''}
        </tr>
      </table>
    </td>
  </tr>
</table>`;

    case "minimal":
      return `<table cellpadding="0" cellspacing="0" style="width: 600px; background: #FFFFFF; border-radius: 8px; border: 1px solid #e5e7eb; font-family: Helvetica, Arial, sans-serif; color: #333333; padding: 32px;">
  <tr>
    <td style="vertical-align: top; width: 60%;">
      <div style="display: flex; align-items: center; margin-bottom: 24px;">
        <div style="width: 48px; height: 48px; margin-right: 12px; position: relative;">
          ${images.logo ? `<img src="${images.logo}" alt="Logo" style="width: 48px; height: 48px; object-fit: contain;">` : `
            <div style="width: 32px; height: 32px; background: #7C3AED; transform: rotate(45deg); border-radius: 4px; position: relative;">
              <div style="width: 12px; height: 12px; background: #FFFFFF; position: absolute; top: 10px; left: 10px; transform: rotate(-45deg);"></div>
            </div>
          `}
        </div>
        <div>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #1f2937;">${(personalInfo.company || 'APEX').toUpperCase()}</div>
          ${personalInfo.company ? '' : '<div style="font-size: 14px; color: #6b7280; letter-spacing: 4px; margin-top: -4px;">SOLUTIONS</div>'}
        </div>
      </div>
      
      <div style="margin-bottom: 24px;">
        <h1 style="margin: 0 0 8px 0; font-size: 36px; font-weight: bold; color: #1f2937;">${personalInfo.name || 'Your Name'}</h1>
        <div style="font-size: 18px; color: #6b7280; margin-bottom: 4px;">${personalInfo.title || 'Your Title'}</div>
      </div>
      
      <div style="margin-bottom: 24px;">
        ${personalInfo.email ? `<div style="margin-bottom: 8px; font-size: 16px; color: #374151;">${personalInfo.email}</div>` : ''}
        ${personalInfo.phone ? `<div style="margin-bottom: 8px; font-size: 16px; color: #374151;">${personalInfo.phone}</div>` : ''}
        ${personalInfo.website ? `<div style="margin-bottom: 8px; font-size: 16px; color: #374151;">${personalInfo.website}</div>` : ''}
      </div>
      
      ${activeSocialLinks.length > 0 ? `
      <div>
        ${activeSocialLinks.map(social => 
          `<a href="${socialMedia[social.key as keyof SocialMedia]}" target="_blank" style="display: inline-block; margin-right: 16px; color: #7C3AED; text-decoration: none; font-size: 14px; font-weight: 600;">${social.text}</a>`
        ).join('')}
      </div>` : ''}
    </td>
    
    ${images.headshot ? `
    <td style="vertical-align: top; width: 40%; text-align: right;">
      <img src="${images.headshot}" alt="${personalInfo.name}" style="width: 180px; height: 240px; object-fit: cover; border-radius: 8px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);" />
    </td>` : ''}
  </tr>
</table>`;

    case "modern":
      return `<table cellpadding="0" cellspacing="0" style="width: 600px; font-family: 'Inter', 'Segoe UI', sans-serif; background: linear-gradient(135deg, #1e3a8a, #3730a3); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
  <tr>
    <td style="padding: 32px; color: #ffffff;">
      <table cellpadding="0" cellspacing="0" style="width: 100%;">
        <tr>
          <td style="vertical-align: top; padding-right: 24px;">
            ${images.headshot ? `<img src="${images.headshot}" alt="${personalInfo.name}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid rgba(255,255,255,0.2); box-shadow: 0 8px 32px rgba(0,0,0,0.3);" />` : ''}
          </td>
          <td style="vertical-align: top; flex: 1;">
            <div style="font-size: 28px; font-weight: 800; margin-bottom: 8px; color: #ffffff;">${personalInfo.name || 'Your Name'}</div>
            <div style="font-size: 18px; font-weight: 600; color: #a5b4fc; margin-bottom: 4px;">${personalInfo.title || 'Your Title'}</div>
            <div style="font-size: 16px; font-weight: 500; color: #c7d2fe; margin-bottom: 20px;">${personalInfo.company || 'Your Company'}</div>
            
            <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; backdrop-filter: blur(10px);">
              ${personalInfo.email ? `<div style="color: #ffffff; font-size: 14px; margin-bottom: 8px;">📧 ${personalInfo.email}</div>` : ''}
              ${personalInfo.phone ? `<div style="color: #ffffff; font-size: 14px; margin-bottom: 8px;">📞 ${personalInfo.phone}</div>` : ''}
              ${personalInfo.website ? `<div style="color: #ffffff; font-size: 14px; margin-bottom: 8px;">🌐 ${personalInfo.website}</div>` : ''}
            </div>
            
            ${activeSocialLinks.length > 0 ? `
            <div style="margin-top: 20px;">
              ${activeSocialLinks.map(social => 
                `<a href="${socialMedia[social.key as keyof SocialMedia]}" target="_blank" style="display: inline-block; margin-right: 12px; background: ${social.color}; color: #ffffff; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">${social.text}</a>`
              ).join('')}
            </div>` : ''}
          </td>
          ${images.logo ? `
          <td style="vertical-align: top; padding-left: 24px;">
            <img src="${images.logo}" alt="${personalInfo.company} logo" style="height: 80px; width: auto; object-fit: contain; filter: brightness(0) invert(1) opacity(0.9);" />
          </td>` : ''}
        </tr>
      </table>
    </td>
  </tr>
</table>`;

    default:
      // Professional template (default)
      return `<table cellpadding="0" cellspacing="0" style="border: none; margin: 0; padding: 0; font-family: Arial, sans-serif; max-width: 600px;">
  <tr>
    <td style="padding: 0; margin: 0; vertical-align: top;">
      ${images.headshot ? `<img src="${images.headshot}" alt="${personalInfo.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-right: 20px; border: 2px solid #e5e7eb;" />` : ''}
    </td>
    <td style="padding: 0; margin: 0; vertical-align: top;">
      <table cellpadding="0" cellspacing="0" style="border: none; margin: 0; padding: 0;">
        <tr>
          <td style="padding: 0; margin: 0;">
            <div style="font-size: 18px; font-weight: bold; color: #374151; margin-bottom: 4px;">${personalInfo.name || 'Your Name'}</div>
            <div style="font-size: 14px; font-weight: 600; color: #3b82f6; margin-bottom: 2px;">${personalInfo.title || 'Your Title'}</div>
            <div style="font-size: 14px; font-weight: 500; color: #6b7280; margin-bottom: 12px;">${personalInfo.company || 'Your Company'}</div>
          </td>
        </tr>
        ${personalInfo.email ? `<tr><td style="padding: 0; margin: 0; padding-bottom: 4px;"><span style="font-size: 13px; color: #374151;">📧 ${personalInfo.email}</span></td></tr>` : ''}
        ${personalInfo.phone ? `<tr><td style="padding: 0; margin: 0; padding-bottom: 4px;"><span style="font-size: 13px; color: #374151;">📞 ${personalInfo.phone}</span></td></tr>` : ''}
        ${personalInfo.website ? `<tr><td style="padding: 0; margin: 0; padding-bottom: 4px;"><span style="font-size: 13px; color: #374151;">🌐 ${personalInfo.website}</span></td></tr>` : ''}
        ${activeSocialLinks.length > 0 ? `
        <tr>
          <td style="padding: 8px 0 0 0; margin: 0;">
            ${activeSocialLinks.map(social => 
              `<a href="${socialMedia[social.key as keyof SocialMedia]}" target="_blank" style="text-decoration: none; margin-right: 8px; display: inline-block; background-color: ${social.color}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${social.text}</a>`
            ).join('')}
          </td>
        </tr>` : ''}
      </table>
    </td>
    ${images.logo ? `
    <td style="padding: 0; margin: 0; vertical-align: top; padding-left: 20px;">
      <img src="${images.logo}" alt="${personalInfo.company} logo" style="height: 48px; width: auto; object-fit: contain;" />
    </td>` : ''}
  </tr>
</table>`;
  }
}

export default function MySignatures() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportingSignature, setExportingSignature] = useState<Signature | null>(null);

  // Fetch user signatures
  const { data: signatures = [], isLoading, error } = useQuery<Signature[]>({
    queryKey: ["/api/signatures/user", user?.id],
    enabled: !!user?.id,
    retry: 1,
  });

  // Delete signature mutation
  const deleteSignatureMutation = useMutation({
    mutationFn: async (signatureId: string) => {
      return await apiRequest("DELETE", `/api/signatures/${signatureId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/signatures/user", user?.id] });
      toast({
        title: "Success",
        description: "Signature deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete signature.",
        variant: "destructive",
      });
    },
  });

  // Open export dialog
  const openExportDialog = (signature: Signature) => {
    setExportingSignature(signature);
    setExportDialogOpen(true);
  };

  // Export signature as Gmail-compatible HTML
  const exportSignatureHtml = async (signature: Signature) => {
    try {
      // Generate Gmail-compatible HTML using the actual signature data
      const html = renderSignatureAsHtml(signature);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(html);
      
      toast({
        title: "Success",
        description: "Signature HTML copied to clipboard! Paste it into Gmail's signature settings.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export signature HTML.",
        variant: "destructive",
      });
    }
  };

  // Download signature as HTML file
  const downloadSignatureHtml = (signature: Signature) => {
    try {
      // Generate Gmail-compatible HTML using the actual signature data
      const html = renderSignatureAsHtml(signature);
      
      // Create full HTML document for proper rendering when opened
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${signature.name} - Email Signature</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
        }
        .signature-container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 800px;
            margin: 0 auto;
        }
        .instructions {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            border-left: 4px solid #2196f3;
        }
        .signature-html {
            border: 1px solid #ddd;
            padding: 10px;
            background: #f9f9f9;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            white-space: pre-wrap;
            word-break: break-all;
            max-height: 200px;
            overflow-y: auto;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="signature-container">
        <div class="instructions">
            <h3 style="margin: 0 0 10px 0; color: #1976d2;">📧 How to use this signature in Gmail:</h3>
            <ol style="margin: 0; padding-left: 20px; color: #333;">
                <li>Copy the HTML code below</li>
                <li>Open Gmail Settings → See all settings → General → Signature</li>
                <li>Create new signature or edit existing one</li>
                <li>Paste the HTML code into the signature editor</li>
                <li>Save changes</li>
            </ol>
        </div>
        
        <h2 style="color: #333; margin-bottom: 20px;">Preview:</h2>
        ${html}
        
        <h3 style="color: #333; margin: 30px 0 10px 0;">HTML Code (Copy this):</h3>
        <div class="signature-html">${html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>
</body>
</html>`;
      
      // Create download link
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${signature.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_signature.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Signature HTML file downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download signature HTML.",
        variant: "destructive",
      });
    }
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
              <img src={signatarLogo} alt="Signatar" className="w-10 h-10 object-contain" />
              <h1 className="text-2xl font-bold text-primary">Signatar</h1>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/builder">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Signature
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Signatures</h1>
          <p className="text-gray-600">Manage and organize your email signatures</p>
        </div>

        {error && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <p className="text-red-600">Failed to load signatures. Please try again.</p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : signatures.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="mb-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Edit className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No signatures yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first professional email signature to get started.
                </p>
                <Link href="/builder">
                  <Button size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Signature
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <TooltipProvider>
            <div className="grid gap-6 md:grid-cols-2">
              {signatures.map((signature) => {
              const personalInfo = signature.personalInfo as PersonalInfo;
              const templateName = signature.templateId?.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase()) || "Custom";
              
              // Determine if signature is static or dynamic based on element animations
              const elementAnimations = signature.elementAnimations as any;
              const hasAnimations = elementAnimations && Object.values(elementAnimations).some((anim: any) => anim !== "none");
              const animationTag = hasAnimations ? "Dynamic" : "Static";
              
              return (
                <Card key={signature.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{signature.name}</CardTitle>
                        <CardDescription>
                          {personalInfo.name} • {personalInfo.title} at {personalInfo.company}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end space-y-1 ml-2">
                        <Badge variant="secondary">
                          {templateName}
                        </Badge>
                        <Badge 
                          variant={hasAnimations ? "default" : "outline"}
                          className={hasAnimations ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                        >
                          {animationTag}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Actual Signature Preview */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 overflow-hidden">
                      <div className="scale-75 origin-top-left transform" style={{ width: "133%", height: "150px" }}>
                        <SignaturePreview
                          personalInfo={personalInfo}
                          images={signature.images as Images || {}}
                          socialMedia={signature.socialMedia as SocialMedia || {}}
                          animationType={signature.animationType || "none"}
                          templateId={signature.templateId || "professional"}
                          isAnimating={false}
                          deviceView="desktop"
                          layoutMode={false}
                          elementPositions={signature.elementPositions as any || {}}
                          elementAnimations={signature.elementAnimations as any || { headshot: "none", logo: "none", socialIcons: "none" }}
                          isElementAnimating={false}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // TODO: Implement preview functionality
                                toast({
                                  title: "Preview",
                                  description: "Preview functionality coming soon!",
                                });
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Preview signature</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Centered Export Button */}
                      <div className="flex-1 flex justify-center">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6"
                          onClick={() => openExportDialog(signature)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export Signature
                        </Button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link href={`/builder?signature=${signature.id}`}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit signature</p>
                            </TooltipContent>
                          </Tooltip>
                        </Link>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete signature</p>
                              </TooltipContent>
                            </Tooltip>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Signature</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{personalInfo.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteSignatureMutation.mutate(signature.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {/* Metadata */}
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Created {new Date(signature.createdAt!).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              );
              })}
            </div>
          </TooltipProvider>
        )}
      </main>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <img src={signatarLogo} alt="Signatar" className="w-6 h-6" />
              <span>Export Signature</span>
            </DialogTitle>
            <DialogDescription>
              Download your professionally crafted email signature as HTML ready for Gmail, Outlook, and other email clients.
            </DialogDescription>
          </DialogHeader>
          
          {exportingSignature && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Signature: {exportingSignature.name}</h4>
                <div className="text-sm text-gray-600">
                  <p>Name: {(exportingSignature.personalInfo as PersonalInfo).name}</p>
                  <p>Company: {(exportingSignature.personalInfo as PersonalInfo).company}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  onClick={() => {
                    downloadSignatureHtml(exportingSignature);
                    setExportDialogOpen(false);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download HTML File
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    exportSignatureHtml(exportingSignature);
                    setExportDialogOpen(false);
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy HTML to Clipboard
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-900 mb-1">💡 Usage Tips:</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Download the HTML file for easy importing</li>
                  <li>• Copy to clipboard for quick pasting into email settings</li>
                  <li>• Compatible with Gmail, Outlook, Apple Mail, and more</li>
                </ul>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}