import { Mail, Phone, Globe, Linkedin, Twitter, Instagram } from "lucide-react";
import { getAnimationClass } from "@/lib/animations";
import type { PersonalInfo, SocialMedia, Images, AnimationType } from "@shared/schema";

interface SalesProfessionalTemplateProps {
  personalInfo: PersonalInfo;
  images: Images;
  socialMedia: SocialMedia;
  animationType: AnimationType;
  isAnimating: boolean;
  deviceView: "desktop" | "mobile";
}

export default function SalesProfessionalTemplate({
  personalInfo,
  images,
  socialMedia,
  animationType,
  isAnimating,
  deviceView,
}: SalesProfessionalTemplateProps) {
  const animationClass = isAnimating ? getAnimationClass(animationType) : "";

  if (deviceView === "mobile") {
    // Mobile version - simplified layout
    return (
      <div className={`bg-white rounded-xl shadow-lg p-4 max-w-sm mx-auto ${animationClass}`}>
        <div className="border-l-4 border-teal-500 pl-4">
          <div className="text-center mb-4">
            {images.headshot && (
              <img
                src={images.headshot}
                alt={`${personalInfo.name} headshot`}
                className="w-16 h-16 rounded-full border-2 border-teal-500 mx-auto mb-3"
              />
            )}
            {images.logo && (
              <img
                src={images.logo}
                alt="Company logo"
                className="h-8 w-auto mx-auto mb-2"
              />
            )}
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-bold text-teal-500 mb-1">
              {personalInfo.name || "Your Name"}
            </h3>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
              {personalInfo.title || "Your Title"}
            </p>
            
            <div className="space-y-2 text-sm">
              {personalInfo.phone && (
                <div className="flex items-center justify-center space-x-2">
                  <Phone className="text-teal-500 w-3 h-3" />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.email && (
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="text-teal-500 w-3 h-3" />
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.website && (
                <div className="flex items-center justify-center space-x-2">
                  <Globe className="text-teal-500 w-3 h-3" />
                  <span>{personalInfo.website}</span>
                </div>
              )}
            </div>
            
            {/* Social Media Icons */}
            <div className="flex justify-center space-x-2 mt-4">
              {socialMedia.linkedin && (
                <a href={socialMedia.linkedin} className="p-1">
                  <Linkedin className="w-4 h-4 text-teal-500" />
                </a>
              )}
              {socialMedia.twitter && (
                <a href={socialMedia.twitter} className="p-1">
                  <Twitter className="w-4 h-4 text-teal-500" />
                </a>
              )}
              {socialMedia.instagram && (
                <a href={socialMedia.instagram} className="p-1">
                  <Instagram className="w-4 h-4 text-teal-500" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version - full layout matching the HTML template
  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto ${animationClass}`}>
      <table className="w-full border border-gray-200 rounded-lg" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <tbody>
          <tr>
            {/* Left Accent Bar */}
            <td className="w-2 bg-teal-500 rounded-l-lg"></td>

            {/* Headshot Column */}
            <td className="w-24 p-3 text-center align-top">
              {images.headshot && (
                <img
                  src={images.headshot}
                  alt={`${personalInfo.name} headshot`}
                  className="w-20 h-20 rounded-full border-2 border-teal-500 mx-auto"
                />
              )}
            </td>

            {/* Info Column */}
            <td className="p-3 align-top">
              {/* Logo */}
              {images.logo && (
                <img
                  src={images.logo}
                  alt="Company logo"
                  className="h-12 w-auto mb-2 block"
                />
              )}

              {/* Name & Title */}
              <h3 className="text-lg font-bold text-teal-500 m-0">
                {personalInfo.name || "Your Name"}
              </h3>
              <p className="text-xs text-gray-500 uppercase tracking-wide mt-1 mb-3">
                {personalInfo.title || "Your Title"}
              </p>

              {/* Contact Info */}
              <div className="space-y-1.5 text-sm">
                {personalInfo.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="text-teal-500 w-3 h-3" />
                    <a href={`tel:${personalInfo.phone}`} className="text-gray-700 no-underline">
                      {personalInfo.phone}
                    </a>
                  </div>
                )}
                {personalInfo.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="text-teal-500 w-3 h-3" />
                    <a href={`mailto:${personalInfo.email}`} className="text-gray-700 no-underline">
                      {personalInfo.email}
                    </a>
                  </div>
                )}
                {personalInfo.website && (
                  <div className="flex items-center space-x-2">
                    <Globe className="text-teal-500 w-3 h-3" />
                    <a href={personalInfo.website} className="text-gray-700 no-underline">
                      {personalInfo.website}
                    </a>
                  </div>
                )}
              </div>
            </td>

            {/* Actions & Social Column */}
            <td className="p-3 align-top text-right">
              {/* Action Buttons */}
              <div className="space-y-2 mb-3">
                <a
                  href={personalInfo.website || "#"}
                  className="inline-block px-4 py-2 bg-teal-500 text-white text-xs rounded no-underline hover:bg-teal-600 transition-colors"
                >
                  Schedule Call
                </a>
                <br />
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="inline-block px-4 py-2 bg-red-400 text-white text-xs rounded no-underline hover:bg-red-500 transition-colors"
                >
                  Get Quote
                </a>
              </div>

              {/* Social Icons */}
              <div className="flex justify-end space-x-1">
                {socialMedia.linkedin && (
                  <a href={socialMedia.linkedin} className="p-1">
                    <Linkedin className="w-5 h-5 text-gray-600 hover:text-teal-500" />
                  </a>
                )}
                {socialMedia.twitter && (
                  <a href={socialMedia.twitter} className="p-1">
                    <Twitter className="w-5 h-5 text-gray-600 hover:text-teal-500" />
                  </a>
                )}
                {socialMedia.instagram && (
                  <a href={socialMedia.instagram} className="p-1">
                    <Instagram className="w-5 h-5 text-gray-600 hover:text-teal-500" />
                  </a>
                )}
              </div>
            </td>

            {/* Right Accent Bar */}
            <td className="w-2 bg-teal-500 rounded-r-lg"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}