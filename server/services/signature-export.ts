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
  async exportSignature(signature: Signature, emailClient: string = 'gmail'): Promise<ExportResult> {
    // Check if signature has any actual animations
    const hasAnimations = this.hasActiveAnimations(signature);
    
    if (!hasAnimations || signature.tag === 'static') {
      // Simple export for static signatures with email client optimization
      return await this.exportStaticSignature(signature, emailClient);
    } else {
      // Complex export with GIF baking for dynamic signatures
      return await this.bakeSignatureAnimations(signature, emailClient);
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
  async exportStaticSignature(signature: Signature, emailClient: string = 'gmail'): Promise<ExportResult> {
    try {
      // Generate clean HTML without any animation classes or scripts
      const staticHtml = await this.generateStaticSignatureHtml(signature, emailClient);
      
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
  async bakeSignatureAnimations(signature: Signature, emailClient: string = 'gmail'): Promise<ExportResult> {
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
  private async generateStaticSignatureHtml(signature: Signature, emailClient: string = 'gmail'): Promise<string> {
    const { personalInfo, images, socialMedia, templateId, elementPositions } = signature;
    
    // Convert relative URLs to absolute URLs for static export
    const processedSignature = await this.processImageUrlsForStatic(signature);
    
    // Generate clean static template HTML (not the animated version)
    const templateHtml = await this.generateStaticTemplateHtml(processedSignature);
    
    // Get template-specific CSS with email client optimizations
    const templateCSS = this.getTemplateSpecificCSS(templateId || 'sales-professional');
    const emailClientCSS = this.getEmailClientSpecificCSS(emailClient);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Signature</title>
    ${this.getEmailClientFontImports(emailClient)}
    <style>
      ${emailClientCSS}
    </style>
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
            max-width: 100%;
            height: auto; 
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
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            overflow: hidden;
            max-width: 768px;
            margin: 0 auto;
            position: relative;
            display: flex;
            height: 300px;
          }
          
          /* Geometric background shapes */
          .geometric-bg {
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
          }
          
          .geometric-shape-1 {
            position: absolute;
            right: 150px;
            top: 54px;
            width: 128px;
            height: 128px;
            background: linear-gradient(135deg, #22d3ee, #0891b2);
            opacity: 0.1;
            transform: rotate(45deg);
          }
          
          .geometric-shape-2 {
            position: absolute;
            right: 158px;
            top: 118px;
            width: 96px;
            height: 96px;
            background: linear-gradient(135deg, #4b5563, #1f2937);
            opacity: 0.2;
            transform: rotate(-12deg);
          }
          
          .geometric-shape-3 {
            position: absolute;
            right: 154px;
            bottom: 74px;
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #0d9488, #065f46);
            opacity: 0.15;
            transform: rotate(12deg);
          }
          
          /* Left sidebar with social icons */
          .social-sidebar {
            width: 80px;
            height: 100%;
            background: linear-gradient(180deg, #22d3ee 0%, #2563eb 100%);
            border-radius: 12px 0 0 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
            position: relative;
            z-index: 2;
          }
          
          .social-icon {
            width: 24px;
            height: 24px;
            color: white;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          }
          
          .social-icon:hover {
            color: rgba(255,255,255,0.7);
          }
          
          /* Main content area */
          .main-content {
            padding: 32px;
            flex: 1;
            position: relative;
            z-index: 2;
          }
          
          .company-logo {
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
          }
          
          .company-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          
          .company-name {
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 0.1em;
            color: #111827;
            margin-bottom: 24px;
            font-family: 'Playfair Display', serif;
          }
          
          .person-name {
            font-size: 30px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 8px;
            font-family: 'Playfair Display', serif;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .person-title {
            font-size: 20px;
            color: #374151;
            font-weight: 500;
            margin-bottom: 24px;
            font-family: 'Playfair Display', serif;
          }
          
          .contact-info {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 18px;
            color: #111827;
            font-family: 'Playfair Display', serif;
          }
          
          .contact-icon {
            width: 20px;
            height: 20px;
            color: #6b7280;
            flex-shrink: 0;
          }
          
          /* Right side headshot area */
          .headshot-area {
            position: relative;
            overflow: hidden;
            height: 100%;
            z-index: 2;
          }
          
          .headshot-container {
            position: absolute;
            inset: 0;
          }
          
          .headshot-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);
          }
          
          .headshot-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(17, 24, 39, 0.2));
            clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);
          }
          
          .headshot-placeholder {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, #e5e7eb, #9ca3af);
            clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
            font-size: 14px;
          }
          
          .checkmark {
            color: #06b6d4;
            font-size: 24px;
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
   * Get email client specific CSS optimizations
   */
  private getEmailClientSpecificCSS(emailClient: string): string {
    switch (emailClient) {
      case 'gmail':
        return `
          /* Gmail-specific optimizations */
          .gmail-font-fallback {
            font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif !important;
          }
          
          /* Gmail strips some CSS, inline critical styles */
          table {
            border-collapse: collapse !important;
            border-spacing: 0 !important;
            width: 100% !important;
          }
          
          /* Force Gmail to respect font sizes */
          * {
            -webkit-text-size-adjust: 100% !important;
            -ms-text-size-adjust: 100% !important;
          }
          
          /* Gmail link color override */
          a[href] {
            color: inherit !important;
            text-decoration: none !important;
          }
          
          /* Gmail button styling */
          .social-icon {
            display: inline-block !important;
            text-decoration: none !important;
          }
          
          /* Gmail image display fix */
          img {
            display: block !important;
            max-width: 100% !important;
            height: auto !important;
          }
        `;
        
      case 'outlook':
        return `
          /* Outlook-specific optimizations */
          table {
            mso-table-lspace: 0pt !important;
            mso-table-rspace: 0pt !important;
          }
          
          /* Outlook font fallback */
          .outlook-font-fallback {
            font-family: 'Playfair Display', 'Cambria', 'Georgia', serif !important;
          }
          
          /* Fix Outlook spacing issues */
          td {
            mso-line-height-rule: exactly !important;
          }
        `;
        
      case 'apple-mail':
        return `
          /* Apple Mail optimizations */
          .apple-mail-font {
            font-family: 'Playfair Display', 'Baskerville', 'Georgia', serif !important;
          }
          
          /* Apple Mail link styling */
          a {
            color: inherit !important;
            text-decoration: none !important;
          }
        `;
        
      default:
        return '';
    }
  }

  /**
   * Get email client specific font imports
   */
  private getEmailClientFontImports(emailClient: string): string {
    switch (emailClient) {
      case 'gmail':
        return `
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
          <style>
            /* Gmail font import with fallbacks */
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
          </style>
        `;
        
      case 'outlook':
        return `
          <!-- Outlook-specific font handling -->
          <!--[if mso]>
          <style>
            * { font-family: 'Cambria', 'Georgia', serif !important; }
          </style>
          <![endif]-->
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
        `;
        
      case 'apple-mail':
        return `
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,899&display=swap" rel="stylesheet">
        `;
        
      default:
        return `
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
        `;
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
        <div style="position: relative; background: white; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow: hidden; max-width: 650px; width: 100%; height: 280px; margin: 0 auto; font-family: 'Playfair Display', 'Times New Roman', serif;">
          
          <!-- Background geometric patterns - matching saved signature positioning -->
          <div style="position: absolute; inset: 0; overflow: hidden; pointer-events: none;">
            <div style="position: absolute; top: 0; right: ${headshotWidthPx + 20}px; width: calc(50% - ${Math.round(headshotWidthPx / 2)}px); height: 100%;">
              <!-- Adjusted positioning to match original template exactly -->
              <div style="position: absolute; right: -11px; top: 54px; width: 128px; height: 128px; transform: rotate(45deg); background: linear-gradient(135deg, #22d3ee, #0891b2); opacity: 0.1;"></div>
              <div style="position: absolute; right: -3px; top: 118px; width: 96px; height: 96px; transform: rotate(-12deg); background: linear-gradient(135deg, #6b7280, #374151); opacity: 0.2;"></div>
              <div style="position: absolute; right: -7px; bottom: 74px; width: 80px; height: 80px; transform: rotate(12deg); background: linear-gradient(135deg, #14b8a6, #0891b2); opacity: 0.15;"></div>
            </div>
          </div>
          
          <div style="display: flex; position: relative; z-index: 10; height: 100%;">
            
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
                        <line x1="2" y1="12" x2="22" y2="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="m2 12 .87 2.61a7.94 7.94 0 0 0 .46 1.02 8 8 0 0 0 8.13 4.28 8 8 0 0 0 8-8c0-2.28-.94-4.34-2.46-5.83A8 8 0 0 0 12 4a8 8 0 0 0-7.74 6c0 .32.06.64.12.96L2 12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      ${personalInfoTyped.website}
                    </a>
                  </div>
                ` : ''}
              </div>
            </div>
            
            <!-- Right Side Headshot Area -->
            <div style="${getElementStyle('headshot', `position: relative; overflow: hidden; height: 100%; width: ${headshotWidthPx}px;`)}">
              ${headshotUrl ? `
                <div style="position: absolute; inset: 0;">
                  <img src="${headshotUrl}" alt="${personalInfoTyped.name} headshot" style="width: 100%; height: 100%; object-fit: cover; clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);" />
                  <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(17, 24, 39, 0.2)); clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);"></div>
                </div>
              ` : `
                <div style="position: absolute; inset: 0; background: linear-gradient(135deg, #e5e7eb, #9ca3af); clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%); display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px;">
                  Portrait
                </div>
              `}
            </div>
          </div>
        </div>
      `;
    }

    return '<div>Template not found</div>';
  }

  /**
   * Generate social media icons HTML for Sales Professional template
   */
  private generateSalesProSocialIconsHtml(socialMedia: SocialMedia | null): string {
    if (!socialMedia) return '';

    const socialLinks = [
      { key: 'twitter', url: socialMedia.twitter, icon: '𝕏' },
      { key: 'linkedin', url: socialMedia.linkedin, icon: 'in' },
      { key: 'instagram', url: socialMedia.instagram, icon: '📷' },
      { key: 'youtube', url: socialMedia.youtube, icon: '▶' },
      { key: 'tiktok', url: socialMedia.tiktok, icon: '🎵' },
    ];

    const validLinks = socialLinks.filter(link => link.url);
    
    if (validLinks.length === 0) return '';

    return validLinks.map(link => `
      <a href="${link.url}" style="width: 24px; height: 24px; color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;" target="_blank" rel="noopener">
        ${link.icon}
      </a>
    `).join('');
  }

  /**
   * Generate default template HTML for other template types
   */
  private generateDefaultTemplateHtml(signature: Signature): string {
    const { personalInfo, images, socialMedia } = signature;
    const personalInfoTyped = personalInfo as PersonalInfo;
    const imagesTyped = images as any;
    const socialMediaTyped = socialMedia as SocialMedia | null;

    // Helper function to get image URL regardless of format
    const getImageUrl = (image: any): string | null => {
      if (!image) return null;
      return typeof image === 'string' ? image : image.url;
    };

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