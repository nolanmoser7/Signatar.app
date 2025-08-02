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
import type { Signature, PersonalInfo, SocialMedia } from "@shared/schema";
import signatarLogo from "@assets/signatar-logo-new.png";
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

export default function MySignatures() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null);

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

  // Copy signature HTML to clipboard
  const copySignatureHtml = async (signature: Signature) => {
    try {
      const html = generateSignatureHtml(signature);
      await navigator.clipboard.writeText(html);
      toast({
        title: "Copied!",
        description: "Signature HTML copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy signature HTML.",
        variant: "destructive",
      });
    }
  };

  // Generate HTML for signature (simplified version)
  const generateSignatureHtml = (signature: Signature): string => {
    const personalInfo = signature.personalInfo as PersonalInfo;
    const socialMedia = signature.socialMedia as SocialMedia;
    const images = signature.images as any;

    return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right: 20px; vertical-align: top;">
            ${images?.headshot ? `<img src="${images.headshot}" alt="${personalInfo.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e7eb;" />` : ''}
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
              ${socialMedia?.linkedin ? `<a href="${socialMedia.linkedin}" style="display: inline-block; margin-right: 8px; width: 32px; height: 32px; background-color: #0077b5; border-radius: 50%; text-align: center; line-height: 32px; color: white; text-decoration: none;">in</a>` : ''}
              ${socialMedia?.twitter ? `<a href="${socialMedia.twitter}" style="display: inline-block; margin-right: 8px; width: 32px; height: 32px; background-color: #1da1f2; border-radius: 50%; text-align: center; line-height: 32px; color: white; text-decoration: none;">tw</a>` : ''}
              ${socialMedia?.instagram ? `<a href="${socialMedia.instagram}" style="display: inline-block; margin-right: 8px; width: 32px; height: 32px; background-color: #e4405f; border-radius: 50%; text-align: center; line-height: 32px; color: white; text-decoration: none;">ig</a>` : ''}
            </div>
          </td>
          <td style="padding-left: 20px; vertical-align: top;">
            ${images?.logo ? `<img src="${images.logo}" alt="${personalInfo.company} logo" style="height: 48px; width: auto; object-fit: contain;" />` : ''}
          </td>
        </tr>
      </table>
    </div>`;
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {signatures.map((signature) => {
              const personalInfo = signature.personalInfo as PersonalInfo;
              const templateName = signature.templateId?.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase()) || "Custom";
              
              // Determine if signature is static or dynamic based on animations
              const elementAnimations = signature.elementAnimations as any;
              const hasMainAnimation = signature.animationType && signature.animationType !== "none";
              const hasElementAnimations = elementAnimations && Object.values(elementAnimations).some((anim: any) => anim !== "none");
              const hasAnimations = hasMainAnimation || hasElementAnimations;
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
                    {/* Mini Preview */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-hidden">
                      <div className="text-xs text-gray-600 scale-75 origin-top-left transform">
                        <div className="font-semibold">{personalInfo.name}</div>
                        <div className="text-blue-600">{personalInfo.title}</div>
                        <div className="text-gray-500">{personalInfo.company}</div>
                        <div className="mt-1 space-y-1">
                          {personalInfo.email && <div>✉ {personalInfo.email}</div>}
                          {personalInfo.phone && <div>📞 {personalInfo.phone}</div>}
                        </div>
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
                              onClick={() => copySignatureHtml(signature)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy HTML</p>
                          </TooltipContent>
                        </Tooltip>
                        
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
    </div>
  );
}