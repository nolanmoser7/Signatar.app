import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
// @ts-ignore - No types available for gifencoder
import GIFEncoder from 'gifencoder';
import type { Signature, PersonalInfo, SocialMedia, Images, ElementAnimations } from '@shared/schema';

interface ExportResult {
  finalHtml: string;
  gifUrls: { [elementId: string]: string };
}

interface AnimationConfig {
  frameCount: number;
  frameDuration: number; // milliseconds
  width: number;
  height: number;
}

// Default animation configuration
const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  frameCount: 20,
  frameDuration: 150,
  width: 800,
  height: 600,
};

export class SignatureExportService {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-gpu',
          '--disable-extensions',
          '--disable-plugins',
          '--no-first-run',
          '--disable-default-apps',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--single-process'
        ],
        executablePath: process.env.CHROME_BIN || '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',

      });
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Main export function - handles both animated and static signatures
   */
  async exportSignature(signature: Signature): Promise<ExportResult> {
    // Check if signature has any actual animations
    const hasAnimations = this.hasActiveAnimations(signature);
    
    if (!hasAnimations || signature.tag === 'static') {
      // Simple export for static signatures
      return await this.exportStaticSignature(signature);
    } else {
      // Complex export with GIF baking for dynamic signatures
      return await this.bakeSignatureAnimations(signature);
    }
  }

  /**
   * Check if signature has any actual animations enabled
   */
  private hasActiveAnimations(signature: Signature): boolean {
    const elementAnimations = signature.elementAnimations as any;
    if (!elementAnimations) return false;
    
    // Check if any element has animation other than 'none'
    return Object.values(elementAnimations).some(animation => 
      animation && animation !== 'none'
    );
  }

  /**
   * Export function for static signatures (no animations)
   */
  async exportStaticSignature(signature: Signature): Promise<ExportResult> {
    try {
      // Generate clean HTML without any animation classes or scripts
      const staticHtml = await this.generateStaticSignatureHtml(signature);
      
      return {
        finalHtml: staticHtml,
        gifUrls: {}, // No GIFs needed for static signatures
      };
    } catch (error) {
      console.error('❌ Error exporting static signature:', error);
      throw new Error('Failed to export static signature');
    }
  }

  /**
   * Export function for animated signatures - converts animations to GIFs
   */
  async bakeSignatureAnimations(signature: Signature): Promise<ExportResult> {
    await this.initialize();
    
    try {
      // Generate the full HTML for the signature
      const fullHtml = await this.generateSignatureHtml(signature);
      
      // Identify animated elements from the signature data
      const animatedElements = this.identifyAnimatedElements(signature);
      
      // Generate GIFs for each animated element
      const gifUrls: { [elementId: string]: string } = {};
      
      for (const elementId of animatedElements) {
        const gifUrl = await this.generateElementGif(fullHtml, elementId, signature);
        if (gifUrl) {
          gifUrls[elementId] = gifUrl;
        }
      }
      
      // Replace animated elements with GIF URLs in the HTML
      const finalHtml = await this.replaceAnimatedElementsWithGifs(fullHtml, gifUrls);
      
      return {
        finalHtml,
        gifUrls,
      };
    } finally {
      // Keep browser alive for potential reuse, cleanup handled externally
    }
  }

  /**
   * Generate complete HTML for a signature including CSS animations
   */
  private async generateSignatureHtml(signature: Signature): Promise<string> {
    const { personalInfo, images, socialMedia, templateId, animationType, elementAnimations } = signature;
    
    // Generate CSS keyframes for animations
    const animationCSS = this.generateAnimationCSS(elementAnimations || null);
    
    // Generate template-specific HTML
    const templateHtml = await this.generateTemplateHtml(signature);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Signature</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f5f5f5;
        }
        
        .signature-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        ${animationCSS}
        
        /* Element-specific animations */
        .animate-fade-in {
            animation: fadeIn 1s ease-in-out;
        }
        
        .animate-pulse {
            animation: pulse 2s infinite;
        }
        
        .animate-zoom-in {
            animation: zoomIn 1s ease-out;
        }
        
        .animate-rotate {
            animation: rotate 2s linear infinite;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
        }
        
        @keyframes zoomIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        /* Template-specific styles */
        .sales-professional {
            padding: 24px;
        }
        
        .headshot-element img {
            border-radius: 50%;
            width: 80px;
            height: 80px;
            object-fit: cover;
        }
        
        .logo-element img {
            max-width: 120px;
            max-height: 60px;
            object-fit: contain;
        }
        
        .social-icons {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }
        
        .social-icon {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            color: white;
            font-size: 16px;
        }
        
        .social-linkedin { background: #0077b5; }
        .social-twitter { background: #1da1f2; }
        .social-instagram { background: #e4405f; }
        .social-youtube { background: #ff0000; }
        .social-tiktok { background: #000000; }
    </style>
</head>
<body>
    <div class="signature-container">
        ${templateHtml}
    </div>
</body>
</html>`;
  }

  /**
   * Generate template-specific HTML based on signature data
   */
  private async generateTemplateHtml(signature: Signature): Promise<string> {
    const personalInfo = signature.personalInfo as PersonalInfo;
    const images = signature.images as Images | null;
    const socialMedia = signature.socialMedia as SocialMedia | null;
    const elementAnimations = signature.elementAnimations as ElementAnimations | null;
    const { templateId } = signature;
    
    // Get animation classes for elements  
    const headshotClass = elementAnimations?.headshot && elementAnimations.headshot !== 'none' 
      ? `animate-${elementAnimations.headshot}` : '';
    const logoClass = elementAnimations?.logo && elementAnimations.logo !== 'none' 
      ? `animate-${elementAnimations.logo}` : '';
    const socialClass = elementAnimations?.socialIcons && elementAnimations.socialIcons !== 'none' 
      ? `animate-${elementAnimations.socialIcons}` : '';

    if (templateId === 'sales-professional') {
      return `
        <div class="sales-professional">
          <table cellpadding="0" cellspacing="0" style="width: 100%; border: none;">
            <tr>
              <td style="vertical-align: top; padding-right: 20px;">
                ${images?.headshot ? `
                  <div id="headshot-element" class="headshot-element ${headshotClass}">
                    <img src="${images.headshot.url}" alt="${personalInfo.name}" />
                  </div>
                ` : ''}
              </td>
              <td style="vertical-align: top; flex: 1;">
                ${images?.logo ? `
                  <div id="logo-element" class="logo-element ${logoClass}" style="margin-bottom: 12px;">
                    <img src="${images.logo.url}" alt="${personalInfo.company}" />
                  </div>
                ` : ''}
                
                <h2 style="margin: 0 0 4px 0; color: #1a1a1a; font-size: 24px; font-weight: bold;">
                  ${personalInfo.name}
                </h2>
                <p style="margin: 0 0 8px 0; color: #666; font-size: 16px;">
                  ${personalInfo.title}
                </p>
                <p style="margin: 0 0 16px 0; color: #333; font-size: 14px; font-weight: 500;">
                  ${personalInfo.company || ''}
                </p>
                
                <div style="font-size: 14px; line-height: 1.6; color: #555;">
                  ${personalInfo.email ? `
                    <div style="margin-bottom: 4px;">
                      <a href="mailto:${personalInfo.email}" style="color: #0077b5; text-decoration: none;">
                        📧 ${personalInfo.email}
                      </a>
                    </div>
                  ` : ''}
                  ${personalInfo.phone ? `
                    <div style="margin-bottom: 4px;">
                      <a href="tel:${personalInfo.phone}" style="color: #0077b5; text-decoration: none;">
                        📞 ${personalInfo.phone}
                      </a>
                    </div>
                  ` : ''}
                  ${personalInfo.website ? `
                    <div style="margin-bottom: 4px;">
                      <a href="${personalInfo.website}" style="color: #0077b5; text-decoration: none;">
                        🌐 ${personalInfo.website}
                      </a>
                    </div>
                  ` : ''}
                </div>
                
                ${this.generateSocialIconsHtml(socialMedia, socialClass)}
              </td>
            </tr>
          </table>
        </div>
      `;
    }
    
    // Default template
    return `
      <div style="padding: 24px;">
        <table cellpadding="0" cellspacing="0" style="width: 100%; border: none;">
          <tr>
            <td style="vertical-align: top; padding-right: 20px;">
              ${images?.headshot ? `
                <div id="headshot-element" class="headshot-element ${headshotClass}">
                  <img src="${images.headshot.url}" alt="${personalInfo.name}" />
                </div>
              ` : ''}
            </td>
            <td style="vertical-align: top;">
              ${images?.logo ? `
                <div id="logo-element" class="logo-element ${logoClass}" style="margin-bottom: 12px;">
                  <img src="${images.logo.url}" alt="${personalInfo.company}" />
                </div>
              ` : ''}
              
              <h2 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 20px; font-weight: bold;">
                ${personalInfo.name}
              </h2>
              <p style="margin: 0 0 12px 0; color: #666; font-size: 16px;">
                ${personalInfo.title} at ${personalInfo.company}
              </p>
              
              <div style="font-size: 14px; line-height: 1.6; color: #555; margin-bottom: 12px;">
                ${personalInfo.email ? `<div><a href="mailto:${personalInfo.email}" style="color: #0077b5; text-decoration: none;">${personalInfo.email}</a></div>` : ''}
                ${personalInfo.phone ? `<div><a href="tel:${personalInfo.phone}" style="color: #0077b5; text-decoration: none;">${personalInfo.phone}</a></div>` : ''}
                ${personalInfo.website ? `<div><a href="${personalInfo.website}" style="color: #0077b5; text-decoration: none;">${personalInfo.website}</a></div>` : ''}
              </div>
              
              ${this.generateSocialIconsHtml(socialMedia, socialClass)}
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  /**
   * Generate social media icons HTML with proper link preservation
   */
  private generateSocialIconsHtml(socialMedia: SocialMedia | null, socialClass: string): string {
    const socialLinks = [
      { key: 'linkedin', url: socialMedia?.linkedin, icon: 'in', bgClass: 'social-linkedin' },
      { key: 'twitter', url: socialMedia?.twitter, icon: '𝕏', bgClass: 'social-twitter' },
      { key: 'instagram', url: socialMedia?.instagram, icon: '📷', bgClass: 'social-instagram' },
      { key: 'youtube', url: socialMedia?.youtube, icon: '▶', bgClass: 'social-youtube' },
      { key: 'tiktok', url: socialMedia?.tiktok, icon: '🎵', bgClass: 'social-tiktok' },
    ];

    const validLinks = socialLinks.filter(link => link.url);
    
    if (validLinks.length === 0) return '';

    return `
      <div id="social-icons-element" class="social-icons ${socialClass}">
        ${validLinks.map(link => `
          <a href="${link.url}" class="social-icon ${link.bgClass}" target="_blank" rel="noopener">
            ${link.icon}
          </a>
        `).join('')}
      </div>
    `;
  }

  /**
   * Generate CSS for animations
   */
  private generateAnimationCSS(elementAnimations: ElementAnimations | null): string {
    return `
      /* Animation delays for staggered effects */
      .delay-250 { animation-delay: 0.25s; }
      .delay-500 { animation-delay: 0.5s; }
      
      /* Ensure animations are visible */
      .animate-fade-in { animation-fill-mode: both; }
      .animate-pulse { animation-fill-mode: both; }
      .animate-zoom-in { animation-fill-mode: both; }  
      .animate-rotate { animation-fill-mode: both; }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.05); }
      }
      
      @keyframes zoomIn {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
      }
      
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
  }

  /**
   * Identify which elements have animations enabled
   */
  /**
   * Check if signature has any animated elements
   */
  private hasAnimatedElements(signature: Signature): boolean {
    const { elementAnimations } = signature;
    
    // Only check element-specific animations, ignore global animationType
    // since we only support element-specific animations in the current system
    if (elementAnimations) {
      return Object.values(elementAnimations).some(animation => animation && animation !== "none");
    }
    
    return false;
  }

  /**
   * Generate Gmail-compatible HTML that exactly matches the Sales Professional template structure
   */
  private async generateGmailCompatibleHtml(signature: Signature): Promise<string> {
    const { personalInfo, images, socialMedia } = signature;
    
    // Convert relative URLs to absolute URLs for static export
    const processedSignature = await this.processImageUrlsForStatic(signature);
    const processedImages = processedSignature.images as any;
    
    // Get image sizes from signature settings
    const headshotSize = processedImages?.headshotSize || 110;
    const logoSize = processedImages?.logoSize || 160;
    
    // Create social media icons HTML matching the original vertical layout
    const socialIconsHtml = this.generateSimpleGmailSocialIcons(socialMedia);
    
    // Calculate proper widths based on original template proportions
    const headshotColumnWidth = headshotSize * 2.56; // Match original scaling
    const mainContentWidth = `calc(100% - 80px - ${headshotColumnWidth}px)`;
    
    // Gmail-specific simplified version - no advanced CSS
    const gmailHeadshotSize = Math.round(headshotSize * 0.8); // 88px for Gmail
    const gmailLogoSize = Math.round((Math.min(logoSize * 0.48, 77)) * 0.7); // Smaller logo
    
    return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; max-width: 380px; border: 1px solid #e5e7eb;">
  <tr>
    <!-- Left sidebar with solid background -->
    <td style="width: 40px; background-color: #0891b2; text-align: center; vertical-align: top; padding: 8px 4px;">
      ${this.generateSimpleGmailSocialIcons(socialMedia)}
    </td>
    
    <!-- Main content area -->
    <td style="padding: 12px; vertical-align: top; background-color: white;">
      <!-- Company Logo -->
      ${processedImages?.logo ? `
      <div style="margin-bottom: 8px;">
        <img src="${processedImages.logo}" alt="Company Logo" style="width: ${gmailLogoSize}px; height: ${gmailLogoSize}px; display: block;" width="${gmailLogoSize}" height="${gmailLogoSize}" />
      </div>
      ` : ''}
      
      <!-- Company Name -->
      <div style="margin-bottom: 8px;">
        <span style="font-family: Georgia, serif; font-size: 12px; font-weight: bold; color: #111827; text-transform: uppercase; letter-spacing: 1px;">${personalInfo.company || "COMPANY"}</span>
      </div>
      
      <!-- Name and Title -->
      <div style="margin-bottom: 8px;">
        <div style="font-family: Georgia, serif; font-size: 16px; font-weight: bold; color: #111827; margin-bottom: 2px;">${personalInfo.name || "Your Name"} <span style="color: #22d3ee;">✓</span></div>
        <div style="font-family: Georgia, serif; font-size: 11px; color: #374151; font-weight: 500;">${personalInfo.title || "Your Title"}</div>
      </div>
      
      <!-- Contact Information -->
      <table cellpadding="0" cellspacing="0" border="0">
        ${personalInfo.phone ? `
        <tr>
          <td style="font-size: 9px; color: #6b7280; padding-right: 4px; vertical-align: top;">📞</td>
          <td style="font-size: 9px; color: #374151; padding-bottom: 2px;"><a href="tel:${personalInfo.phone}" style="color: #374151; text-decoration: none;">${personalInfo.phone}</a></td>
        </tr>
        ` : ''}
        ${personalInfo.email ? `
        <tr>
          <td style="font-size: 9px; color: #6b7280; padding-right: 4px; vertical-align: top;">📧</td>
          <td style="font-size: 9px; color: #374151; padding-bottom: 2px;"><a href="mailto:${personalInfo.email}" style="color: #374151; text-decoration: none;">${personalInfo.email}</a></td>
        </tr>
        ` : ''}
        ${personalInfo.website ? `
        <tr>
          <td style="font-size: 9px; color: #6b7280; padding-right: 4px; vertical-align: top;">🌐</td>
          <td style="font-size: 9px; color: #374151; padding-bottom: 2px;"><a href="${personalInfo.website}" style="color: #374151; text-decoration: none;">${personalInfo.website}</a></td>
        </tr>
        ` : ''}
      </table>
    </td>
    
    <!-- Right section with headshot -->
    ${processedImages?.headshot ? `
    <td style="width: ${gmailHeadshotSize}px; vertical-align: top; padding: 0;">
      <img src="${processedImages.headshot}" alt="${personalInfo.name}" style="width: ${gmailHeadshotSize}px; height: ${gmailHeadshotSize}px; display: block; border: 0;" width="${gmailHeadshotSize}" height="${gmailHeadshotSize}" />
    </td>
    ` : ''}
  </tr>
</table>`;
  }

  /**
   * Generate simple Gmail-compatible social media icons using text symbols
   */
  private generateSimpleGmailSocialIcons(socialMedia: SocialMedia | null): string {
    if (!socialMedia) return '';
    
    const socialLinks = [
      { key: 'twitter', url: socialMedia.twitter, symbol: 'X', color: '#ffffff' },
      { key: 'linkedin', url: socialMedia.linkedin, symbol: 'in', color: '#ffffff' },
      { key: 'instagram', url: socialMedia.instagram, symbol: '📷', color: '#ffffff' },
      { key: 'youtube', url: socialMedia.youtube, symbol: '▶', color: '#ffffff' },
      { key: 'tiktok', url: socialMedia.tiktok, symbol: '♫', color: '#ffffff' }
    ];

    const validLinks = socialLinks.filter(link => link.url);
    
    if (validLinks.length === 0) return '';

    return validLinks.map(link => `
      <div style="margin-bottom: 6px;">
        <a href="${link.url}" style="display: block; width: 20px; height: 20px; background-color: rgba(255,255,255,0.2); color: ${link.color}; text-decoration: none; text-align: center; line-height: 20px; font-size: 10px; font-weight: bold;" target="_blank" title="${link.key.charAt(0).toUpperCase() + link.key.slice(1)}">${link.symbol}</a>
      </div>
    `).join('');
  }

  /**
   * Generate static HTML for signatures without animations - optimized for Gmail copy/paste
   */
  private async generateStaticSignatureHtml(signature: Signature): Promise<string> {
    // Convert relative URLs to absolute URLs for static export
    const processedSignature = await this.processImageUrlsForStatic(signature);
    
    // Generate Gmail-compatible HTML that can be directly copy/pasted
    return await this.generateGmailCompatibleHtml(processedSignature);
  }

  /**
   * Get template-specific CSS for static rendering
   */
  private getTemplateSpecificCSS(templateId: string): string {
    switch (templateId) {
      case 'sales-professional':
        return `
          .sales-professional {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            padding: 32px;
            max-width: 600px;
            margin: 0 auto;
            color: white;
            position: relative;
            overflow: hidden;
          }
          
          .sales-professional::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            pointer-events: none;
          }
          
          .sales-template-content {
            display: flex;
            align-items: center;
            gap: 24px;
            position: relative;
            z-index: 1;
          }
          
          .sales-left-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            min-width: 120px;
          }
          
          .sales-headshot {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid rgba(255,255,255,0.3);
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          }
          
          .sales-social-icons {
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-items: center;
          }
          
          .sales-social-icon {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            color: white;
            transition: all 0.3s ease;
          }
          
          .sales-main-content {
            flex: 1;
          }
          
          .sales-company-logo {
            width: auto;
            height: 32px;
            margin-bottom: 12px;
          }
          
          .sales-name {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 4px;
            background: linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .sales-title {
            font-size: 16px;
            font-weight: 500;
            color: rgba(255,255,255,0.9);
            margin-bottom: 16px;
          }
          
          .sales-contact-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .sales-contact-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: rgba(255,255,255,0.8);
          }
          
          .sales-contact-icon {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
          }
        `;
        
      case 'modern':
        return `
          .modern-template {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            margin: 0 auto;
            color: white;
            position: relative;
            overflow: hidden;
          }
          
          .modern-template::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(circle at 20% 20%, rgba(0,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(0,255,255,0.05) 0%, transparent 50%);
            pointer-events: none;
          }
          
          .modern-content {
            display: flex;
            align-items: center;
            gap: 32px;
            position: relative;
            z-index: 1;
          }
          
          .modern-left {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }
          
          .modern-headshot {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #00ffff;
            box-shadow: 0 0 20px rgba(0,255,255,0.3);
          }
          
          .modern-right {
            flex: 1;
          }
          
          .modern-company {
            font-size: 24px;
            font-weight: 800;
            color: #00ffff;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          
          .modern-name {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #ffffff 0%, #00ffff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .modern-title {
            font-size: 18px;
            font-weight: 500;
            color: rgba(255,255,255,0.8);
            margin-bottom: 20px;
          }
          
          .modern-contact {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          
          .modern-contact-item {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 16px;
            color: rgba(255,255,255,0.9);
          }
          
          .modern-social {
            display: flex;
            gap: 12px;
            margin-top: 16px;
          }
          
          .modern-social-icon {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background: rgba(0,255,255,0.1);
            border: 1px solid rgba(0,255,255,0.3);
            color: #00ffff;
          }
        `;
        
      default:
        return '';
    }
  }

  /**
   * Convert relative image URLs to absolute URLs for static export
   */
  private async processImageUrlsForStatic(signature: Signature): Promise<Signature> {
    const images = signature.images as any;
    if (!images) return signature;

    // Use current server domain for image URLs
    const baseUrl = process.env.REPLIT_DOMAINS 
      ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
      : 'http://localhost:5000';

    const processedImages = { ...images };

    // Helper function to convert various image URL formats
    const convertImageUrl = (imageUrl: string): string => {
      // Handle uploaded files
      if (imageUrl.startsWith('/api/files/')) {
        return `${baseUrl}${imageUrl}`;
      }
      // Handle attached assets
      if (imageUrl.startsWith('/@fs/home/runner/workspace/attached_assets/')) {
        const filename = imageUrl.split('/').pop();
        return `${baseUrl}/attached_assets/${filename}`;
      }
      // Handle relative attached assets
      if (imageUrl.startsWith('/attached_assets/')) {
        return `${baseUrl}${imageUrl}`;
      }
      // Already absolute URL
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      // Default fallback - treat as relative URL
      return `${baseUrl}${imageUrl}`;
    };

    // Convert headshot URL - handle both string and object formats
    if (images.headshot) {
      const headshotUrl = typeof images.headshot === 'string' ? images.headshot : images.headshot.url;
      if (headshotUrl) {
        const newUrl = convertImageUrl(headshotUrl);
        processedImages.headshot = typeof images.headshot === 'string' 
          ? newUrl
          : { ...images.headshot, url: newUrl };
      }
    }

    // Convert logo URL - handle both string and object formats
    if (images.logo) {
      const logoUrl = typeof images.logo === 'string' ? images.logo : images.logo.url;
      if (logoUrl) {
        const newUrl = convertImageUrl(logoUrl);
        processedImages.logo = typeof images.logo === 'string' 
          ? newUrl
          : { ...images.logo, url: newUrl };
      }
    }

    return {
      ...signature,
      images: processedImages
    };
  }

  /**
   * Generate clean static template HTML without animations
   */
  private async generateStaticTemplateHtml(signature: Signature): Promise<string> {
    const { personalInfo, images, socialMedia, templateId, elementPositions } = signature;
    const personalInfoTyped = personalInfo as PersonalInfo;
    const imagesTyped = images as any;
    const socialMediaTyped = socialMedia as SocialMedia | null;
    const positions = elementPositions as any || {};

    // Helper function to get image URL regardless of format
    const getImageUrl = (image: any): string | null => {
      if (!image) return null;
      return typeof image === 'string' ? image : image.url;
    };

    // Helper function to apply element positioning and scaling
    const getElementStyle = (elementKey: string, baseStyle: string = ''): string => {
      const pos = positions[elementKey];
      if (!pos) return baseStyle;
      
      const transform = [];
      // Check for any positioning values
      if ((pos.x !== undefined && pos.x !== 0) || (pos.y !== undefined && pos.y !== 0)) {
        transform.push(`translate(${pos.x || 0}px, ${pos.y || 0}px)`);
      }
      if (pos.scale !== undefined && pos.scale !== 1) {
        transform.push(`scale(${pos.scale})`);
      }
      
      if (transform.length > 0) {
        const transformStyle = `transform: ${transform.join(' ')};`;
        return baseStyle ? `${baseStyle} ${transformStyle}` : transformStyle;
      }
      
      return baseStyle;
    };

    // Helper function to get image size from saved settings
    const getImageSize = (type: 'headshot' | 'logo'): { width?: string; height?: string } => {
      const size = type === 'headshot' ? imagesTyped?.headshotSize : imagesTyped?.logoSize;
      if (!size || size === 100) return {}; // 100 is default, no need to set
      
      if (type === 'headshot') {
        const dimension = `${Math.round(80 * (size / 100))}px`;
        return { width: dimension, height: dimension };
      } else {
        const maxWidth = Math.round(120 * (size / 100));
        return { maxWidth: `${maxWidth}px` };
      }
    };

    if (templateId === 'sales-professional') {
      const headshotUrl = getImageUrl(imagesTyped?.headshot);
      const logoUrl = getImageUrl(imagesTyped?.logo);
      const headshotSize = getImageSize('headshot');
      const logoSize = getImageSize('logo');
      
      // Calculate responsive dimensions with better scaling
      const headshotSizePercent = imagesTyped?.headshotSize || 100;
      const logoSizePercent = imagesTyped?.logoSize || 100;
      
      // Increased headshot dimensions to match saved design (max 200px)
      const headshotWidthPx = Math.min(Math.round(headshotSizePercent * 2.0), 200);
      const logoWidthPx = Math.round(logoSizePercent * 0.6);
      
      // Adjusted content width calculation - balanced with larger headshot
      const contentWidth = `calc(100% - 80px - ${headshotWidthPx + 24}px)`;
      
      return `
        <div style="position: relative; background: white; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow: hidden; max-width: 650px; width: 100%; margin: 0 auto; font-family: 'Playfair Display', 'Times New Roman', serif;">
          
          <!-- Background geometric patterns - matching saved signature positioning -->
          <div style="position: absolute; inset: 0; overflow: hidden; pointer-events: none;">
            <div style="position: absolute; top: 0; right: ${headshotWidthPx + 20}px; width: calc(50% - ${Math.round(headshotWidthPx / 2)}px); height: 100%;">
              <!-- Adjusted positioning to match original template exactly -->
              <div style="position: absolute; right: -11px; top: 54px; width: 128px; height: 128px; transform: rotate(45deg); background: linear-gradient(135deg, #22d3ee, #0891b2); opacity: 0.1;"></div>
              <div style="position: absolute; right: -3px; top: 118px; width: 96px; height: 96px; transform: rotate(-12deg); background: linear-gradient(135deg, #6b7280, #374151); opacity: 0.2;"></div>
              <div style="position: absolute; right: -7px; bottom: 74px; width: 80px; height: 80px; transform: rotate(12deg); background: linear-gradient(135deg, #14b8a6, #0891b2); opacity: 0.15;"></div>
            </div>
          </div>
          
          <div style="display: flex; position: relative; z-index: 10;">
            
            <!-- Left Sidebar with Social Icons -->
            <div style="${getElementStyle('social', 'width: 80px; min-height: 100%; background: linear-gradient(180deg, #22d3ee, #2563eb); border-radius: 12px 0 0 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px;')}">
              ${this.generateSalesProSocialIconsHtml(socialMediaTyped)}
            </div>
            
            <!-- Main Content Area -->
            <div style="padding: 32px; width: ${contentWidth};">
              
              <!-- Company Logo -->
              ${logoUrl ? `
                <div style="${getElementStyle('logo', 'margin-bottom: 16px;')}">
                  <div style="display: flex; align-items: center; justify-content: center; width: ${logoWidthPx}px; height: 48px;">
                    <img src="${logoUrl}" alt="${personalInfoTyped.company}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                  </div>
                </div>
              ` : ''}
              
              <!-- Name and Title -->
              <div style="${getElementStyle('name')}">
                <h2 style="margin: 0 0 8px 0; color: #1f2937; font-size: 32px; font-weight: bold; line-height: 1.2;">
                  ${personalInfoTyped.name}
                </h2>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 18px; font-weight: 500;">
                  ${personalInfoTyped.title}
                </p>
              </div>
              
              <!-- Company -->
              <div style="${getElementStyle('company')}">
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; font-weight: 500;">
                  ${personalInfoTyped.company || ''}
                </p>
              </div>
              
              <!-- Contact Information -->
              <div style="${getElementStyle('contact', 'font-size: 14px; line-height: 1.6; color: #4b5563;')}">
                ${personalInfoTyped.email ? `
                  <div style="margin-bottom: 8px;">
                    <a href="mailto:${personalInfoTyped.email}" style="color: #0891b2; text-decoration: none; display: flex; align-items: center; gap: 8px;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: #6b7280;">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="22,6 12,13 2,6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      ${personalInfoTyped.email}
                    </a>
                  </div>
                ` : ''}
                ${personalInfoTyped.phone ? `
                  <div style="margin-bottom: 8px;">
                    <a href="tel:${personalInfoTyped.phone}" style="color: #0891b2; text-decoration: none; display: flex; align-items: center; gap: 8px;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: #6b7280;">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      ${personalInfoTyped.phone}
                    </a>
                  </div>
                ` : ''}
                ${personalInfoTyped.website ? `
                  <div style="margin-bottom: 8px;">
                    <a href="${personalInfoTyped.website}" style="color: #0891b2; text-decoration: none; display: flex; align-items: center; gap: 8px;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: #6b7280;">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="2" x2="22" y1="12" y2="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      ${personalInfoTyped.website}
                    </a>
                  </div>
                ` : ''}
              </div>
              
            </div>
            
            <!-- Profile Photo -->
            ${headshotUrl ? `
              <div style="${getElementStyle('headshot', `position: absolute; top: 0; right: 0; bottom: 0; width: ${headshotWidthPx}px; overflow: hidden; border-radius: 0 12px 12px 0;`)}">
                <img src="${headshotUrl}" alt="${personalInfoTyped.name}" style="width: 100%; height: 100%; object-fit: cover; clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);" />
                <!-- Overlay for geometric effect -->
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(31, 41, 55, 0.2) 100%); clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%); pointer-events: none;"></div>
              </div>
            ` : ''}
            
          </div>
        </div>
      `;
    }
    
    // Default static template for other template types
    const headshotUrl = getImageUrl(imagesTyped?.headshot);
    const logoUrl = getImageUrl(imagesTyped?.logo);
    
    return `
      <div style="padding: 24px;">
        <table cellpadding="0" cellspacing="0" style="width: 100%; border: none;">
          <tr>
            <td style="vertical-align: top; padding-right: 20px;">
              ${headshotUrl ? `
                <div class="headshot-element">
                  <img src="${headshotUrl}" alt="${personalInfoTyped.name}" />
                </div>
              ` : ''}
            </td>
            <td style="vertical-align: top;">
              ${logoUrl ? `
                <div class="logo-element" style="margin-bottom: 12px;">
                  <img src="${logoUrl}" alt="${personalInfoTyped.company}" />
                </div>
              ` : ''}
              
              <h2 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 20px; font-weight: bold;">
                ${personalInfoTyped.name}
              </h2>
              <p style="margin: 0 0 12px 0; color: #666; font-size: 16px;">
                ${personalInfoTyped.title} at ${personalInfoTyped.company}
              </p>
              
              <div style="font-size: 14px; line-height: 1.6; color: #555; margin-bottom: 12px;">
                ${personalInfoTyped.email ? `<div><a href="mailto:${personalInfoTyped.email}" style="color: #0077b5; text-decoration: none;">${personalInfoTyped.email}</a></div>` : ''}
                ${personalInfoTyped.phone ? `<div><a href="tel:${personalInfoTyped.phone}" style="color: #0077b5; text-decoration: none;">${personalInfoTyped.phone}</a></div>` : ''}
                ${personalInfoTyped.website ? `<div><a href="${personalInfoTyped.website}" style="color: #0077b5; text-decoration: none;">${personalInfoTyped.website}</a></div>` : ''}
              </div>
              
              ${this.generateStaticSocialIconsHtml(socialMediaTyped)}
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  /**
   * Generate social icons for Sales Professional template sidebar
   */
  private generateSalesProSocialIconsHtml(socialMedia: SocialMedia | null): string {
    if (!socialMedia) return '';
    
    const iconStyle = "color: white; text-decoration: none; display: inline-block; width: 24px; height: 24px;";
    const icons = [];
    
    if (socialMedia.twitter) {
      icons.push(`<a href="${socialMedia.twitter}" style="${iconStyle}">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
        </svg>
      </a>`);
    }
    if (socialMedia.linkedin) {
      icons.push(`<a href="${socialMedia.linkedin}" style="${iconStyle}">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <rect width="4" height="12" x="2" y="9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="4" cy="4" r="2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>`);
    }
    if (socialMedia.instagram) {
      icons.push(`<a href="${socialMedia.instagram}" style="${iconStyle}">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>`);
    }
    if (socialMedia.youtube) {
      icons.push(`<a href="${socialMedia.youtube}" style="${iconStyle}">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0 2 2 0 0 1-1.4-1.4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polygon points="10,8 16,12 10,16" fill="currentColor"/>
        </svg>
      </a>`);
    }
    if (socialMedia.tiktok) {
      icons.push(`<a href="${socialMedia.tiktok}" style="${iconStyle}">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>`);
    }
    
    return icons.join('');
  }

  /**
   * Generate static social media icons HTML without animations
   */
  private generateStaticSocialIconsHtml(socialMedia: SocialMedia | null): string {
    const socialLinks = [
      { key: 'linkedin', url: socialMedia?.linkedin, icon: 'in', bgClass: 'social-linkedin' },
      { key: 'twitter', url: socialMedia?.twitter, icon: '𝕏', bgClass: 'social-twitter' },
      { key: 'instagram', url: socialMedia?.instagram, icon: '📷', bgClass: 'social-instagram' },
      { key: 'youtube', url: socialMedia?.youtube, icon: '▶', bgClass: 'social-youtube' },
      { key: 'tiktok', url: socialMedia?.tiktok, icon: '🎵', bgClass: 'social-tiktok' },
    ];

    const validLinks = socialLinks.filter(link => link.url);
    
    if (validLinks.length === 0) return '';

    return `
      <div class="social-icons">
        ${validLinks.map(link => `
          <a href="${link.url}" class="social-icon ${link.bgClass}" target="_blank" rel="noopener">
            ${link.icon}
          </a>
        `).join('')}
      </div>
    `;
  }

  private identifyAnimatedElements(signature: Signature): string[] {
    const animated: string[] = [];
    const elementAnimations = signature.elementAnimations as ElementAnimations | null;
    
    if (elementAnimations?.headshot && elementAnimations.headshot !== 'none') {
      animated.push('headshot-element');
    }
    
    if (elementAnimations?.logo && elementAnimations.logo !== 'none') {
      animated.push('logo-element');
    }
    
    if (elementAnimations?.socialIcons && elementAnimations.socialIcons !== 'none') {
      animated.push('social-icons-element');
    }
    
    return animated;
  }

  /**
   * Generate a GIF for a specific animated element
   */
  private async generateElementGif(
    htmlContent: string, 
    elementId: string, 
    signature: Signature,
    config: AnimationConfig = DEFAULT_ANIMATION_CONFIG
  ): Promise<string | null> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    
    try {
      // Set page size
      await page.setViewport({ width: config.width, height: config.height });
      
      // Load the HTML content
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Find the element to animate
      const element = await page.$(`#${elementId}`);
      if (!element) {
        console.warn(`Element ${elementId} not found`);
        return null;
      }

      // Get element bounding box
      const boundingBox = await element.boundingBox();
      if (!boundingBox) {
        console.warn(`Could not get bounding box for ${elementId}`);
        return null;
      }

      // Create GIF encoder
      const gifPath = path.join('uploads', `${elementId}-${Date.now()}.gif`);
      const encoder = new GIFEncoder(Math.ceil(boundingBox.width), Math.ceil(boundingBox.height));
      
      // Setup GIF encoder
      const stream = require('fs').createWriteStream(gifPath);
      encoder.createReadStream().pipe(stream);
      encoder.start();
      encoder.setRepeat(0); // Loop forever
      encoder.setDelay(config.frameDuration);
      encoder.setQuality(10);

      // Capture animation frames
      for (let frame = 0; frame < config.frameCount; frame++) {
        // Calculate animation progress (0 to 1)
        const progress = frame / (config.frameCount - 1);
        
        // Advance CSS animation by modifying animation-delay
        await page.evaluate((elementId, progress) => {
          const element = document.getElementById(elementId);
          if (element) {
            // Force animation to specific frame by manipulating animation-delay
            const animationDuration = 2; // 2 seconds default
            const currentTime = progress * animationDuration;
            element.style.animationDelay = `-${currentTime}s`;
            element.style.animationPlayState = 'paused';
          }
        }, elementId, progress);

        // Wait for animation to settle
        await new Promise(resolve => setTimeout(resolve, 50));

        // Capture element screenshot as buffer
        const screenshot = await element.screenshot();
        
        // Add frame directly from buffer - GIFEncoder can handle Buffers
        encoder.addFrame(screenshot);
      }

      encoder.finish();

      // Wait for file to be written
      await new Promise((resolve) => {
        stream.on('finish', resolve);
      });

      // Return public URL
      return `/api/files/${path.basename(gifPath)}`;
      
    } catch (error) {
      console.error(`Error generating GIF for ${elementId}:`, error);
      return null;
    } finally {
      await page.close();
    }
  }

  /**
   * Replace animated elements in HTML with GIF URLs while preserving links
   */
  private async replaceAnimatedElementsWithGifs(
    htmlContent: string, 
    gifUrls: { [elementId: string]: string }
  ): Promise<string> {
    let finalHtml = htmlContent;
    
    // Replace each animated element with its GIF equivalent
    for (const [elementId, gifUrl] of Object.entries(gifUrls)) {
      if (elementId === 'headshot-element') {
        // Replace headshot img src while preserving any wrapper elements
        finalHtml = finalHtml.replace(
          /(<div[^>]*id="headshot-element"[^>]*>[\s\S]*?<img[^>]+)src="[^"]*"([^>]*>[\s\S]*?<\/div>)/g,
          `$1src="${gifUrl}"$2`
        );
      } else if (elementId === 'logo-element') {
        // Replace logo img src while preserving any wrapper elements  
        finalHtml = finalHtml.replace(
          /(<div[^>]*id="logo-element"[^>]*>[\s\S]*?<img[^>]+)src="[^"]*"([^>]*>[\s\S]*?<\/div>)/g,
          `$1src="${gifUrl}"$2`
        );
      } else if (elementId === 'social-icons-element') {
        // For social icons, we need to replace the entire element with a GIF
        // while preserving the link structure - this is more complex
        finalHtml = finalHtml.replace(
          /(<div[^>]*id="social-icons-element"[^>]*>)([\s\S]*?)(<\/div>)/g,
          `$1<img src="${gifUrl}" alt="Social Media Icons" style="display: block;">$3`
        );
      }
    }
    
    // Remove animation CSS classes from final HTML since we're using GIFs
    finalHtml = finalHtml.replace(/animate-[\w-]+/g, '');
    finalHtml = finalHtml.replace(/delay-[\w-]+/g, '');
    
    return finalHtml;
  }
}

// Export singleton instance
export const signatureExportService = new SignatureExportService();