import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PersonalInfo } from "@shared/schema";

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo;
  onPersonalInfoChange: (info: PersonalInfo) => void;
}

export default function PersonalInfoForm({ personalInfo, onPersonalInfoChange }: PersonalInfoFormProps) {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onPersonalInfoChange({
      ...personalInfo,
      [field]: value,
    });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral mb-4">Personal Information</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Full Name *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={personalInfo.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="title" className="text-sm font-medium text-gray-700">
            Job Title *
          </Label>
          <Input
            id="title"
            type="text"
            placeholder="Senior Marketing Manager"
            value={personalInfo.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="company" className="text-sm font-medium text-gray-700">
            Company *
          </Label>
          <Input
            id="company"
            type="text"
            placeholder="Tech Solutions Inc."
            value={personalInfo.company}
            onChange={(e) => handleChange("company", e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Phone
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={personalInfo.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@company.com"
            value={personalInfo.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="website" className="text-sm font-medium text-gray-700">
            Website
          </Label>
          <Input
            id="website"
            type="url"
            placeholder="www.company.com"
            value={personalInfo.website || ""}
            onChange={(e) => handleChange("website", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}
