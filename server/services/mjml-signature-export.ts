
import mjml2html from 'mjml';
import type { Signature, PersonalInfo, SocialMedia, Images } from '@shared/schema';

export class MJMLSignatureExporter {
  
  /**
   * Export signature using MJML for maximum email client compatibility
   */
  public async exportMJMLSignature(signature: Signature): Promise<{
    html: string;
    mjml: string;
    validation: { valid: boolean; issues: string[] };
    success: boolean;
    format: string;
  }> {
    try {
      // Generate MJML template based on signature data
      const mjmlTemplate = this.generateMJMLTemplate(signature);
      
      // Convert MJML to HTML
      const result = mjml2html(mjmlTemplate, {
        validationLevel: 'strict',
        fonts: {
          'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap'
        }
      });
      
      // Validate the output
      const validation = {
        valid: result.errors.length === 0,
        issues: result.errors.map(error => error.message)
      };
      
      return {
        html: result.html,
        mjml: mjmlTemplate,
        validation,
        success: true,
        format: 'mjml'
      };
    } catch (error) {
      console.error('MJML export failed:', error);
      throw new Error('Failed to export MJML signature');
    }
  }
  
  /**
   * Generate MJML template based on signature template and data
   */
  private generateMJMLTemplate(signature: Signature): string {
    const { personalInfo, images, socialMedia, templateId } = signature;
    const personalInfoTyped = personalInfo as PersonalInfo;
    const imagesTyped = images as any;
    const socialMediaTyped = socialMedia as SocialMedia | null;
    
    // Use styled images if available, fallback to original
    const getImageUrl = (imageType: 'headshot' | 'logo'): string | null => {
      const styledImage = imagesTyped?.styledImages?.[imageType];
      if (styledImage?.url) return styledImage.url;
      
      const originalImage = imagesTyped?.[imageType];
      if (typeof originalImage === 'string') return originalImage;
      if (originalImage?.url) return originalImage.url;
      
      return null;
    };
    
    const headshotUrl = getImageUrl('headshot');
    const logoUrl = getImageUrl('logo');
    
    // Get image dimensions from styled settings
    const getImageDimensions = (imageType: 'headshot' | 'logo') => {
      const styled = imagesTyped?.styledImages?.[imageType];
      if (styled?.styles) {
        return {
          width: styled.styles.width,
          height: styled.styles.height
        };
      }
      
      // Fallback to size settings
      const size = imageType === 'headshot' ? imagesTyped?.headshotSize : imagesTyped?.logoSize;
      if (size) {
        const dimension = `${size}px`;
        return { width: dimension, height: dimension };
      }
      
      return { width: '80px', height: '80px' };
    };
    
    const headshotDims = getImageDimensions('headshot');
    const logoDims = getImageDimensions('logo');
    
    if (templateId === 'sales-professional') {
      return this.generateSalesProfessionalMJML(personalInfoTyped, headshotUrl, logoUrl, socialMediaTyped, headshotDims, logoDims);
    } else if (templateId === 'modern') {
      return this.generateModernMJML(personalInfoTyped, headshotUrl, logoUrl, socialMediaTyped, headshotDims, logoDims);
    } else if (templateId === 'minimal') {
      return this.generateMinimalMJML(personalInfoTyped, headshotUrl, logoUrl, socialMediaTyped, headshotDims, logoDims);
    }
    
    // Default template
    return this.generateDefaultMJML(personalInfoTyped, headshotUrl, logoUrl, socialMediaTyped, headshotDims, logoDims);
  }
  
  /**
   * Generate Sales Professional template in MJML
   */
  private generateSalesProfessionalMJML(
    personalInfo: PersonalInfo,
    headshotUrl: string | null,
    logoUrl: string | null,
    socialMedia: SocialMedia | null,
    headshotDims: { width: string; height: string },
    logoDims: { width: string; height: string }
  ): string {
    const socialIcons = this.generateSocialMediaMJML(socialMedia);
    
    return `
<mjml>
  <mj-head>
    <mj-title>${personalInfo.name} - Email Signature</mj-title>
    <mj-font name="Playfair Display" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" />
    <mj-attributes>
      <mj-all font-family="Playfair Display, Georgia, serif" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f8f9fa">
    <mj-section background-color="#ffffff" border-radius="12px" padding="0px">
      <mj-column width="80px" background-color="#22d3ee" vertical-align="middle" padding="20px 0px">
        <mj-table>
          <tr>
            <td align="center" style="padding: 8px 0;">
              ${socialIcons}
            </td>
          </tr>
        </mj-table>
      </mj-column>
      
      <mj-column width="60%" padding="32px">
        ${logoUrl ? `
        <mj-image src="${logoUrl}" alt="${personalInfo.company}" width="${logoDims.width}" height="${logoDims.height}" align="left" padding-bottom="16px" />
        ` : ''}
        
        <mj-text font-size="32px" font-weight="bold" color="#1f2937" line-height="1.2" padding-bottom="8px">
          ${personalInfo.name} <span style="color:#22d3ee;">✓</span>
        </mj-text>
        
        <mj-text font-size="20px" color="#6b7280" font-weight="500" padding-bottom="4px">
          ${personalInfo.title}
        </mj-text>
        
        <mj-text font-size="16px" color="#374151" font-weight="500" padding-bottom="24px">
          ${personalInfo.company}
        </mj-text>
        
        <mj-text font-size="16px" line-height="1.8" color="#4b5563">
          ${personalInfo.phone ? `📞 <a href="tel:${personalInfo.phone}" style="color:#0891b2;text-decoration:none;">${personalInfo.phone}</a><br/>` : ''}
          ${personalInfo.email ? `✉️ <a href="mailto:${personalInfo.email}" style="color:#0891b2;text-decoration:none;">${personalInfo.email}</a><br/>` : ''}
          ${personalInfo.website ? `🌐 <a href="${personalInfo.website}" style="color:#0891b2;text-decoration:none;">${personalInfo.website}</a>` : ''}
        </mj-text>
      </mj-column>
      
      ${headshotUrl ? `
      <mj-column width="200px" padding="0px">
        <mj-image src="${headshotUrl}" alt="${personalInfo.name}" width="${headshotDims.width}" height="280px" css-class="headshot-clip" />
      </mj-column>
      ` : ''}
    </mj-section>
    
    <mj-raw>
      <style>
        .headshot-clip img {
          clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);
          object-fit: cover;
        }
      </style>
    </mj-raw>
  </mj-body>
</mjml>`;
  }
  
  /**
   * Generate Modern template in MJML
   */
  private generateModernMJML(
    personalInfo: PersonalInfo,
    headshotUrl: string | null,
    logoUrl: string | null,
    socialMedia: SocialMedia | null,
    headshotDims: { width: string; height: string },
    logoDims: { width: string; height: string }
  ): string {
    const socialIcons = this.generateSocialMediaMJML(socialMedia, 'modern');
    
    return `
<mjml>
  <mj-head>
    <mj-title>${personalInfo.name} - Email Signature</mj-title>
    <mj-font name="Playfair Display" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" />
  </mj-head>
  <mj-body background-color="#f8f9fa">
    <mj-section background-color="#0f172a" border-radius="12px" padding="32px">
      <mj-column width="60%" vertical-align="top">
        <mj-text font-size="28px" font-weight="300" color="#ffffff" letter-spacing="0.3em" text-transform="uppercase" padding-bottom="32px">
          ${personalInfo.company || 'TECHSPACE'}
        </mj-text>
        
        <mj-text font-size="36px" font-weight="300" color="#ffffff" padding-bottom="12px">
          ${personalInfo.name}
        </mj-text>
        
        <mj-text font-size="20px" font-weight="300" color="#00bcd4" padding-bottom="32px">
          ${personalInfo.title}
        </mj-text>
        
        <mj-text font-size="18px" line-height="1.8" color="#ffffff">
          ${personalInfo.phone ? `📞 <a href="tel:${personalInfo.phone}" style="color:#ffffff;text-decoration:none;">${personalInfo.phone}</a><br/>` : ''}
          ${personalInfo.email ? `✉️ <a href="mailto:${personalInfo.email}" style="color:#ffffff;text-decoration:none;">${personalInfo.email}</a><br/>` : ''}
          ${personalInfo.website ? `🌐 <a href="${personalInfo.website}" style="color:#ffffff;text-decoration:none;">${personalInfo.website}</a><br/>` : ''}
        </mj-text>
        
        <mj-text padding-top="32px">
          ${socialIcons}
        </mj-text>
      </mj-column>
      
      <mj-column width="40%" vertical-align="middle">
        ${headshotUrl ? `
        <mj-image src="${headshotUrl}" alt="${personalInfo.name}" width="${headshotDims.width}" border-radius="50%" border="4px solid #00bcd4" />
        ` : `
        <mj-text align="center" font-size="64px" font-weight="300" color="#ffffff" background-color="#00bcd4" border-radius="50%" width="${headshotDims.width}" height="${headshotDims.height}" padding="40px">
          ${personalInfo.name.charAt(0)}
        </mj-text>
        `}
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
  }
  
  /**
   * Generate Minimal template in MJML
   */
  private generateMinimalMJML(
    personalInfo: PersonalInfo,
    headshotUrl: string | null,
    logoUrl: string | null,
    socialMedia: SocialMedia | null,
    headshotDims: { width: string; height: string },
    logoDims: { width: string; height: string }
  ): string {
    const socialIcons = this.generateSocialMediaMJML(socialMedia, 'minimal');
    
    return `
<mjml>
  <mj-head>
    <mj-title>${personalInfo.name} - Email Signature</mj-title>
  </mj-head>
  <mj-body background-color="#ffffff">
    <mj-section background-color="#ffffff" border="1px solid #e5e7eb" border-radius="8px" padding="32px">
      <mj-column width="60%" vertical-align="top">
        <mj-text font-size="24px" font-weight="bold" color="#1f2937" letter-spacing="2px" padding-bottom="24px">
          ${(personalInfo.company || 'APEX').toUpperCase()}
        </mj-text>
        
        <mj-text font-size="36px" font-weight="bold" color="#1f2937" padding-bottom="8px">
          ${personalInfo.name}
        </mj-text>
        
        <mj-text font-size="18px" color="#6b7280" font-weight="500" padding-bottom="24px">
          ${personalInfo.title}
        </mj-text>
        
        <mj-text font-size="16px" line-height="1.8" color="#1f2937">
          ${personalInfo.phone ? `📞 <a href="tel:${personalInfo.phone}" style="color:#1f2937;text-decoration:none;">${personalInfo.phone}</a><br/>` : ''}
          ${personalInfo.email ? `✉️ <a href="mailto:${personalInfo.email}" style="color:#1f2937;text-decoration:none;">${personalInfo.email}</a><br/>` : ''}
          ${personalInfo.website ? `🌐 <a href="${personalInfo.website}" style="color:#1f2937;text-decoration:none;">${personalInfo.website}</a>` : ''}
        </mj-text>
      </mj-column>
      
      <mj-column width="40%" vertical-align="middle">
        ${headshotUrl ? `
        <mj-image src="${headshotUrl}" alt="${personalInfo.name}" width="${headshotDims.width}" border-radius="50%" border="4px solid #A855F7" padding-bottom="24px" />
        ` : ''}
        
        <mj-text align="center">
          ${socialIcons}
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
  }
  
  /**
   * Generate default template in MJML
   */
  private generateDefaultMJML(
    personalInfo: PersonalInfo,
    headshotUrl: string | null,
    logoUrl: string | null,
    socialMedia: SocialMedia | null,
    headshotDims: { width: string; height: string },
    logoDims: { width: string; height: string }
  ): string {
    const socialIcons = this.generateSocialMediaMJML(socialMedia);
    
    return `
<mjml>
  <mj-head>
    <mj-title>${personalInfo.name} - Email Signature</mj-title>
  </mj-head>
  <mj-body>
    <mj-section>
      <mj-column width="20%" vertical-align="top">
        ${headshotUrl ? `
        <mj-image src="${headshotUrl}" alt="${personalInfo.name}" width="${headshotDims.width}" border-radius="50%" border="2px solid #e5e7eb" />
        ` : ''}
      </mj-column>
      
      <mj-column width="60%" vertical-align="top">
        ${logoUrl ? `
        <mj-image src="${logoUrl}" alt="${personalInfo.company}" width="${logoDims.width}" align="left" padding-bottom="16px" />
        ` : ''}
        
        <mj-text font-size="18px" font-weight="bold" color="#1f2937" padding-bottom="4px">
          ${personalInfo.name}
        </mj-text>
        
        <mj-text font-size="14px" font-weight="600" color="#6366f1" padding-bottom="4px">
          ${personalInfo.title}
        </mj-text>
        
        <mj-text font-size="14px" font-weight="500" color="#6b7280" padding-bottom="16px">
          ${personalInfo.company}
        </mj-text>
        
        <mj-text font-size="13px" line-height="1.6" color="#555555">
          ${personalInfo.email ? `✉ ${personalInfo.email}<br/>` : ''}
          ${personalInfo.phone ? `📞 ${personalInfo.phone}<br/>` : ''}
          ${personalInfo.website ? `🌐 ${personalInfo.website}` : ''}
        </mj-text>
        
        <mj-text padding-top="16px">
          ${socialIcons}
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
  }
  
  /**
   * Generate social media icons for MJML
   */
  private generateSocialMediaMJML(socialMedia: SocialMedia | null, style: 'default' | 'modern' | 'minimal' = 'default'): string {
    if (!socialMedia) return '';
    
    const icons = [];
    
    if (socialMedia.linkedin) {
      icons.push(`<a href="${socialMedia.linkedin}" style="display:inline-block;margin-right:8px;width:32px;height:32px;background-color:#0077b5;border-radius:50%;text-align:center;line-height:32px;color:white;text-decoration:none;">in</a>`);
    }
    
    if (socialMedia.twitter) {
      icons.push(`<a href="${socialMedia.twitter}" style="display:inline-block;margin-right:8px;width:32px;height:32px;background-color:#1da1f2;border-radius:50%;text-align:center;line-height:32px;color:white;text-decoration:none;">𝕏</a>`);
    }
    
    if (socialMedia.instagram) {
      icons.push(`<a href="${socialMedia.instagram}" style="display:inline-block;margin-right:8px;width:32px;height:32px;background-color:#e4405f;border-radius:50%;text-align:center;line-height:32px;color:white;text-decoration:none;">📷</a>`);
    }
    
    if (socialMedia.youtube) {
      icons.push(`<a href="${socialMedia.youtube}" style="display:inline-block;margin-right:8px;width:32px;height:32px;background-color:#ff0000;border-radius:50%;text-align:center;line-height:32px;color:white;text-decoration:none;">▶</a>`);
    }
    
    if (socialMedia.tiktok) {
      icons.push(`<a href="${socialMedia.tiktok}" style="display:inline-block;margin-right:8px;width:32px;height:32px;background-color:#000000;border-radius:50%;text-align:center;line-height:32px;color:white;text-decoration:none;">🎵</a>`);
    }
    
    return icons.join('');
  }
}

export const mjmlSignatureExporter = new MJMLSignatureExporter();
