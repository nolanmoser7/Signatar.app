/**
 * Single Table Email Signature Export Module
 * Generates email signatures with maximum compatibility across Gmail, Outlook, Apple Mail
 * Creates exact replicas of saved signatures using single <table> structure with all CSS inlined
 */

import juice from 'juice';
import type { Signature, PersonalInfo, SocialMedia } from '../../shared/schema';

export class InlineTableExporter {
  
  /**
   * Main export function - converts signature data to exact replica single table HTML with inline styles
   */
  public async exportInlineTable(signature: Signature): Promise<string> {
    // Generate the exact replica signature HTML with embedded styles
    const rawHtml = this.generateExactReplicaHtml(signature);
    
    // Process through juice to inline all styles
    const inlinedHtml = await this.inlineStyles(rawHtml);
    
    // Extract and clean the table structure
    const cleanTableHtml = this.extractTableStructure(inlinedHtml);
    
    return cleanTableHtml;
  }

  /**
   * Generate exact replica of the signature matching the original saved version
   */
  private generateExactReplicaHtml(signature: Signature): string {
    const { personalInfo, images, socialMedia, templateId, elementPositions } = signature;
    const personalInfoTyped = personalInfo as PersonalInfo;
    const imagesTyped = images as any;
    const socialMediaTyped = socialMedia as SocialMedia | null;
    const positions = elementPositions as any || {};

    // Process image URLs for absolute paths
    const headshotUrl = this.getAbsoluteImageUrl(imagesTyped?.headshot);
    const logoUrl = this.getAbsoluteImageUrl(imagesTyped?.logo);
    
    // Calculate exact dimensions based on user customizations - larger for better visibility
    const headshotSize = imagesTyped?.headshotSize || 100;
    const logoSize = imagesTyped?.logoSize || 100;
    const headshotWidth = Math.round(140 * (headshotSize / 100));
    const headshotHeight = Math.round(140 * (headshotSize / 100));
    const logoWidth = Math.round(80 * (logoSize / 100));

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        /* Exact replica styles matching the original signature template */
        .signature-container {
            width: 550px;
            max-width: 550px;
            border-collapse: collapse;
            font-family: 'Playfair Display', 'Times New Roman', serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .main-content-row {
            width: 100%;
        }
        
        .content-area {
            padding: 24px;
            vertical-align: top;
            background: white;
            width: ${headshotUrl ? '380px' : '550px'};
            position: relative;
        }
        
        .image-area {
            padding: 16px;
            vertical-align: top;
            width: 170px;
            background: transparent;
            position: relative;
        }
        
        /* Exact typography matching original signature */
        .user-name {
            font-size: 28px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0 0 6px 0;
            line-height: 1.2;
            font-family: 'Playfair Display', serif;
        }
        
        .user-title {
            font-size: 18px;
            color: #3b82f6;
            margin: 0 0 4px 0;
            font-weight: 600;
            font-family: 'Playfair Display', serif;
        }
        
        .user-company {
            font-size: 16px;
            color: #6b7280;
            margin: 0 0 16px 0;
            font-weight: 400;
            font-family: 'Playfair Display', serif;
        }
        
        .contact-line {
            font-size: 14px;
            color: #374151;
            margin: 0 0 6px 0;
            line-height: 1.5;
            font-family: Arial, sans-serif;
        }
        
        .contact-link {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
        }
        
        .contact-link:hover {
            text-decoration: underline;
        }
        
        .social-container {
            margin-top: 16px;
            padding-top: 12px;
            border-top: 1px solid #e5e7eb;
        }
        
        .social-link {
            display: inline-block;
            margin-right: 12px;
            text-decoration: none;
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
            font-family: Arial, sans-serif;
        }
        
        .social-link:hover {
            color: #3b82f6;
        }
        
        .profile-image {
            width: ${headshotWidth}px;
            height: ${headshotHeight}px;
            object-fit: cover;
            display: block;
            border-radius: 12px;
            border: 0;
        }
        
        .company-logo {
            width: ${logoWidth}px;
            height: auto;
            display: block;
            margin: 12px 0 0 0;
            border: 0;
            opacity: 0.8;
        }
        
        /* Decorative elements matching original template */
        .geometric-accent {
            position: absolute;
            top: -10px;
            right: -10px;
            width: 40px;
            height: 40px;
            background: rgba(59, 130, 246, 0.1);
            border-radius: 50%;
            transform: rotate(45deg);
        }
    </style>
</head>
<body>
    <table class="signature-container" cellpadding="0" cellspacing="0" border="0">
        <tr class="main-content-row">
            <td class="content-area">
                <div class="geometric-accent"></div>
                <h1 class="user-name">${personalInfoTyped.name}</h1>
                ${personalInfoTyped.title ? `<p class="user-title">${personalInfoTyped.title}</p>` : ''}
                ${personalInfoTyped.company ? `<p class="user-company">${personalInfoTyped.company}</p>` : ''}
                
                ${personalInfoTyped.email ? `<p class="contact-line">📧 <a href="mailto:${personalInfoTyped.email}" class="contact-link">${personalInfoTyped.email}</a></p>` : ''}
                ${personalInfoTyped.phone ? `<p class="contact-line">📞 <a href="tel:${personalInfoTyped.phone}" class="contact-link">${personalInfoTyped.phone}</a></p>` : ''}
                ${personalInfoTyped.website ? `<p class="contact-line">🌐 <a href="${personalInfoTyped.website}" class="contact-link" target="_blank">${personalInfoTyped.website}</a></p>` : ''}
                
                ${this.generateSocialLinksHtml(socialMediaTyped)}
                
                ${logoUrl ? `<img src="${logoUrl}" alt="Company Logo" class="company-logo" width="${logoWidth}" />` : ''}
            </td>
            ${headshotUrl ? `<td class="image-area">
                <img src="${headshotUrl}" alt="${personalInfoTyped.name}" class="profile-image" width="${headshotWidth}" height="${headshotHeight}" />
            </td>` : ''}
        </tr>
    </table>
</body>
</html>`;
  }

  /**
   * Generate social media links HTML that matches the original
   */
  private generateSocialLinksHtml(socialMedia: SocialMedia | null): string {
    if (!socialMedia) return '';
    
    const links: string[] = [];
    
    if (socialMedia.linkedin) {
      links.push(`<a href="${socialMedia.linkedin}" class="social-link" target="_blank">💼 LinkedIn</a>`);
    }
    
    if (socialMedia.twitter) {
      links.push(`<a href="${socialMedia.twitter}" class="social-link" target="_blank">🐦 Twitter</a>`);
    }
    
    if (socialMedia.instagram) {
      links.push(`<a href="${socialMedia.instagram}" class="social-link" target="_blank">📷 Instagram</a>`);
    }
    
    if (links.length === 0) return '';
    
    return `<div class="social-container">${links.join('')}</div>`;
  }

  /**
   * Convert relative image URLs to absolute URLs
   */
  private getAbsoluteImageUrl(imagePath: string | undefined): string | null {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/api/files/')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    if (imagePath.startsWith('/attached_assets/')) {
      return `http://localhost:5000${imagePath}`;
    }
    
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
      // Extract table content using regex
      const tableMatch = inlinedHtml.match(/<table[^>]*>[\s\S]*?<\/table>/i);
      if (!tableMatch) {
        throw new Error('No table found in signature HTML');
      }
      
      let tableHtml = tableMatch[0];
      
      // Ensure proper table attributes for email clients
      tableHtml = tableHtml.replace(/<table[^>]*>/i, (match) => {
        const existingStyle = this.extractStyleFromMatch(match);
        return `<table cellpadding="0" cellspacing="0" border="0" style="${existingStyle}">`;
      });
      
      // Add explicit dimensions to images
      tableHtml = tableHtml.replace(/<img[^>]*>/gi, (match) => {
        let imgTag = match;
        
        if (!imgTag.includes('border=')) {
          imgTag = imgTag.replace(/>/i, ' border="0">');
        }
        
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
      
      // Clean up class attributes
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
      // Check structure requirements
      const tableMatches = html.match(/<table[^>]*>/gi);
      if (!tableMatches || tableMatches.length !== 1) {
        issues.push('Must contain exactly one table element');
      }
      
      // Check for inline styles
      if (html.includes('<style>') || html.includes('<link')) {
        issues.push('Contains external styles - all styles should be inlined');
      }
      
      // Check table attributes
      if (!html.includes('cellpadding="0"') || !html.includes('cellspacing="0"')) {
        issues.push('Table missing required cellpadding="0" cellspacing="0" attributes');
      }
      
      // Check image attributes
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
      issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}