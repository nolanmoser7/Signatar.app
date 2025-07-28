import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { animations } from "@/lib/animations";
import type { AnimationType } from "@shared/schema";

interface AnimationSelectorProps {
  selectedAnimation: AnimationType;
  onAnimationChange: (animation: AnimationType) => void;
}

export default function AnimationSelector({ selectedAnimation, onAnimationChange }: AnimationSelectorProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral mb-4">Animation Style</h2>
      <RadioGroup value={selectedAnimation} onValueChange={(value) => onAnimationChange(value as AnimationType)}>
        <div className="space-y-3">
          {Object.entries(animations).map(([key, animation]) => (
            <div
              key={key}
              className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <RadioGroupItem value={key} id={key} className="mr-3" />
              <Label htmlFor={key} className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium text-sm">{animation.name}</p>
                  <p className="text-xs text-gray-500">{animation.description}</p>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
