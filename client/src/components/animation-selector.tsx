import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { elementAnimations } from "@/lib/animations";
import type { ElementAnimations } from "@shared/schema";

interface AnimationSelectorProps {
  elementAnimations: ElementAnimations;
  onElementAnimationChange: (element: keyof ElementAnimations, animation: string) => void;
}

export default function AnimationSelector({ elementAnimations: selectedAnimations, onElementAnimationChange }: AnimationSelectorProps) {
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
      </div>
    </div>
  );
}
