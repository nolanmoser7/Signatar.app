import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { UserCircle, Building, Image, Upload, X, Crop } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ImageCropper } from "@/components/image-cropper";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { Images } from "@shared/schema";
import type { UploadResult } from "@uppy/core";

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
  const { toast } = useToast();
  
  const [cropperState, setCropperState] = useState<{
    isOpen: boolean;
    imageUrl: string;
    type: 'headshot' | 'logo' | null;
    title: string;
  }>({
    isOpen: false,
    imageUrl: '',
    type: null,
    title: ''
  });

  const [currentUploadType, setCurrentUploadType] = useState<keyof Images | null>(null);

  const getUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>,
    type: keyof Images
  ) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadURL = uploadedFile.uploadURL;
      
      if (uploadURL) {
        try {
          // Update image URL in storage and get normalized path
          const response = await apiRequest("PUT", "/api/objects/images", {
            imageURL: uploadURL,
          });
          const data = await response.json();
          
          onImagesChange({
            ...images,
            [type]: data.objectPath,
          });
          
          toast({
            title: "Upload Successful",
            description: `${type} image uploaded to cloud storage`,
          });
        } catch (error) {
          console.error("Error processing upload:", error);
          toast({
            title: "Upload Processing Failed",
            description: "Image uploaded but processing failed",
            variant: "destructive",
          });
        }
      }
    }
  };



  const removeImage = (type: keyof Images) => {
    onImagesChange({
      ...images,
      [type]: undefined,
    });
  };

  const openCropper = (type: 'headshot' | 'logo') => {
    const imageUrl = images[type];
    if (!imageUrl) return;
    
    setCropperState({
      isOpen: true,
      imageUrl,
      type,
      title: type === 'headshot' ? 'Headshot' : 'Logo'
    });
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    if (cropperState.type) {
      onImagesChange({
        ...images,
        [cropperState.type]: croppedImageUrl,
      });
      toast({
        title: "Image Updated",
        description: `${cropperState.title} has been cropped successfully`,
      });
    }
  };

  const closeCropper = () => {
    setCropperState({
      isOpen: false,
      imageUrl: '',
      type: null,
      title: ''
    });
  };

  const UploadArea = ({ 
    type, 
    icon: Icon, 
    title, 
    description,
    maxSize = "10MB"
  }: {
    type: keyof Images;
    icon: any;
    title: string;
    description: string;
    maxSize?: string;
  }) => {
    const hasImage = !!images[type] && typeof images[type] === 'string';

    return (
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          {title}
        </Label>
        
        {hasImage ? (
          <Card className="p-4 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <img
                  src={images[type] as string}
                  alt={title}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <p className="text-sm font-medium">Image uploaded to cloud</p>
                  <p className="text-xs text-gray-500">Persistent storage</p>
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
            
            <div className="space-y-2">
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={10485760} // 10MB
                onGetUploadParameters={getUploadParameters}
                onComplete={(result) => handleUploadComplete(result, type)}
                buttonClassName="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Replace Image
              </ObjectUploader>
              
              {/* Action buttons for headshot and logo */}
              {(type === 'headshot' || type === 'logo') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openCropper(type as 'headshot' | 'logo')}
                  className="w-full"
                >
                  <Crop className="w-4 h-4 mr-2" />
                  Crop & Position
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <Card className="border-2 border-dashed border-gray-300 p-4 text-center">
            <Icon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            <p className="text-xs text-gray-500 mb-4">PNG, JPG up to {maxSize}</p>
            
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={10485760} // 10MB
              onGetUploadParameters={getUploadParameters}
              onComplete={(result) => handleUploadComplete(result, type)}
              buttonClassName="bg-primary text-white hover:bg-primary/90"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload to Cloud Storage
            </ObjectUploader>
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
          description="Upload your professional headshot"
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
          description="Upload your company logo"
          maxSize="5MB"
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
          description="Upload a background image"
          maxSize="10MB"
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
      

      
      <ImageCropper
        isOpen={cropperState.isOpen}
        onClose={closeCropper}
        imageUrl={cropperState.imageUrl}
        onCropComplete={handleCropComplete}
        aspectRatio={cropperState.type === 'headshot' ? 1 : undefined}
        title={cropperState.title}
      />
    </div>
  );
}
