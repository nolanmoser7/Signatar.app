/**
 * Single Table Email Signature Export Module
 * Generates email signatures with maximum compatibility across Gmail, Outlook, Apple Mail
 * Uses single <table> structure with all CSS inlined on each element
 */

import juice from 'juice';
import type { Signature, PersonalInfo, SocialMedia } from '../../shared/schema';

export class InlineTableExporter {
  
  /**
   * Main export function - converts signature data to single table HTML with inline styles
   */
  public async exportInlineTable(signature: Signature): Promise<string> {
    // Generate the raw signature HTML with embedded styles
    const rawHtml = this.generateSignatureHtml(signature);
    
    // Process through juice to inline all styles
    const inlinedHtml = await this.inlineStyles(rawHtml);
    
    // Extract and clean the table structure
    const cleanTableHtml = this.extractTableStructure(inlinedHtml);
    
    return cleanTableHtml;
  }

  /**
   * Generate the signature HTML with CSS styles (before inlining)
   */
  private generateSignatureHtml(signature: Signature): string {
    const { personalInfo, images, socialMedia } = signature;
    const personalInfoTyped = personalInfo as PersonalInfo;
    const imagesTyped = images as any;
    const socialMediaTyped = socialMedia as SocialMedia | null;

    // Process image URLs for absolute paths
    const headshotUrl = this.getAbsoluteImageUrl(imagesTyped?.headshot);
    const logoUrl = this.getAbsoluteImageUrl(imagesTyped?.logo);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        /* Base styles that will be inlined */
        .signature-table {
            width: 550px;
            max-width: 550px;
            border-collapse: collapse;
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .main-row {
            width: 100%;
        }
        
        .content-cell {
            padding: 20px;
            vertical-align: top;
            background: white;
            width: 430px;
        }
        
        .image-cell {
            padding: 0;
            vertical-align: top;
            width: 120px;
            background: transparent;
        }
        
        .name {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin: 0;
            padding: 0 0 4px 0;
            line-height: 1.2;
        }
        
        .title {
            font-size: 16px;
            color: #3498db;
            margin: 0;
            padding: 0 0 2px 0;
            font-weight: 500;
        }
        
        .company {
            font-size: 14px;
            color: #7f8c8d;
            margin: 0;
            padding: 0 0 12px 0;
        }
        
        .contact-info {
            font-size: 13px;
            color: #2c3e50;
            margin: 0;
            padding: 2px 0;
            line-height: 1.4;
        }
        
        .contact-link {
            color: #3498db;
            text-decoration: none;
        }
        
        .contact-link:hover {
            text-decoration: underline;
        }
        
        .social-links {
            padding: 12px 0 0 0;
        }
        
        .social-link {
            display: inline-block;
            margin-right: 8px;
            text-decoration: none;
            font-size: 14px;
        }
        
        .headshot {
            width: 120px;
            height: 140px;
            object-fit: cover;
            display: block;
            border-radius: 0 8px 8px 0;
            border: 0;
        }
        
        .logo {
            width: 80px;
            height: auto;
            display: block;
            margin: 8px 0 0 0;
            border: 0;
        }
    </style>
</head>
<body>
    <table class="signature-table" cellpadding="0" cellspacing="0" border="0">
        <tr class="main-row">
            <td class="content-cell">
                <p class="name">${personalInfoTyped.name}</p>
                <p class="title">${personalInfoTyped.title || ''}</p>
                <p class="company">${personalInfoTyped.company || ''}</p>
                
                ${personalInfoTyped.email ? `<p class="contact-info">📧 <a href="mailto:${personalInfoTyped.email}" class="contact-link">${personalInfoTyped.email}</a></p>` : ''}
                ${personalInfoTyped.phone ? `<p class="contact-info">📞 <a href="tel:${personalInfoTyped.phone}" class="contact-link">${personalInfoTyped.phone}</a></p>` : ''}
                ${personalInfoTyped.website ? `<p class="contact-info">🌐 <a href="${personalInfoTyped.website}" class="contact-link">${personalInfoTyped.website}</a></p>` : ''}
                
                ${this.generateSocialLinksHtml(socialMediaTyped)}
                
                ${logoUrl ? `<img src="${logoUrl}" alt="Company Logo" class="logo" />` : ''}
            </td>
            ${headshotUrl ? `<td class="image-cell">
                <img src="${headshotUrl}" alt="${personalInfoTyped.name}" class="headshot" />
            </td>` : ''}
        </tr>
    </table>
</body>
</html>`;
  }

  /**
   * Generate social media links HTML
   */
  private generateSocialLinksHtml(socialMedia: SocialMedia | null): string {
    if (!socialMedia) return '';
    
    const links: string[] = [];
    
    if (socialMedia.linkedin) {
      links.push(`<a href="${socialMedia.linkedin}" class="social-link">💼 LinkedIn</a>`);
    }
    
    if (socialMedia.twitter) {
      links.push(`<a href="${socialMedia.twitter}" class="social-link">🐦 Twitter</a>`);
    }
    
    // Facebook is not in the current schema, skip for now
    
    if (socialMedia.instagram) {
      links.push(`<a href="${socialMedia.instagram}" class="social-link">📷 Instagram</a>`);
    }
    
    if (links.length === 0) return '';
    
    return `<div class="social-links">${links.join('')}</div>`;
  }

  /**
   * Convert relative image URLs to absolute URLs
   */
  private getAbsoluteImageUrl(imagePath: string | undefined): string | null {
    if (!imagePath) return null;
    
    // Handle different image path formats
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/api/files/')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    if (imagePath.startsWith('/attached_assets/')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    // Default handling for relative paths
    return `http://localhost:5000/api/files/${imagePath}`;
  }

  /**
   * Use juice to inline all CSS styles into HTML elements
   */
  private async inlineStyles(html: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const inlined = juice(html, {
          removeStyleTags: true,
          preserveMediaQueries: false,
          preserveFontFaces: false,
          preserveKeyFrames: false,
          preservePseudos: false,
          applyStyleTags: true,
          removeHtmlSelectors: true,
          insertPreservedExtraCss: false,
          extraCss: ''
        });
        resolve(inlined);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Extract clean table structure from inlined HTML
   */
  private extractTableStructure(inlinedHtml: string): string {
    try {
      // Simple regex-based approach to extract table content
      const tableMatch = inlinedHtml.match(/<table[^>]*>[\s\S]*?<\/table>/i);
      if (!tableMatch) {
        throw new Error('No table found in signature HTML');
      }
      
      let tableHtml = tableMatch[0];
      
      // Clean up table attributes for email client compatibility
      tableHtml = tableHtml.replace(/<table[^>]*>/i, (match) => {
        return '<table cellpadding="0" cellspacing="0" border="0" style="' + 
               this.extractStyleFromMatch(match) + '">';
      });
      
      // Ensure all images have explicit width/height attributes and border="0"
      tableHtml = tableHtml.replace(/<img[^>]*>/gi, (match) => {
        let imgTag = match;
        
        // Add border="0" if not present
        if (!imgTag.includes('border=')) {
          imgTag = imgTag.replace(/>/i, ' border="0">');
        }
        
        // Extract dimensions from style and add as attributes
        const styleMatch = imgTag.match(/style="([^"]*)"/i);
        if (styleMatch) {
          const style = styleMatch[1];
          const widthMatch = style.match(/width:\s*(\d+)px/);
          const heightMatch = style.match(/height:\s*(\d+)px/);
          
          if (widthMatch && !imgTag.includes('width=')) {
            imgTag = imgTag.replace(/>/i, ` width="${widthMatch[1]}">`);
          }
          if (heightMatch && !imgTag.includes('height=')) {
            imgTag = imgTag.replace(/>/i, ` height="${heightMatch[1]}">`);
          }
        }
        
        return imgTag;
      });
      
      // Remove any remaining class attributes (not needed with inline styles)
      tableHtml = tableHtml.replace(/\s+class="[^"]*"/gi, '');
      
      return tableHtml;
      
    } catch (error) {
      console.error('Error extracting table structure:', error);
      throw error;
    }
  }

  /**
   * Extract style attribute from HTML match
   */
  private extractStyleFromMatch(htmlMatch: string): string {
    const styleMatch = htmlMatch.match(/style="([^"]*)"/i);
    return styleMatch ? styleMatch[1] : '';
  }

  /**
   * Validate that the output meets email client compatibility requirements
   */
  public validateOutput(html: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    try {
      // Check for single table structure
      const tableMatches = html.match(/<table[^>]*>/gi);
      if (!tableMatches || tableMatches.length !== 1) {
        issues.push('Must contain exactly one table element');
      }
      
      // Check for any remaining divs (except within social links)
      const divMatches = html.match(/<div[^>]*>/gi);
      if (divMatches && divMatches.length > 1) { // Allow one div for social links
        issues.push('Contains too many div elements - should primarily use table/tr/td');
      }
      
      // Check for external styles
      if (html.includes('<style>') || html.includes('<link')) {
        issues.push('Contains style tags or external CSS - all styles should be inlined');
      }
      
      // Check for proper table attributes
      if (!html.includes('cellpadding="0"') || !html.includes('cellspacing="0"')) {
        issues.push('Table missing required cellpadding="0" cellspacing="0" attributes');
      }
      
      // Check for image attributes
      const imageMatches = html.match(/<img[^>]*>/gi);
      if (imageMatches) {
        imageMatches.forEach(imgTag => {
          if (!imgTag.includes('border="0"')) {
            issues.push('Image missing border="0" attribute');
          }
          if (!imgTag.includes('width=') || !imgTag.includes('height=')) {
            issues.push('Image missing explicit width/height attributes');
          }
        });
      }
      
    } catch (error) {
      issues.push(`HTML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}