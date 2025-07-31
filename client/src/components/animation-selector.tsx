import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { elementAnimations } from "@/lib/animations";
import type { ElementAnimations } from "@shared/schema";

interface AnimationSelectorProps {
  elementAnimations: ElementAnimations;
  onElementAnimationChange: (element: keyof ElementAnimations, animation: string) => void;
  onApplyAnimations: () => void;
}

export default function AnimationSelector({ elementAnimations: selectedAnimations, onElementAnimationChange, onApplyAnimations }: AnimationSelectorProps) {
  const animatableElements = [
    { key: 'headshot' as const, label: 'Headshot' },
    { key: 'logo' as const, label: 'Logo' },
    { key: 'socialIcons' as const, label: 'Social Media Icons' },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral mb-4">Element Animations</h2>
      <div className="space-y-6">
        {animatableElements.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">{label}</Label>
            <Select 
              value={selectedAnimations[key]} 
              onValueChange={(value) => onElementAnimationChange(key, value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(elementAnimations).map(([animationKey, animationConfig]) => (
                  <SelectItem key={animationKey} value={animationKey}>
                    <div className="flex flex-col">
                      <span className="font-medium">{animationConfig.name}</span>
                      <span className="text-xs text-gray-500">{animationConfig.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        
        <div className="pt-4 border-t border-gray-200">
          <Button 
            onClick={onApplyAnimations}
            className="w-full"
            size="default"
          >
            <Play className="w-4 h-4 mr-2" />
            Apply Animation
          </Button>
        </div>
      </div>
    </div>
  );
}
