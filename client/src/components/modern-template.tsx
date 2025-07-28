import { Phone, Mail, Globe, Github } from "lucide-react";
import { SiX, SiLinkedin, SiInstagram, SiYoutube, SiTiktok } from "react-icons/si";
import type { PersonalInfo, SocialMedia, Images, AnimationType } from "@shared/schema";

interface ModernTemplateProps {
  personalInfo: PersonalInfo;
  images: Images;
  socialMedia: SocialMedia;
  animationType: AnimationType;
  isAnimating: boolean;
  deviceView: "desktop" | "mobile";
}

function ModernTemplate({
  personalInfo,
  images,
  socialMedia,
  animationType,
  isAnimating,
  deviceView,
}: ModernTemplateProps) {
  
  const getAnimationClass = (elementType: string) => {
    if (!isAnimating) return "";
    
    switch (animationType) {
      case "fade-in":
        return "animate-fade-in";
      case "pulse":
        return "animate-pulse-subtle";
      case "cross-dissolve":
        return "animate-cross-dissolve";
      default:
        return "";
    }
  };

  if (deviceView === "mobile") {
    // Mobile version - simplified layout
    return (
      <div className="relative overflow-hidden rounded-xl max-w-sm mx-auto">
        {/* Dark gradient background */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 relative">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border border-cyan-400 rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-16 h-16 border border-cyan-400 rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-8 h-8 border border-cyan-400 rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            {/* Company Logo */}
            <div className={`flex items-center mb-6 ${getAnimationClass("logo")}`}>
              <div className="flex items-center">
                {images.logo ? (
                  <div 
                    className="mr-3"
                    style={{
                      width: `${(images.logoSize || 100) * 0.32}px`,
                      height: `${(images.logoSize || 100) * 0.32}px`
                    }}
                  >
                    <img src={images.logo} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div 
                    className="mr-3"
                    style={{
                      width: `${(images.logoSize || 100) * 0.32}px`,
                      height: `${(images.logoSize || 100) * 0.32}px`
                    }}
                  >
                    <svg viewBox="0 0 32 32" className="w-full h-full">
                      <rect x="4" y="6" width="24" height="4" fill="#00bcd4" rx="2"/>
                      <rect x="4" y="14" width="24" height="4" fill="#00bcd4" rx="2"/>
                      <rect x="4" y="22" width="24" height="4" fill="#00bcd4" rx="2"/>
                    </svg>
                  </div>
                )}
                <h1 className="text-white text-xl font-light tracking-[0.2em]">
                  {personalInfo.company?.toUpperCase() || "TECHSPACE"}
                </h1>
              </div>
            </div>

            {/* Name and Title */}
            <div className="mb-6">
              <h2 className="text-white text-2xl font-light mb-2">
                {personalInfo.name || "David Harrison"}
              </h2>
              <p className="text-cyan-400 text-lg font-light">
                {personalInfo.title || "CEO"}
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-3 mb-6">
              {personalInfo.phone && (
                <div className="flex items-center text-cyan-400">
                  <Phone className="w-4 h-4 mr-3" />
                  <span className="text-white">{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.email && (
                <div className="flex items-center text-cyan-400">
                  <Mail className="w-4 h-4 mr-3" />
                  <span className="text-white">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.website && (
                <div className="flex items-center text-cyan-400">
                  <Globe className="w-4 h-4 mr-3" />
                  <span className="text-white">{personalInfo.website}</span>
                </div>
              )}
            </div>

            {/* Social Media Icons */}
            <div className={`flex space-x-4 ${getAnimationClass("social")}`}>
              {socialMedia.twitter && (
                <a href={socialMedia.twitter} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  <SiX className="w-5 h-5" />
                </a>
              )}
              {socialMedia.linkedin && (
                <a href={socialMedia.linkedin} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  <SiLinkedin className="w-5 h-5" />
                </a>
              )}
              {socialMedia.instagram && (
                <a href={socialMedia.instagram} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  <SiInstagram className="w-5 h-5" />
                </a>
              )}
              {socialMedia.youtube && (
                <a href={socialMedia.youtube} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  <SiYoutube className="w-5 h-5" />
                </a>
              )}
              {socialMedia.tiktok && (
                <a href={socialMedia.tiktok} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  <SiTiktok className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Profile Image - positioned on right */}
          {images.headshot && (
            <div className={`absolute top-6 right-6 ${getAnimationClass("headshot")}`}>
              <div 
                className="relative"
                style={{
                  width: `${(images.headshotSize || 100) * 0.8}px`,
                  height: `${(images.headshotSize || 100) * 0.8}px`
                }}
              >
                {/* Cyan glow border */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full p-1">
                  <div className="w-full h-full bg-slate-900 rounded-full"></div>
                </div>
                {/* Profile image */}
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,188,212,0.5)]">
                  <img 
                    src={images.headshot} 
                    alt={personalInfo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop version - full layout matching the design
  return (
    <div className="relative overflow-hidden rounded-xl max-w-2xl mx-auto">
      {/* Dark gradient background */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 relative min-h-[300px]">
        {/* Background geometric patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 left-16 w-32 h-32 border border-cyan-400 rounded-full"></div>
          <div className="absolute bottom-16 right-16 w-24 h-24 border border-cyan-400 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-12 h-12 border border-cyan-400 rounded-full"></div>
          <div className="absolute top-1/4 right-1/4 w-8 h-8 border border-cyan-400 rounded-full"></div>
        </div>
        
        <div className="relative z-10 flex">
          {/* Left side - Company and contact info */}
          <div className="flex-1 pr-8">
            {/* Company Logo */}
            <div className={`flex items-center mb-8 ${getAnimationClass("logo")}`}>
              {images.logo ? (
                <div 
                  className="mr-4"
                  style={{
                    width: `${(images.logoSize || 100) * 0.4}px`,
                    height: `${(images.logoSize || 100) * 0.4}px`
                  }}
                >
                  <img src={images.logo} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div 
                  className="mr-4"
                  style={{
                    width: `${(images.logoSize || 100) * 0.4}px`,
                    height: `${(images.logoSize || 100) * 0.4}px`
                  }}
                >
                  <svg viewBox="0 0 40 40" className="w-full h-full">
                    <rect x="6" y="8" width="28" height="5" fill="#00bcd4" rx="2.5"/>
                    <rect x="6" y="17.5" width="28" height="5" fill="#00bcd4" rx="2.5"/>
                    <rect x="6" y="27" width="28" height="5" fill="#00bcd4" rx="2.5"/>
                  </svg>
                </div>
              )}
              <h1 className="text-white text-3xl font-light tracking-[0.3em]">
                {personalInfo.company?.toUpperCase() || "TECHSPACE"}
              </h1>
            </div>

            {/* Name and Title */}
            <div className="mb-8">
              <h2 className="text-white text-4xl font-light mb-3">
                {personalInfo.name || "David Harrison"}
              </h2>
              <p className="text-cyan-400 text-2xl font-light">
                {personalInfo.title || "CEO"}
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-4 mb-8">
              {personalInfo.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-4 text-cyan-400" />
                  <span className="text-white text-lg">{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.email && (
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-4 text-cyan-400" />
                  <span className="text-white text-lg">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.website && (
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-4 text-cyan-400" />
                  <span className="text-white text-lg">{personalInfo.website}</span>
                </div>
              )}
            </div>

            {/* Social Media Icons */}
            <div className={`flex space-x-6 ${getAnimationClass("social")}`}>
              {socialMedia.twitter && (
                <a href={socialMedia.twitter} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  <SiX className="w-6 h-6" />
                </a>
              )}
              {socialMedia.linkedin && (
                <a href={socialMedia.linkedin} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  <SiLinkedin className="w-6 h-6" />
                </a>
              )}
              {socialMedia.instagram && (
                <a href={socialMedia.instagram} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  <SiInstagram className="w-6 h-6" />
                </a>
              )}
              {socialMedia.youtube && (
                <a href={socialMedia.youtube} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  <SiYoutube className="w-6 h-6" />
                </a>
              )}
              {socialMedia.tiktok && (
                <a href={socialMedia.tiktok} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  <SiTiktok className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>

          {/* Right side - Profile Image */}
          {images.headshot && (
            <div className={`flex-shrink-0 ${getAnimationClass("headshot")}`}>
              <div 
                className="relative"
                style={{
                  width: `${(images.headshotSize || 100) * 1.6}px`,
                  height: `${(images.headshotSize || 100) * 1.6}px`
                }}
              >
                {/* Cyan glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full p-1 shadow-[0_0_40px_rgba(0,188,212,0.6)]">
                  <div className="w-full h-full bg-slate-900 rounded-full"></div>
                </div>
                {/* Profile image */}
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-cyan-400 shadow-[0_0_40px_rgba(0,188,212,0.6)]">
                  <img 
                    src={images.headshot} 
                    alt={personalInfo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModernTemplate;