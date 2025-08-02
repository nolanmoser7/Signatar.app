
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
    // Use exact replica generator to match saved design precisely
    const rawHtml = this.generateExactReplicaHtml(signature);
    
    // Process through juice to inline all styles
    const inlinedHtml = await this.inlineStyles(rawHtml);
    
    // Extract and clean the table structure
    const cleanTableHtml = this.extractTableStructure(inlinedHtml);
    
    return cleanTableHtml;
  }

  /**
   * Generate Gmail-optimized single table version that works around Gmail limitations
   */
  private generateGmailOptimizedTable(signature: Signature): string {
    const { personalInfo, images, socialMedia, templateId } = signature;
    const personalInfoTyped = personalInfo as PersonalInfo;
    const imagesTyped = images as any;
    const socialMediaTyped = socialMedia as SocialMedia | null;

    const headshotUrl = this.getAbsoluteImageUrl(imagesTyped?.headshot);
    const logoUrl = this.getAbsoluteImageUrl(imagesTyped?.logo);
    
    const headshotSizePercent = imagesTyped?.headshotSize || 100;
    const logoSizePercent = imagesTyped?.logoSize || 100;
    const headshotWidth = Math.min(Math.round(headshotSizePercent * 1.2), 120);
    const logoWidth = Math.min(Math.round(logoSizePercent * 0.8), 100);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        .gmail-signature-table {
            border-collapse: collapse;
            font-family: Arial, sans-serif;
            max-width: 550px;
            width: 100%;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .social-column {
            width: 60px;
            background: linear-gradient(to bottom, #22d3ee, #2563eb);
            vertical-align: top;
            text-align: center;
            padding: 16px 8px;
        }
        
        .content-column {
            padding: 24px;
            vertical-align: top;
            width: auto;
        }
        
        .headshot-column {
            width: ${headshotWidth}px;
            vertical-align: top;
            text-align: right;
            padding: 0;
        }
        
        .social-link {
            color: white;
            text-decoration: none;
            font-size: 16px;
            display: block;
            margin-bottom: 12px;
        }
        
        .name-text {
            margin: 0 0 6px 0;
            color: #1f2937;
            font-size: 24px;
            font-weight: bold;
            line-height: 1.2;
            font-family: Arial, sans-serif;
        }
        
        .title-text {
            margin: 0 0 4px 0;
            color: #6b7280;
            font-size: 16px;
            font-weight: normal;
        }
        
        .company-text {
            margin: 0 0 16px 0;
            color: #374151;
            font-size: 14px;
            font-weight: normal;
        }
        
        .contact-table {
            border-collapse: collapse;
        }
        
        .contact-row {
            padding-bottom: 4px;
        }
        
        .contact-link {
            color: #0891b2;
            text-decoration: none;
            font-size: 14px;
        }
        
        .headshot-img {
            width: ${headshotWidth}px;
            height: 140px;
            object-fit: cover;
            display: block;
            border-radius: 0 8px 8px 0;
        }
        
        .logo-img {
            max-width: ${logoWidth}px;
            max-height: 36px;
            display: block;
        }
    </style>
</head>
<body>
    <table class="gmail-signature-table" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td class="social-column">
                ${this.generateGmailSocialIcons(socialMediaTyped)}
            </td>
            <td class="content-column">
                <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
                    ${logoUrl ? `
                        <tr>
                            <td style="padding-bottom: 12px;">
                                <img src="${logoUrl}" alt="${personalInfoTyped.company}" class="logo-img" width="${logoWidth}" border="0" />
                            </td>
                        </tr>
                    ` : ''}
                    <tr>
                        <td>
                            <h2 class="name-text">${personalInfoTyped.name}</h2>
                            <p class="title-text">${personalInfoTyped.title}</p>
                            <p class="company-text">${personalInfoTyped.company}</p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <table class="contact-table" cellpadding="0" cellspacing="0" border="0">
                                ${personalInfoTyped.email ? `
                                    <tr>
                                        <td class="contact-row">
                                            <a href="mailto:${personalInfoTyped.email}" class="contact-link">
                                                📧 ${personalInfoTyped.email}
                                            </a>
                                        </td>
                                    </tr>
                                ` : ''}
                                ${personalInfoTyped.phone ? `
                                    <tr>
                                        <td class="contact-row">
                                            <a href="tel:${personalInfoTyped.phone}" class="contact-link">
                                                📞 ${personalInfoTyped.phone}
                                            </a>
                                        </td>
                                    </tr>
                                ` : ''}
                                ${personalInfoTyped.website ? `
                                    <tr>
                                        <td class="contact-row">
                                            <a href="${personalInfoTyped.website}" class="contact-link" target="_blank">
                                                🌐 ${personalInfoTyped.website}
                                            </a>
                                        </td>
                                    </tr>
                                ` : ''}
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
            ${headshotUrl ? `
                <td class="headshot-column">
                    <img src="${headshotUrl}" alt="${personalInfoTyped.name}" class="headshot-img" width="${headshotWidth}" height="140" border="0" />
                </td>
            ` : ''}
        </tr>
    </table>
    
    <div style="clear: both; height: 1px; line-height: 1px; font-size: 1px;">&nbsp;</div>
</body>
</html>`;
  }

  /**
   * Generate Gmail-compatible social media icons
   */
  private generateGmailSocialIcons(socialMedia: SocialMedia | null): string {
    if (!socialMedia) return '';
    
    const icons = [];
    
    if (socialMedia.linkedin) {
      icons.push(`<a href="${socialMedia.linkedin}" class="social-link" target="_blank" rel="noopener">in</a>`);
    }
    
    if (socialMedia.twitter) {
      icons.push(`<a href="${socialMedia.twitter}" class="social-link" target="_blank" rel="noopener">𝕏</a>`);
    }
    
    if (socialMedia.instagram) {
      icons.push(`<a href="${socialMedia.instagram}" class="social-link" target="_blank" rel="noopener">📷</a>`);
    }
    
    if (socialMedia.youtube) {
      icons.push(`<a href="${socialMedia.youtube}" class="social-link" target="_blank" rel="noopener">▶</a>`);
    }
    
    if (socialMedia.tiktok) {
      icons.push(`<a href="${socialMedia.tiktok}" class="social-link" target="_blank" rel="noopener">🎵</a>`);
    }
    
    return icons.join('');
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
    
    // Calculate exact dimensions based on user customizations - matching original exactly
    const headshotSizePercent = imagesTyped?.headshotSize || 100;
    const logoSizePercent = imagesTyped?.logoSize || 100;
    // Use the same calculation as the template: (images.headshotSize || 100) * 2.56
    const headshotWidth = Math.round((headshotSizePercent || 100) * 2.56);
    const headshotHeight = 280; // Fixed height as in template
    const logoWidth = Math.round((logoSizePercent || 100) * 0.48);

    // Apply element positioning transforms
    const getPositionTransform = (elementKey: string): string => {
      const pos = positions[elementKey];
      if (!pos) return '';
      
      const transforms = [];
      if ((pos.x !== undefined && pos.x !== 0) || (pos.y !== undefined && pos.y !== 0)) {
        transforms.push(`translate(${pos.x || 0}px, ${pos.y || 0}px)`);
      }
      if (pos.scale !== undefined && pos.scale !== 1) {
        transforms.push(`scale(${pos.scale})`);
      }
      
      return transforms.length > 0 ? `transform: ${transforms.join(' ')};` : '';
    };

    // Generate the exact Sales Professional template as single table
    if (templateId === 'sales-professional') {
      return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        /* Exact replica styles matching the original signature template */
        .signature-table {
            width: 650px;
            max-width: 650px;
            height: 280px;
            border-collapse: collapse;
            font-family: 'Playfair Display', 'Times New Roman', serif;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            position: relative;
        }
        
        .social-sidebar-cell {
            width: 80px;
            min-width: 80px;
            background: linear-gradient(180deg, #22d3ee, #2563eb);
            border-radius: 12px 0 0 12px;
            vertical-align: middle;
            text-align: center;
            padding: 20px 8px;
            position: relative;
            ${getPositionTransform('social')}
        }
        
        .main-content-cell {
            padding: 32px;
            vertical-align: top;
            position: relative;
            background: white;
            width: ${headshotUrl ? `calc(570px - ${headshotWidth + 24}px)` : '570px'};
        }
        
        .headshot-cell {
            width: ${headshotWidth}px;
            min-width: ${headshotWidth}px;
            height: 280px;
            vertical-align: top;
            position: relative;
            overflow: hidden;
            ${getPositionTransform('headshot')}
        }
        
        /* Background geometric patterns - positioned to match original exactly */
        .geometric-bg {
            position: absolute;
            top: 0;
            right: ${headshotWidth + 20}px;
            width: calc(50% - ${Math.round(headshotWidth / 2)}px);
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }
        
        .geometric-shape-1 {
            position: absolute;
            right: -11px;
            top: 54px;
            width: 128px;
            height: 128px;
            transform: rotate(45deg);
            background: linear-gradient(135deg, #22d3ee, #0891b2);
            opacity: 0.1;
        }
        
        .geometric-shape-2 {
            position: absolute;
            right: -3px;
            top: 118px;
            width: 96px;
            height: 96px;
            transform: rotate(-12deg);
            background: linear-gradient(135deg, #6b7280, #374151);
            opacity: 0.2;
        }
        
        .geometric-shape-3 {
            position: absolute;
            right: -7px;
            bottom: 74px;
            width: 80px;
            height: 80px;
            transform: rotate(12deg);
            background: linear-gradient(135deg, #14b8a6, #0891b2);
            opacity: 0.15;
        }
        
        /* Typography matching original exactly */
        .user-name {
            font-size: 32px;
            font-weight: bold;
            color: #1f2937;
            margin: 0 0 8px 0;
            line-height: 1.2;
            font-family: 'Playfair Display', serif;
            ${getPositionTransform('name')}
        }
        
        .user-title {
            font-size: 18px;
            color: #6b7280;
            margin: 0 0 4px 0;
            font-weight: 500;
            font-family: 'Playfair Display', serif;
        }
        
        .user-company {
            font-size: 16px;
            color: #374151;
            margin: 0 0 24px 0;
            font-weight: 500;
            font-family: 'Playfair Display', serif;
            ${getPositionTransform('company')}
        }
        
        .contact-container {
            font-size: 14px;
            line-height: 1.6;
            color: #4b5563;
            ${getPositionTransform('contact')}
        }
        
        .contact-item {
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .contact-text {
            color: #1f2937;
            text-decoration: none;
            font-weight: normal;
            font-size: 18px;
            font-family: 'Playfair Display', serif;
        }
        
        .contact-icon {
            width: 16px;
            height: 16px;
            color: #6b7280;
            flex-shrink: 0;
        }
        
        .social-icon-link {
            width: 24px;
            height: 24px;
            color: white;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            font-size: 16px;
            font-family: Arial, sans-serif;
        }
        
        .company-logo {
            margin-bottom: 16px;
            ${getPositionTransform('logo')}
        }
        
        .company-logo img {
            max-width: ${logoWidth}px;
            max-height: 48px;
            object-fit: contain;
            display: block;
        }
        
        .headshot-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);
            display: block;
        }
        
        .headshot-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(17, 24, 39, 0.2));
            clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);
            pointer-events: none;
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
    </style>
</head>
<body>
    <table class="signature-table" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <!-- Background patterns positioned absolutely -->
            <td colspan="3" style="position: relative; padding: 0; height: 0;">
                ${headshotUrl ? `<div class="geometric-bg">
                    <div class="geometric-shape-1"></div>
                    <div class="geometric-shape-2"></div>
                    <div class="geometric-shape-3"></div>
                </div>` : ''}
            </td>
        </tr>
        <tr>
            <!-- Left Sidebar with Social Icons -->
            <td class="social-sidebar-cell">
                ${this.generateSocialIconsTableHtml(socialMediaTyped)}
            </td>
            
            <!-- Main Content Area -->
            <td class="main-content-cell">
                <!-- Company Logo -->
                ${logoUrl ? `
                    <div class="company-logo">
                        <img src="${logoUrl}" alt="${personalInfoTyped.company}" width="${logoWidth}" />
                    </div>
                ` : ''}
                
                <!-- Name and Title -->
                <h2 class="user-name">${personalInfoTyped.name}</h2>
                <p class="user-title">${personalInfoTyped.title}</p>
                <p class="user-company">${personalInfoTyped.company || ''}</p>
                
                <!-- Contact Information -->
                <div class="contact-container">
                    ${personalInfoTyped.phone ? `
                        <div class="contact-item">
                            <svg class="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span class="contact-text">${personalInfoTyped.phone}</span>
                        </div>
                    ` : ''}
                    ${personalInfoTyped.email ? `
                        <div class="contact-item">
                            <svg class="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <polyline points="22,6 12,13 2,6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span class="contact-text">${personalInfoTyped.email}</span>
                        </div>
                    ` : ''}
                    ${personalInfoTyped.website ? `
                        <div class="contact-item">
                            <svg class="contact-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <line x1="2" y1="12" x2="22" y2="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="m2 12 .87 2.61a7.94 7.94 0 0 0 .46 1.02 8 8 0 0 0 8.13 4.28 8 8 0 0 0 8-8c0-2.28-.94-4.34-2.46-5.83A8 8 0 0 0 12 4a8 8 0 0 0-7.74 6c0 .32.06.64.12.96L2 12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span class="contact-text">${personalInfoTyped.website}</span>
                        </div>
                    ` : ''}
                </div>
            </td>
            
            <!-- Right Side Headshot Area -->
            ${headshotUrl ? `
                <td class="headshot-cell">
                    <div style="position: relative; width: 100%; height: 100%;">
                        <img src="${headshotUrl}" alt="${personalInfoTyped.name}" class="headshot-image" width="${headshotWidth}" height="${headshotHeight}" />
                        <div class="headshot-overlay"></div>
                    </div>
                </td>
            ` : ''}
        </tr>
    </table>
</body>
</html>`;
    }

    // Return fallback for other templates
    return this.generateFallbackTableHtml(signature);
  }

  /**
   * Generate social media icons as table structure with SVG icons matching template
   */
  private generateSocialIconsTableHtml(socialMedia: SocialMedia | null): string {
    if (!socialMedia) return '';
    
    const socialLinks = [];
    
    if (socialMedia.twitter) {
      socialLinks.push(`
        <a href="${socialMedia.twitter}" class="social-icon-link" target="_blank" rel="noopener">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
          </svg>
        </a>
      `);
    }
    
    if (socialMedia.linkedin) {
      socialLinks.push(`
        <a href="${socialMedia.linkedin}" class="social-icon-link" target="_blank" rel="noopener">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" fill="currentColor"/>
            <rect x="2" y="9" width="4" height="12" fill="currentColor"/>
            <circle cx="4" cy="4" r="2" fill="currentColor"/>
          </svg>
        </a>
      `);
    }
    
    if (socialMedia.instagram) {
      socialLinks.push(`
        <a href="${socialMedia.instagram}" class="social-icon-link" target="_blank" rel="noopener">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" stroke-width="2"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" stroke-width="2"/>
          </svg>
        </a>
      `);
    }
    
    if (socialMedia.youtube) {
      socialLinks.push(`
        <a href="${socialMedia.youtube}" class="social-icon-link" target="_blank" rel="noopener">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" fill="currentColor"/>
            <polygon points="9.75,15.02 15.5,11.75 9.75,8.48" fill="white"/>
          </svg>
        </a>
      `);
    }
    
    if (socialMedia.tiktok) {
      socialLinks.push(`
        <a href="${socialMedia.tiktok}" class="social-icon-link" target="_blank" rel="noopener">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.909 2.909 2.896 2.896 0 0 1-2.909-2.909 2.896 2.896 0 0 1 2.909-2.909c.301 0 .591.041.861.118V9.47a6.336 6.336 0 0 0-.861-.058 6.364 6.364 0 0 0-6.364 6.364 6.364 6.364 0 0 0 6.364 6.364 6.364 6.364 0 0 0 6.364-6.364V7.598a8.225 8.225 0 0 0 4.76 1.507V5.66c0 .179-.036.356-.085.525z"/>
          </svg>
        </a>
      `);
    }
    
    return socialLinks.join('');
  }

  /**
   * Generate fallback table HTML for non-sales-professional templates
   */
  private generateFallbackTableHtml(signature: Signature): string {
    const { personalInfo, images, socialMedia } = signature;
    const personalInfoTyped = personalInfo as PersonalInfo;
    const imagesTyped = images as any;
    const socialMediaTyped = socialMedia as SocialMedia | null;

    const headshotUrl = this.getAbsoluteImageUrl(imagesTyped?.headshot);
    const logoUrl = this.getAbsoluteImageUrl(imagesTyped?.logo);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        .signature-table {
            border-collapse: collapse;
            font-family: Arial, sans-serif;
            max-width: 600px;
            background: white;
        }
        .main-row td {
            vertical-align: top;
            padding: 16px;
        }
        .headshot-cell {
            width: 120px;
        }
        .headshot-img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
        }
        .content-cell {
            padding-left: 20px;
        }
        .name {
            font-size: 20px;
            font-weight: bold;
            color: #1a1a1a;
            margin: 0 0 8px 0;
        }
        .title {
            font-size: 16px;
            color: #666;
            margin: 0 0 12px 0;
        }
        .contact-info {
            font-size: 14px;
            line-height: 1.6;
            color: #555;
        }
        .contact-link {
            color: #0077b5;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <table class="signature-table" cellpadding="0" cellspacing="0" border="0">
        <tr class="main-row">
            ${headshotUrl ? `
                <td class="headshot-cell">
                    <img src="${headshotUrl}" alt="${personalInfoTyped.name}" class="headshot-img" width="80" height="80" />
                </td>
            ` : ''}
            <td class="content-cell">
                ${logoUrl ? `
                    <div style="margin-bottom: 12px;">
                        <img src="${logoUrl}" alt="${personalInfoTyped.company}" style="max-width: 120px; max-height: 60px;" />
                    </div>
                ` : ''}
                
                <h2 class="name">${personalInfoTyped.name}</h2>
                <p class="title">${personalInfoTyped.title} at ${personalInfoTyped.company}</p>
                
                <div class="contact-info">
                    ${personalInfoTyped.email ? `<div><a href="mailto:${personalInfoTyped.email}" class="contact-link">${personalInfoTyped.email}</a></div>` : ''}
                    ${personalInfoTyped.phone ? `<div><a href="tel:${personalInfoTyped.phone}" class="contact-link">${personalInfoTyped.phone}</a></div>` : ''}
                    ${personalInfoTyped.website ? `<div><a href="${personalInfoTyped.website}" class="contact-link" target="_blank">${personalInfoTyped.website}</a></div>` : ''}
                </div>
                
                ${this.generateFallbackSocialLinks(socialMediaTyped)}
            </td>
        </tr>
    </table>
</body>
</html>`;
  }

  /**
   * Generate fallback social links
   */
  private generateFallbackSocialLinks(socialMedia: SocialMedia | null): string {
    if (!socialMedia) return '';
    
    const links: string[] = [];
    
    if (socialMedia.linkedin) {
      links.push(`<a href="${socialMedia.linkedin}" style="color: #0077b5; text-decoration: none; margin-right: 12px;" target="_blank">LinkedIn</a>`);
    }
    
    if (socialMedia.twitter) {
      links.push(`<a href="${socialMedia.twitter}" style="color: #1da1f2; text-decoration: none; margin-right: 12px;" target="_blank">Twitter</a>`);
    }
    
    if (socialMedia.instagram) {
      links.push(`<a href="${socialMedia.instagram}" style="color: #e4405f; text-decoration: none; margin-right: 12px;" target="_blank">Instagram</a>`);
    }
    
    if (links.length === 0) return '';
    
    return `<div style="margin-top: 12px;">${links.join('')}</div>`;
  }

  /**
   * Convert relative image URLs to absolute URLs
   */
  private getAbsoluteImageUrl(image: any): string | null {
    if (!image) return null;
    
    // Handle both string and object formats
    const imagePath = typeof image === 'string' ? image : image?.url;
    if (!imagePath) return null;
    
    // Use current server domain for image URLs
    const baseUrl = process.env.REPLIT_DOMAINS 
      ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
      : 'http://localhost:5000';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/api/files/')) {
      return `${baseUrl}${imagePath}`;
    }
    
    if (imagePath.startsWith('/attached_assets/')) {
      return `${baseUrl}${imagePath}`;
    }
    
    // Handle attached assets with full path
    if (imagePath.startsWith('/@fs/home/runner/workspace/attached_assets/')) {
      const filename = imagePath.split('/').pop();
      return `${baseUrl}/attached_assets/${filename}`;
    }
    
    return `${baseUrl}/api/files/${imagePath}`;
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
      
      // Add explicit dimensions to images and ensure border="0"
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
      
      // Clean up class attributes since styles are now inlined
      tableHtml = tableHtml.replace(/\s+class="[^"]*"/gi, '');
      
      // Remove any remaining background positioning divs that can't be inlined properly
      tableHtml = tableHtml.replace(/<div[^>]*geometric[^>]*>[\s\S]*?<\/div>/gi, '');
      
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
      
      // Check for external styles (should be inlined)
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
        });
      }
      
      // Check for Gmail compatibility
      if (html.includes('clip-path')) {
        issues.push('Contains clip-path which may not work in all email clients');
      }
      
      if (html.includes('position: absolute')) {
        issues.push('Contains absolute positioning which may not work in Gmail');
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
