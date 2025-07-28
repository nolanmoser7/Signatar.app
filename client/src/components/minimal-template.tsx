import { Phone, Mail, Globe, Linkedin, Twitter, Instagram } from "lucide-react";

import type { PersonalInfo, SocialMedia, Images, AnimationType } from "@shared/schema";

interface MinimalTemplateProps {
  personalInfo: PersonalInfo;
  socialMedia: SocialMedia;
  images: Images;
  animationType?: string;
  isMobile?: boolean;
}

export function MinimalTemplate({ 
  personalInfo, 
  socialMedia, 
  images, 
  animationType = "none",
  isMobile = false 
}: MinimalTemplateProps) {
  // Animation class based on type
  const getAnimationClass = () => {
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

  const animationClass = getAnimationClass();

  if (isMobile) {
    // Mobile version - simplified stacked layout
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 max-w-sm mx-auto">
        <div className="flex flex-col items-center space-y-4">
          {/* Company Logo */}
          {images.logo && (
            <div className={`flex items-center space-x-2 ${animationClass}`}>
              <div className="w-6 h-6 bg-purple-600 rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-white transform rotate-45"></div>
              </div>
              <span className="font-bold text-lg tracking-wide">APEX SOLUTIONS</span>
            </div>
          )}
          
          {/* Portrait */}
          {images.headshot && (
            <div className={`w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 via-blue-400 to-blue-500 ${animationClass}`}>
              <img 
                src={images.headshot} 
                alt={personalInfo.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Name and Title */}
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">{personalInfo.name || "Mark Johnson"}</h1>
            <p className="text-gray-600 text-sm">{personalInfo.title || "Marketing Manager"}</p>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-1 text-sm text-gray-700 text-center">
            {personalInfo.phone && (
              <div className="flex items-center justify-center space-x-2">
                <Phone className="w-3 h-3" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.email && (
              <div className="flex items-center justify-center space-x-2">
                <Mail className="w-3 h-3" />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center justify-center space-x-2">
                <Globe className="w-3 h-3" />
                <span>{personalInfo.website}</span>
              </div>
            )}
          </div>
          
          {/* Social Media Icons */}
          <div className={`flex space-x-3 ${animationClass}`}>
            {socialMedia.linkedin && (
              <a href={socialMedia.linkedin} className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <Linkedin className="w-4 h-4 text-white" />
              </a>
            )}
            {socialMedia.twitter && (
              <a href={socialMedia.twitter} className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <Twitter className="w-4 h-4 text-white" />
              </a>
            )}

            {socialMedia.instagram && (
              <a href={socialMedia.instagram} className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <Instagram className="w-4 h-4 text-white" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop version - exact match to the provided image
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-2xl mx-auto">
      <div className="flex items-start justify-between">
        {/* Left Side - Company branding, name, and contact info */}
        <div className="flex-1 space-y-6">
          {/* Company Logo and Name */}
          <div className={`flex items-center space-x-3 ${animationClass}`}>
            <div className="relative">
              {images.logo ? (
                <img src={images.logo} alt="Logo" className="w-12 h-12 object-contain" />
              ) : (
                // Default Apex Solutions logo recreation
                <div className="w-12 h-12 flex items-center">
                  <div className="relative">
                    <div className="w-8 h-8 bg-purple-600 transform rotate-45 rounded-sm"></div>
                    <div className="absolute top-1 left-1 w-3 h-3 bg-white transform rotate-45"></div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="text-2xl font-bold tracking-wider text-gray-900">
                APEX
              </div>
              <div className="text-sm font-medium tracking-widest text-gray-600 -mt-1">
                SOLUTIONS
              </div>
            </div>
          </div>
          
          {/* Name and Title */}
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-gray-900">
              {personalInfo.name || "Mark Johnson"}
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              {personalInfo.title || "Marketing Manager"}
            </p>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-3">
            {personalInfo.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-700" />
                <span className="text-lg text-gray-900">{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.email && (
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-700" />
                <span className="text-lg text-gray-900">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-700" />
                <span className="text-lg text-gray-900">{personalInfo.website}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Side - Portrait and Social Media */}
        <div className="flex flex-col items-center space-y-6">
          {/* Portrait Circle */}
          <div className={`w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 via-blue-400 to-blue-500 p-1 ${animationClass}`}>
            <div className="w-full h-full rounded-full overflow-hidden bg-white">
              {images.headshot ? (
                <img 
                  src={images.headshot} 
                  alt={personalInfo.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 via-blue-400 to-blue-500 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">
                    {personalInfo.name ? personalInfo.name.charAt(0) : "M"}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Social Media Icons */}
          <div className={`flex space-x-4 ${animationClass}`}>
            {socialMedia.linkedin && (
              <a 
                href={socialMedia.linkedin} 
                className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <Linkedin className="w-5 h-5 text-white" />
              </a>
            )}
            {socialMedia.twitter && (
              <a 
                href={socialMedia.twitter} 
                className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <Twitter className="w-5 h-5 text-white" />
              </a>
            )}

            {/* Default GitHub icon (representing the circular icon in the image) */}
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <div className="w-5 h-5 bg-white rounded-full"></div>
            </div>
            {socialMedia.instagram && (
              <a 
                href={socialMedia.instagram} 
                className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}