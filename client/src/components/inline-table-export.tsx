import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Download, CheckCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface InlineTableExportProps {
  signatureId: string;
}

interface ExportResult {
  html: string;
  validation: {
    valid: boolean;
    issues: string[];
  };
  success: boolean;
  format: string;
}

export function InlineTableExport({ signatureId }: InlineTableExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    if (!signatureId) {
      toast({
        title: "Error",
        description: "No signature selected for export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const result = await apiRequest(`/api/signatures/${signatureId}/export-inline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setExportResult(result);
      
      if (result.success) {
        toast({
          title: "Export Complete",
          description: `Generated ${result.format} signature with ${result.html.length} characters`,
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate inline table signature",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!exportResult?.html) return;

    try {
      await navigator.clipboard.writeText(exportResult.html);
      setCopied(true);
      toast({
        title: "Copied to Clipboard",
        description: "Signature HTML copied successfully",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!exportResult?.html) return;

    const blob = new Blob([exportResult.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-signature-inline-table.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Signature HTML file downloaded",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Single Table Export
          <Badge variant="secondary">Maximum Compatibility</Badge>
        </CardTitle>
        <CardDescription>
          Export your signature as a single HTML table with all styles inlined. 
          Perfect for Gmail, Outlook, Apple Mail, and all other email clients.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Button */}
        <Button 
          onClick={handleExport} 
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? 'Generating...' : 'Generate Single Table Export'}
        </Button>

        {/* Export Results */}
        {exportResult && (
          <div className="space-y-4">
            {/* Validation Status */}
            <Alert className={exportResult.validation.valid ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
              <div className="flex items-start gap-2">
                {exportResult.validation.valid ? (
                  <CheckCheck className="h-4 w-4 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                )}
                <div>
                  <AlertDescription className="font-medium">
                    {exportResult.validation.valid 
                      ? 'Perfect Email Client Compatibility' 
                      : 'Compatibility Issues Found'
                    }
                  </AlertDescription>
                  {!exportResult.validation.valid && exportResult.validation.issues.length > 0 && (
                    <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside">
                      {exportResult.validation.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Alert>

            {/* Export Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format:</span>
                <Badge variant="outline">{exportResult.format}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size:</span>
                <span>{exportResult.html.length.toLocaleString()} chars</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={handleCopyToClipboard}
                variant="outline"
                className="flex-1"
              >
                {copied ? <CheckCheck className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy HTML'}
              </Button>
              <Button 
                onClick={handleDownload}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            {/* Preview Section */}
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                Preview HTML Code
              </summary>
              <div className="mt-2 p-3 bg-muted rounded-md">
                <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap break-words">
                  {exportResult.html.substring(0, 500)}
                  {exportResult.html.length > 500 && '...'}
                </pre>
              </div>
            </details>

            {/* Usage Instructions */}
            <Alert>
              <AlertDescription className="text-sm">
                <strong>How to use:</strong> Copy the HTML code and paste it directly into your email client's signature editor. 
                This format works with Gmail, Outlook, Apple Mail, Thunderbird, and virtually all email clients.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}