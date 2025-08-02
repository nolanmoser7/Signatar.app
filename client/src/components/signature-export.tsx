import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, FileCode, X, Copy, CheckCircle, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SignatureExportProps {
  signatureId: string;
  onClose: () => void;
}

interface ExportResult {
  html: string;
  gifUrls?: { [elementId: string]: string };
  success: boolean;
  mjml?: string;
  validation?: { valid: boolean; issues: string[] };
  format?: string;
}

export default function SignatureExport({ signatureId, onClose }: SignatureExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [selectedEmailClient, setSelectedEmailClient] = useState<string>("gmail");
  const { toast } = useToast();

  const emailClientOptions = [
    { value: "gmail", label: "Gmail", description: "Google Gmail web and mobile app" },
    { value: "outlook", label: "Outlook", description: "Microsoft Outlook (desktop and web)" },
    { value: "apple-mail", label: "Apple Mail", description: "macOS and iOS Mail app" },
    { value: "mjml", label: "MJML (Recommended)", description: "Best compatibility across all email clients" },
  ];

  const exportSignature = async () => {
    setIsExporting(true);
    setProgress(0);
    setCurrentStep("Initializing export process...");

    try {
      setProgress(20);
      setCurrentStep("Rendering signature preview...");
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProgress(40);
      setCurrentStep("Optimizing for email client...");
      
      const exportEndpoint = selectedEmailClient === 'mjml' 
        ? `/api/signatures/${signatureId}/export-mjml`
        : `/api/signatures/${signatureId}/export`;
      
      const response = await apiRequest("POST", exportEndpoint, {
        emailClient: selectedEmailClient
      });

      if (!response.ok) {
        throw new Error("Failed to export signature");
      }

      const result: ExportResult = await response.json();
      
      setProgress(80);
      setCurrentStep("Generating final HTML...");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(100);
      setCurrentStep("Export complete!");
      setExportResult(result);
      
      const isMjmlExport = result.format === 'mjml';
      const exportType = isMjmlExport ? 'MJML template' : 'optimized HTML';
      
      toast({
        title: "Export Complete!",
        description: `Your signature has been exported as ${exportType}.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export signature",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadHtml = () => {
    if (!exportResult) return;

    const blob = new Blob([exportResult.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `email-signature-${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyHtml = async () => {
    if (!exportResult) return;

    try {
      await navigator.clipboard.writeText(exportResult.html);
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

  const copyGifUrls = async () => {
    if (!exportResult || !exportResult.gifUrls) return;

    const urls = Object.values(exportResult.gifUrls).join('\n');
    try {
      await navigator.clipboard.writeText(urls);
      toast({
        title: "GIF URLs Copied!",
        description: "All GIF URLs have been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URLs to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral">Export Email Signature</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {!exportResult ? (
          <div className="text-center">
            {!isExporting ? (
              <>
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCode className="text-primary text-2xl" />
                </div>
                <h4 className="text-lg font-semibold text-neutral mb-2">Ready to Export</h4>
                <p className="text-gray-600 mb-6">
                  Export your signature as HTML with animated GIFs. This process will:
                </p>
                <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
                  <li>• Render your signature with all animations</li>
                  <li>• Convert animated elements to looping GIFs</li>
                  <li>• Generate clean HTML with embedded GIF URLs</li>
                  <li>• Preserve all social media links and styling</li>
                </ul>
                
                {/* Email Client Selection */}
                <div className="mb-6 text-left">
                  <Label htmlFor="email-client" className="text-sm font-medium text-gray-700 mb-2 block">
                    Select Email Client
                  </Label>
                  <Select value={selectedEmailClient} onValueChange={setSelectedEmailClient}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose your email client" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailClientOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-3">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-gray-500">{option.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    The signature will be optimized for your selected email client
                  </p>
                </div>
                
                <Button onClick={exportSignature} className="w-full">
                  <FileCode className="w-4 h-4 mr-2" />
                  Export for {emailClientOptions.find(option => option.value === selectedEmailClient)?.label}
                </Button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCode className="text-primary text-2xl animate-pulse" />
                </div>
                <h4 className="text-lg font-semibold text-neutral mb-2">Exporting Your Signature</h4>
                <p className="text-gray-600 mb-4">Converting animations to GIFs and generating HTML...</p>
                <Progress value={progress} className="w-full mb-2" />
                <p className="text-sm text-gray-500">{currentStep}</p>
              </>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-success text-2xl" />
            </div>
            <h4 className="text-lg font-semibold text-neutral mb-2">Export Complete!</h4>
            <p className="text-gray-600 mb-6">Your signature has been successfully exported with animated GIFs.</p>
            
            {/* Export Results */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h5 className="font-semibold mb-3 flex items-center">
                <FileCode className="w-4 h-4 mr-2" />
                Export Results
              </h5>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">HTML File:</span>
                  <span className="text-gray-600 ml-2">Ready for download</span>
                </div>
                
                {exportResult.gifUrls && Object.keys(exportResult.gifUrls).length > 0 && (
                  <div>
                    <span className="font-medium">Generated GIFs:</span>
                    <div className="mt-2 space-y-1">
                      {exportResult.gifUrls && Object.entries(exportResult.gifUrls).map(([elementId, url]) => (
                        <div key={elementId} className="flex items-center justify-between bg-white rounded p-2">
                          <span className="text-xs font-mono">
                            {elementId.replace('-element', '')}: {url}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button onClick={downloadHtml} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download HTML
              </Button>
              <Button variant="outline" onClick={copyHtml} className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy HTML
              </Button>
              {exportResult.gifUrls && Object.keys(exportResult.gifUrls).length > 0 && (
                <Button variant="outline" onClick={copyGifUrls} className="md:col-span-2">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy GIF URLs
                </Button>
              )}
            </div>
            
            {/* Usage Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
              <h6 className="font-semibold text-blue-900 mb-2">
                How to Use in {emailClientOptions.find(option => option.value === selectedEmailClient)?.label}:
              </h6>
              <ul className="text-sm text-blue-800 space-y-1">
                {selectedEmailClient === 'gmail' && (
                  <>
                    <li>1. Open Gmail Settings → General → Signature</li>
                    <li>2. Paste the HTML code into the signature editor</li>
                    <li>3. Save changes - GIFs will animate automatically</li>
                  </>
                )}
                {selectedEmailClient === 'outlook' && (
                  <>
                    <li>1. Open Outlook → File → Options → Mail → Signatures</li>
                    <li>2. Create new or edit existing signature</li>
                    <li>3. Paste HTML code in the editor</li>
                    <li>4. Save and apply to new messages</li>
                  </>
                )}
                {selectedEmailClient === 'apple-mail' && (
                  <>
                    <li>1. Open Mail → Preferences → Signatures</li>
                    <li>2. Create new signature or select existing one</li>
                    <li>3. Paste HTML code into the signature field</li>
                    <li>4. Close preferences to save</li>
                  </>
                )}
                <li>• All social media links are preserved and clickable</li>
                <li>• Animated elements will loop automatically</li>
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}