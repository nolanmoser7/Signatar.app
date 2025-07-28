import { Mail, Phone, Globe, Linkedin, Twitter, Instagram, Youtube, X } from "lucide-react";
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
      <div className="bg-white rounded-xl shadow-lg p-4 max-w-sm mx-auto">
        <div className="flex items-center space-x-4">
          <div className={`bg-teal-500 rounded-lg p-2 flex flex-col space-y-2 ${animationClass}`}>
            {socialMedia.twitter && (
              <a href={socialMedia.twitter} className="text-white hover:text-gray-200">
                <X className="w-4 h-4" />
              </a>
            )}
            {socialMedia.linkedin && (
              <a href={socialMedia.linkedin} className="text-white hover:text-gray-200">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {socialMedia.instagram && (
              <a href={socialMedia.instagram} className="text-white hover:text-gray-200">
                <Instagram className="w-4 h-4" />
              </a>
            )}
          </div>
          
          <div className="flex-1">
            {images.logo && (
              <div className="flex items-center mb-3">
                <div className={`w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center mr-2 ${animationClass}`}>
                  <span className="text-white font-bold text-sm">J</span>
                </div>
                <span className="font-bold text-lg tracking-wider">{personalInfo.company || "COMPANY"}</span>
              </div>
            )}
            
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {personalInfo.name || "Your Name"}
              <span className="text-teal-500 ml-2">✓</span>
            </h3>
            <p className="text-gray-700 font-medium mb-3">
              {personalInfo.title || "Your Title"}
            </p>
            
            <div className="space-y-2 text-sm">
              {personalInfo.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>{personalInfo.website}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version - modern sidebar design
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto relative">
      {/* Background geometric pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full">
          {/* Geometric shapes */}
          <div className="absolute right-20 top-16 w-32 h-32 transform rotate-45">
            <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 opacity-20"></div>
          </div>
          <div className="absolute right-8 top-32 w-24 h-24 transform -rotate-12">
            <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 opacity-30"></div>
          </div>
          <div className="absolute right-16 bottom-16 w-20 h-20 transform rotate-12">
            <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-700 opacity-25"></div>
          </div>
        </div>
      </div>

      <div className="flex relative z-10">
        {/* Left Sidebar with Social Icons */}
        <div className={`w-20 bg-teal-500 rounded-l-xl flex flex-col items-center py-6 space-y-4 ${animationClass}`}>
          {socialMedia.twitter && (
            <a href={socialMedia.twitter} className="text-white hover:text-gray-200 transition-colors">
              <X className="w-5 h-5" />
            </a>
          )}
          {socialMedia.linkedin && (
            <a href={socialMedia.linkedin} className="text-white hover:text-gray-200 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          )}
          {socialMedia.instagram && (
            <a href={socialMedia.instagram} className="text-white hover:text-gray-200 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
          )}
          <div className="flex-1"></div>
          <Youtube className="w-5 h-5 text-white opacity-60" />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {/* Company Logo/Branding */}
          <div className="flex items-center mb-6">
            <div className={`w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mr-3 ${animationClass}`}>
              {images.logo ? (
                <img src={images.logo} alt="Logo" className="w-8 h-8 object-contain" />
              ) : (
                <span className="text-white font-bold text-lg">J</span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-wider text-gray-900">
                {personalInfo.company?.toUpperCase() || "COMPANY"}
              </h2>
              <div className="text-xs text-gray-500 tracking-widest">GRAPHICS</div>
            </div>
          </div>

          {/* Name and Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {personalInfo.name || "Your Name"}
              <span className="text-teal-500 ml-2">✓</span>
            </h1>
            <p className="text-xl text-gray-700 font-medium">
              {personalInfo.title || "Your Title"}
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            {personalInfo.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-600" />
                <span className="text-lg text-gray-900">{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.email && (
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-lg text-gray-900">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-600" />
                <span className="text-lg text-gray-900">{personalInfo.website}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Portrait Area */}
        <div className="w-64 relative overflow-hidden">
          {images.headshot ? (
            <div className={`absolute inset-0 ${animationClass}`}>
              <img
                src={images.headshot}
                alt={`${personalInfo.name} portrait`}
                className="w-full h-full object-cover"
                style={{
                  clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)'
                }}
              />
              {/* Overlay for geometric effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-gray-900/20"
                style={{
                  clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)'
                }}
              ></div>
            </div>
          ) : (
            <div 
              className={`absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center ${animationClass}`}
              style={{
                clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)'
              }}
            >
              <span className="text-gray-600 text-sm">Portrait</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}