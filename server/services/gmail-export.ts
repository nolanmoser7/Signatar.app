
import inlineCss from 'inline-css';
import type { Signature } from '@shared/schema';

export class GmailExportService {
  
  /**
   * Convert stored MJML HTML to Gmail-compatible format
   */
  public async exportForGmail(signature: Signature): Promise<{
    html: string;
    success: boolean;
    format: string;
  }> {
    try {
      // Use stored MJML HTML as starting point
      const mjmlHtml = signature.mjmlHtml;
      
      if (!mjmlHtml) {
        throw new Error('No MJML HTML found for signature');
      }
      
      let html = mjmlHtml;
      
      // Inline all CSS for Gmail compatibility
      html = await inlineCss(html, {
        url: ' ',
        removeStyleTags: true,
        removeLinkTags: true,
        preserveMediaQueries: false,
        applyStyleTags: true,
        applyLinkTags: false,
        removeHtmlSelectors: true,
      });
      
      // Gmail-specific optimizations
      html = this.optimizeForGmail(html);
      
      return {
        html,
        success: true,
        format: 'gmail'
      };
    } catch (error) {
      console.error('Gmail export failed:', error);
      throw new Error('Failed to export signature for Gmail');
    }
  }
  
  /**
   * Apply Gmail-specific optimizations
   */
  private optimizeForGmail(html: string): string {
    // Convert to single table structure
    html = html.replace(/<mjml[^>]*>|<\/mjml>/gi, '');
    html = html.replace(/<mj-body[^>]*>|<\/mj-body>/gi, '');
    html = html.replace(/<mj-head[^>]*>[\s\S]*?<\/mj-head>/gi, '');
    
    // Ensure all styling is inline
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Convert mj-* tags to standard table elements if any remain
    html = html.replace(/<mj-section/gi, '<table cellpadding="0" cellspacing="0" border="0"');
    html = html.replace(/<\/mj-section>/gi, '</table>');
    html = html.replace(/<mj-column/gi, '<td');
    html = html.replace(/<\/mj-column>/gi, '</td>');
    
    // Ensure table structure is Gmail-friendly
    html = html.replace(/width="(\d+)%"/gi, (match, width) => {
      const pixelWidth = Math.round((parseInt(width) / 100) * 600);
      return `width="${pixelWidth}"`;
    });
    
    // Remove any remaining CSS variables or unsupported properties
    html = html.replace(/var\([^)]+\)/gi, '');
    html = html.replace(/clip-path:[^;]+;?/gi, '');
    
    return html;
  }
}

export const gmailExportService = new GmailExportService();
