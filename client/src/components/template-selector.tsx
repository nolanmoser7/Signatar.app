import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bus, Palette, Minus, Sparkles, Briefcase } from "lucide-react";
import type { Template } from "@shared/schema";

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

const templateIcons = {
  professional: Bus,
  modern: Palette,
  minimal: Minus,
  creative: Sparkles,
  "sales-professional": Briefcase,
};

export default function TemplateSelector({ selectedTemplate, onSelectTemplate }: TemplateSelectorProps) {
  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  if (isLoading) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-neutral mb-4">Choose Template</h2>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Sort templates to put Sales Professional first
  const sortedTemplates = templates ? [...templates].sort((a, b) => {
    if (a.id === "sales-professional") return -1;
    if (b.id === "sales-professional") return 1;
    return 0;
  }) : [];

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral mb-4">Choose Template</h2>
      <div className="grid grid-cols-2 gap-3">
        {sortedTemplates?.map((template) => {
          const Icon = templateIcons[template.id as keyof typeof templateIcons] || Bus;
          const isSelected = selectedTemplate === template.id;
          const isAvailable = template.id === "sales-professional";
          const isComingSoon = !isAvailable;
          
          return (
            <Card
              key={template.id}
              className={`p-3 transition-colors relative ${
                isAvailable 
                  ? isSelected
                    ? "border-2 border-primary bg-indigo-50 cursor-pointer"
                    : "border-2 border-gray-200 hover:border-primary cursor-pointer"
                  : "border-2 border-gray-200 opacity-60 cursor-not-allowed"
              }`}
              onClick={() => isAvailable && onSelectTemplate(template.id)}
            >
              {isComingSoon && (
                <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                  Coming Soon
                </div>
              )}
              <div className={`rounded h-16 mb-2 flex items-center justify-center ${
                isAvailable 
                  ? isSelected ? "bg-primary/20" : "bg-gray-100"
                  : "bg-gray-50"
              }`}>
                <Icon className={`${
                  isAvailable 
                    ? isSelected ? "text-primary" : "text-gray-400"
                    : "text-gray-300"
                }`} size={20} />
              </div>
              <p className={`text-sm font-medium text-center ${
                isAvailable 
                  ? isSelected ? "text-primary" : "text-gray-900"
                  : "text-gray-400"
              }`}>
                {template.name}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
