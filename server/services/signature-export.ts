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
    // Use signature tag to determine export pipeline
    if (signature.tag === 'static') {
      // Simple export for static signatures
      return await this.exportStaticSignature(signature);
    } else {
      // Complex export with GIF baking for dynamic signatures
      return await this.bakeSignatureAnimations(signature);
    }
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
   * Generate static HTML for signatures without animations
   */
  private async generateStaticSignatureHtml(signature: Signature): Promise<string> {
    const { personalInfo, images, socialMedia, templateId, elementPositions } = signature;
    
    // Convert relative URLs to absolute URLs for static export
    const processedSignature = await this.processImageUrlsForStatic(signature);
    
    // Generate clean static template HTML (not the animated version)
    const templateHtml = await this.generateStaticTemplateHtml(processedSignature);
    
    // Get template-specific CSS
    const templateCSS = this.getTemplateSpecificCSS(templateId || 'sales-professional');
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Signature</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <style>
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Playfair Display', serif;
            background: #f8f9fa;
            line-height: 1.4;
        }
        
        /* Email client compatibility */
        table { 
            border-collapse: collapse; 
            width: 100%;
        }
        
        img { 
            border: 0; 
            outline: none; 
            text-decoration: none;
            max-width: 100%;
            height: auto;
        }
        
        a { 
            text-decoration: none;
            color: inherit;
        }
        
        /* Static signature styles - no animations */
        .signature-element {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
        }
        
        /* Remove any animation classes */
        .animate-fade-in,
        .animate-pulse,
        .animate-zoom-in,
        .animate-rotate {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
        }
        
        ${templateCSS}
        
        /* Ensure all elements are visible */
        .logo-element,
        .headshot-element,
        .social-icons-element,
        .name-element,
        .title-element,
        .contact-element {
            opacity: 1 !important;
            visibility: visible !important;
        }
        
    </style>
</head>
<body>
    ${templateHtml}
</body>
</html>`;
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

    const baseUrl = process.env.REPL_SLUG 
      ? `https://${process.env.REPL_ID}.replit.app`
      : 'http://localhost:5000';

    const processedImages = { ...images };



    // Convert headshot URL - handle both string and object formats
    if (images.headshot) {
      const headshotUrl = typeof images.headshot === 'string' ? images.headshot : images.headshot.url;
      if (headshotUrl && headshotUrl.startsWith('/api/files/')) {
        processedImages.headshot = typeof images.headshot === 'string' 
          ? `${baseUrl}${headshotUrl}`
          : { ...images.headshot, url: `${baseUrl}${headshotUrl}` };

      }
    }

    // Convert logo URL - handle both string and object formats
    if (images.logo) {
      const logoUrl = typeof images.logo === 'string' ? images.logo : images.logo.url;
      if (logoUrl && logoUrl.startsWith('/api/files/')) {
        processedImages.logo = typeof images.logo === 'string' 
          ? `${baseUrl}${logoUrl}`
          : { ...images.logo, url: `${baseUrl}${logoUrl}` };

      }
    }

    return {
      ...signature,
      images: processedImages
    };
  }



  /**
   * Generate clean static template HTML without animations - matches live preview design
   */
  private async generateStaticTemplateHtml(signature: Signature): Promise<string> {
    const { personalInfo, images, socialMedia, templateId } = signature;
    const personalInfoTyped = personalInfo as PersonalInfo;
    const imagesTyped = images as any;
    const socialMediaTyped = socialMedia as SocialMedia | null;

    // Helper function to get image URL regardless of format
    const getImageUrl = (image: any): string | null => {
      if (!image) return null;
      return typeof image === 'string' ? image : image.url;
    };

    if (templateId === 'sales-professional') {
      const headshotUrl = getImageUrl(imagesTyped?.headshot);
      const logoUrl = getImageUrl(imagesTyped?.logo);
      
      return `
        <div style="font-family: 'Playfair Display', serif; max-width: 600px; margin: 0 auto;">
          <table cellpadding="0" cellspacing="0" style="width: 100%; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; overflow: hidden;">
            <tr>
              <td style="padding: 32px;">
                <table cellpadding="0" cellspacing="0" style="width: 100%; border: none;">
                  <tr>
                    <td style="vertical-align: top; width: 120px; padding-right: 24px;">
                      ${headshotUrl ? `
                        <div style="position: relative;">
                          <img src="${headshotUrl}" alt="${personalInfoTyped.name}" 
                               style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid rgba(255,255,255,0.9); box-shadow: 0 8px 24px rgba(0,0,0,0.15);" />
                        </div>
                      ` : ''}
                      <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
                        ${this.generateSocialIconsHtml(socialMediaTyped)}
                      </div>
                    </td>
                    <td style="vertical-align: top;">
                      <div style="color: white;">
                        ${logoUrl ? `
                          <div style="margin-bottom: 20px;">
                            <img src="${logoUrl}" alt="${personalInfoTyped.company}" 
                                 style="max-width: 160px; max-height: 60px; object-fit: contain;" />
                          </div>
                        ` : ''}
                        
                        <h2 style="margin: 0 0 8px 0; color: white; font-size: 28px; font-weight: 700; font-family: 'Playfair Display', serif;">
                          ${personalInfoTyped.name}
                        </h2>
                        <p style="margin: 0 0 6px 0; color: rgba(255,255,255,0.9); font-size: 18px; font-weight: 500;">
                          ${personalInfoTyped.title}
                        </p>
                        <p style="margin: 0 0 20px 0; color: rgba(255,255,255,0.8); font-size: 16px; font-weight: 400;">
                          ${personalInfoTyped.company}
                        </p>
                        
                        <div style="color: rgba(255,255,255,0.95); font-size: 14px; line-height: 1.8;">
                          ${personalInfoTyped.email ? `
                            <div style="margin-bottom: 8px; display: flex; align-items: center;">
                              <span style="margin-right: 8px;">📧</span>
                              <a href="mailto:${personalInfoTyped.email}" style="color: rgba(255,255,255,0.95); text-decoration: none; hover: text-decoration: underline;">
                                ${personalInfoTyped.email}
                              </a>
                            </div>
                          ` : ''}
                          ${personalInfoTyped.phone ? `
                            <div style="margin-bottom: 8px; display: flex; align-items: center;">
                              <span style="margin-right: 8px;">📞</span>
                              <a href="tel:${personalInfoTyped.phone.replace(/\s/g, '')}" style="color: rgba(255,255,255,0.95); text-decoration: none;">
                                ${personalInfoTyped.phone}
                              </a>
                            </div>
                          ` : ''}
                          ${personalInfoTyped.website ? `
                            <div style="margin-bottom: 8px; display: flex; align-items: center;">
                              <span style="margin-right: 8px;">🌐</span>
                              <a href="${personalInfoTyped.website}" style="color: rgba(255,255,255,0.95); text-decoration: none;">
                                ${personalInfoTyped.website}
                              </a>
                            </div>
                          ` : ''}
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `;
    }
    
    // Default static template for other template types
    const headshotUrl = getImageUrl(imagesTyped?.headshot);
    const logoUrl = getImageUrl(imagesTyped?.logo);
    
    return `
      <div style="font-family: 'Playfair Display', serif; padding: 24px; max-width: 600px; margin: 0 auto;">
        <table cellpadding="0" cellspacing="0" style="width: 100%; border: none;">
          <tr>
            <td style="vertical-align: top; padding-right: 20px;">
              ${headshotUrl ? `
                <div style="margin-bottom: 16px;">
                  <img src="${headshotUrl}" alt="${personalInfoTyped.name}" 
                       style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;" />
                </div>
              ` : ''}
            </td>
            <td style="vertical-align: top;">
              ${logoUrl ? `
                <div style="margin-bottom: 12px;">
                  <img src="${logoUrl}" alt="${personalInfoTyped.company}" 
                       style="max-width: 120px; max-height: 60px; object-fit: contain;" />
                </div>
              ` : ''}
                
                <h2 style="margin: 0 0 4px 0; color: #1a1a1a; font-size: 24px; font-weight: bold;">
                  ${personalInfoTyped.name}
                </h2>
                <p style="margin: 0 0 8px 0; color: #666; font-size: 16px;">
                  ${personalInfoTyped.title}
                </p>
                <p style="margin: 0 0 16px 0; color: #333; font-size: 14px; font-weight: 500;">
                  ${personalInfoTyped.company || ''}
                </p>
                
                <div style="font-size: 14px; line-height: 1.6; color: #555;">
                  ${personalInfoTyped.email ? `
                    <div style="margin-bottom: 4px;">
                      <a href="mailto:${personalInfoTyped.email}" style="color: #0077b5; text-decoration: none;">
                        📧 ${personalInfoTyped.email}
                      </a>
                    </div>
                  ` : ''}
                  ${personalInfoTyped.phone ? `
                    <div style="margin-bottom: 4px;">
                      <a href="tel:${personalInfoTyped.phone}" style="color: #0077b5; text-decoration: none;">
                        📞 ${personalInfoTyped.phone}
                      </a>
                    </div>
                  ` : ''}
                  ${personalInfoTyped.website ? `
                    <div style="margin-bottom: 4px;">
                      <a href="${personalInfoTyped.website}" style="color: #0077b5; text-decoration: none;">
                        🌐 ${personalInfoTyped.website}
                      </a>
                    </div>
                  ` : ''}
                </div>
              </td>
            </tr>
          </table>
        </div>
      `;
    }
    
    return `<div>Template not found</div>`;
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