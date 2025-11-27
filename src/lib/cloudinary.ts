import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export { cloudinary };

/**
 * Upload image to Cloudinary
 */
export async function uploadImage(
  file: File | string,
  folder: string = "ticketshub"
): Promise<{
  url: string;
  publicId: string;
  width: number;
  height: number;
}> {
  try {
    let dataUrl: string;
    
    // Convert File to data URL if needed
    if (file instanceof File) {
      dataUrl = await fileToDataUrl(file);
    } else {
      dataUrl = file;
    }
    
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder,
      resource_type: "auto",
      transformation: [
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error("Cloudinary delete failed:", error);
    return false;
  }
}

/**
 * Generate Cloudinary URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  }
): string {
  const transformations = [];
  
  if (options?.width || options?.height) {
    transformations.push({
      width: options.width,
      height: options.height,
      crop: options.crop || "fill",
    });
  }
  
  if (options?.quality) {
    transformations.push({ quality: options.quality });
  }
  
  if (options?.format) {
    transformations.push({ fetch_format: options.format });
  } else {
    transformations.push({ fetch_format: "auto" });
  }
  
  return cloudinary.url(publicId, {
    transformation: transformations,
    secure: true,
  });
}

/**
 * Convert File to data URL
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Client-side: Upload widget
 */
export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

export function openCloudinaryWidget(
  onSuccess: (result: CloudinaryUploadResult) => void,
  onError?: (error: Error) => void
) {
  if (typeof window === "undefined") return;
  
  // Load Cloudinary widget script
  if (!(window as any).cloudinary) {
    const script = document.createElement("script");
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    script.async = true;
    document.body.appendChild(script);
    
    script.onload = () => openWidget();
  } else {
    openWidget();
  }
  
  function openWidget() {
    const widget = (window as any).cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
        uploadPreset: "ticketshub", // Create this in Cloudinary dashboard
        sources: ["local", "url", "camera"],
        multiple: false,
        maxFileSize: 5000000, // 5MB
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxImageWidth: 2000,
        maxImageHeight: 2000,
        cropping: true,
        croppingAspectRatio: 16 / 9,
        folder: "ticketshub/events",
      },
      (error: any, result: any) => {
        if (error && onError) {
          onError(new Error(error.message || "Upload failed"));
          return;
        }
        
        if (result.event === "success") {
          onSuccess({
            secure_url: result.info.secure_url,
            public_id: result.info.public_id,
            width: result.info.width,
            height: result.info.height,
          });
          widget.close();
        }
      }
    );
    
    widget.open();
  }
}