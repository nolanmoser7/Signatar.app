import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { UserCircle, Building, Image, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Images } from "@shared/schema";

interface ImageUploaderProps {
  images: Images;
  onImagesChange: (images: Images) => void;
}

interface UploadResponse {
  url: string;
  filename: string;
  originalName: string;
}

export default function ImageUploader({ images, onImagesChange }: ImageUploaderProps) {
  const headshotRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const backgroundRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await apiRequest("POST", "/api/upload", formData);
      return response.json();
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File, type: keyof Images) => {
    try {
      const result = await uploadMutation.mutateAsync(file);
      onImagesChange({
        ...images,
        [type]: result.url,
      });
      toast({
        title: "Upload Successful",
        description: `${type} image uploaded successfully`,
      });
    } catch (error) {
      // Error is handled by mutation onError
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: keyof Images) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, type);
    }
  };

  const handleDrop = (e: React.DragEvent, type: keyof Images) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file, type);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeImage = (type: keyof Images) => {
    onImagesChange({
      ...images,
      [type]: undefined,
    });
  };

  const UploadArea = ({ 
    type, 
    icon: Icon, 
    title, 
    description,
    inputRef,
    maxSize = "2MB"
  }: {
    type: keyof Images;
    icon: any;
    title: string;
    description: string;
    inputRef: React.RefObject<HTMLInputElement>;
    maxSize?: string;
  }) => {
    const hasImage = !!images[type] && typeof images[type] === 'string';

    return (
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          {title}
        </Label>
        
        {hasImage ? (
          <Card className="relative p-4 border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={images[type] as string}
                  alt={title}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <p className="text-sm font-medium">Image uploaded</p>
                  <p className="text-xs text-gray-500">Click to replace</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeImage(type)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, type)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </Card>
        ) : (
          <Card
            className="border-2 border-dashed border-gray-300 p-4 text-center hover:border-primary transition-colors cursor-pointer"
            onDrop={(e) => handleDrop(e, type)}
            onDragOver={handleDragOver}
            onClick={() => inputRef.current?.click()}
          >
            <Icon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{description}</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to {maxSize}</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, type)}
              className="hidden"
            />
          </Card>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral mb-4">Images</h2>
      <div className="space-y-4">
        <UploadArea
          type="headshot"
          icon={UserCircle}
          title="Headshot Photo"
          description="Drop image here or click to browse"
          inputRef={headshotRef}
        />
        
        {images.headshot && (
          <div className="mt-2 space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Headshot Size: {images.headshotSize || 100}%
            </Label>
            <Slider
              value={[images.headshotSize || 100]}
              onValueChange={(value) => onImagesChange({
                ...images,
                headshotSize: value[0]
              })}
              max={200}
              min={50}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>50%</span>
              <span>100%</span>
              <span>200%</span>
            </div>
          </div>
        )}
        
        <UploadArea
          type="logo"
          icon={Building}
          title="Company Logo"
          description="Drop logo here or click to browse"
          inputRef={logoRef}
          maxSize="1MB"
        />
        
        {images.logo && (
          <div className="mt-2 space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Logo Size: {images.logoSize || 100}%
            </Label>
            <Slider
              value={[images.logoSize || 100]}
              onValueChange={(value) => onImagesChange({
                ...images,
                logoSize: value[0]
              })}
              max={200}
              min={50}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>50%</span>
              <span>100%</span>
              <span>200%</span>
            </div>
          </div>
        )}
        
        <UploadArea
          type="background"
          icon={Image}
          title="Background (Optional)"
          description="Drop background here or click to browse"
          inputRef={backgroundRef}
          maxSize="5MB"
        />
        
        {images.background && (
          <div className="mt-4 space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Background Opacity: {images.backgroundOpacity || 20}%
            </Label>
            <Slider
              value={[images.backgroundOpacity || 20]}
              onValueChange={(value) => onImagesChange({
                ...images,
                backgroundOpacity: value[0]
              })}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        )}
      </div>
      
      {uploadMutation.isPending && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">Uploading...</p>
        </div>
      )}
    </div>
  );
}
