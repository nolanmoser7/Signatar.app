import { Card } from "@/components/ui/card";
import { Mail, Phone, Globe, Linkedin, Twitter, Instagram } from "lucide-react";
import { getAnimationClass } from "@/lib/animations";
import type { PersonalInfo, SocialMedia, Images, AnimationType } from "@shared/schema";

interface SignaturePreviewProps {
  personalInfo: PersonalInfo;
  images: Images;
  socialMedia: SocialMedia;
  animationType: AnimationType;
  templateId: string;
  isAnimating: boolean;
  deviceView: "desktop" | "mobile";
}

export default function SignaturePreview({
  personalInfo,
  images,
  socialMedia,
  animationType,
  templateId,
  isAnimating,
  deviceView,
}: SignaturePreviewProps) {
  const animationClass = isAnimating ? getAnimationClass(animationType) : "";

  const socialIcons = [
    { key: "linkedin", url: socialMedia.linkedin, icon: Linkedin, color: "bg-blue-600 hover:bg-blue-700" },
    { key: "twitter", url: socialMedia.twitter, icon: Twitter, color: "bg-blue-400 hover:bg-blue-500" },
    { key: "instagram", url: socialMedia.instagram, icon: Instagram, color: "bg-pink-500 hover:bg-pink-600" },
  ];

  return (
    <Card 
      className={`bg-white rounded-xl shadow-lg p-8 relative overflow-hidden ${animationClass}`}
      style={{
        maxWidth: deviceView === "mobile" ? "320px" : "600px",
        margin: "0 auto",
      }}
    >
      {/* Background Image */}
      {images.background && (
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url(${images.background})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* Signature Content */}
      <div className={`relative z-10 ${deviceView === "mobile" ? "space-y-4" : "flex items-start space-x-6"}`}>
        {/* Profile Image */}
        {images.headshot && (
          <div className={`flex-shrink-0 ${deviceView === "mobile" ? "text-center" : ""}`}>
            <img
              src={images.headshot}
              alt={`${personalInfo.name} headshot`}
              className={`object-cover border-2 border-gray-200 ${
                deviceView === "mobile" 
                  ? "w-16 h-16 rounded-full mx-auto" 
                  : "w-20 h-20 rounded-full"
              }`}
            />
          </div>
        )}

        {/* Contact Information */}
        <div className={`flex-1 ${deviceView === "mobile" ? "text-center" : ""}`}>
          <div className="mb-4">
            <h3 className={`font-bold text-neutral mb-1 ${deviceView === "mobile" ? "text-lg" : "text-xl"}`}>
              {personalInfo.name || "Your Name"}
            </h3>
            <p className={`text-primary font-semibold mb-1 ${deviceView === "mobile" ? "text-sm" : "text-base"}`}>
              {personalInfo.title || "Your Title"}
            </p>
            <p className={`text-gray-600 font-medium ${deviceView === "mobile" ? "text-sm" : "text-base"}`}>
              {personalInfo.company || "Your Company"}
            </p>
          </div>

          <div className={`space-y-2 text-sm ${deviceView === "mobile" ? "space-y-1" : ""}`}>
            {personalInfo.email && (
              <div className={`flex items-center space-x-2 ${deviceView === "mobile" ? "justify-center" : ""}`}>
                <Mail className="text-primary w-4 h-4" />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className={`flex items-center space-x-2 ${deviceView === "mobile" ? "justify-center" : ""}`}>
                <Phone className="text-primary w-4 h-4" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className={`flex items-center space-x-2 ${deviceView === "mobile" ? "justify-center" : ""}`}>
                <Globe className="text-primary w-4 h-4" />
                <span>{personalInfo.website}</span>
              </div>
            )}
          </div>

          {/* Social Media Icons */}
          <div className={`flex items-center space-x-3 mt-4 ${deviceView === "mobile" ? "justify-center" : ""}`}>
            {socialIcons.map(({ key, url, icon: Icon, color }) => 
              url ? (
                <a
                  key={key}
                  href={url}
                  className={`w-8 h-8 ${color} rounded-full flex items-center justify-center transition-colors`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="text-white" size={14} />
                </a>
              ) : null
            )}
          </div>
        </div>

        {/* Company Logo */}
        {images.logo && deviceView === "desktop" && (
          <div className="flex-shrink-0">
            <img
              src={images.logo}
              alt={`${personalInfo.company} logo`}
              className="h-12 w-auto object-contain"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
