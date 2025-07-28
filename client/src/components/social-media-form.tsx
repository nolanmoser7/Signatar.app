import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Linkedin, Twitter, Instagram, Youtube } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import type { SocialMedia } from "@shared/schema";

interface SocialMediaFormProps {
  socialMedia: SocialMedia;
  onSocialMediaChange: (socialMedia: SocialMedia) => void;
}

export default function SocialMediaForm({ socialMedia, onSocialMediaChange }: SocialMediaFormProps) {
  const handleChange = (field: keyof SocialMedia, value: string) => {
    onSocialMediaChange({
      ...socialMedia,
      [field]: value,
    });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral mb-4">Social Media</h2>
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Linkedin className="text-blue-600 w-5 h-5" />
          <Input
            type="url"
            placeholder="LinkedIn profile URL"
            value={socialMedia.linkedin || ""}
            onChange={(e) => handleChange("linkedin", e.target.value)}
            className="flex-1 text-sm"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <Twitter className="text-blue-400 w-5 h-5" />
          <Input
            type="url"
            placeholder="Twitter profile URL"
            value={socialMedia.twitter || ""}
            onChange={(e) => handleChange("twitter", e.target.value)}
            className="flex-1 text-sm"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <Instagram className="text-pink-500 w-5 h-5" />
          <Input
            type="url"
            placeholder="Instagram profile URL"
            value={socialMedia.instagram || ""}
            onChange={(e) => handleChange("instagram", e.target.value)}
            className="flex-1 text-sm"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <Youtube className="text-red-600 w-5 h-5" />
          <Input
            type="url"
            placeholder="YouTube channel URL"
            value={socialMedia.youtube || ""}
            onChange={(e) => handleChange("youtube", e.target.value)}
            className="flex-1 text-sm"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <SiTiktok className="text-black w-5 h-5" />
          <Input
            type="url"
            placeholder="TikTok profile URL"
            value={socialMedia.tiktok || ""}
            onChange={(e) => handleChange("tiktok", e.target.value)}
            className="flex-1 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
