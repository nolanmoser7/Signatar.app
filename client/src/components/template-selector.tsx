import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bus, Palette, Minus, Sparkles } from "lucide-react";
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

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral mb-4">Choose Template</h2>
      <div className="grid grid-cols-2 gap-3">
        {templates?.map((template) => {
          const Icon = templateIcons[template.id as keyof typeof templateIcons] || Bus;
          const isSelected = selectedTemplate === template.id;
          
          return (
            <Card
              key={template.id}
              className={`p-3 cursor-pointer transition-colors ${
                isSelected
                  ? "border-2 border-primary bg-indigo-50"
                  : "border-2 border-gray-200 hover:border-primary"
              }`}
              onClick={() => onSelectTemplate(template.id)}
            >
              <div className={`rounded h-16 mb-2 flex items-center justify-center ${
                isSelected ? "bg-primary/20" : "bg-gray-100"
              }`}>
                <Icon className={`${isSelected ? "text-primary" : "text-gray-400"}`} size={20} />
              </div>
              <p className={`text-sm font-medium text-center ${
                isSelected ? "text-primary" : "text-gray-900"
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
