import { apiRequest } from "@/lib/queryClient";
import { getIconDataUrl } from "@/lib/contact-icons";
import { getSocialIconDataUrl } from "@/lib/social-icons";

// Cache for stored icon URLs to avoid re-uploading
const iconUrlCache = new Map<string, string>();

/**
 * Converts a data URL to a Blob for upload
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/svg+xml';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Uploads an icon to object storage and sets ACL policy
 */
async function uploadIconToStorage(iconName: string, iconDataUrl: string): Promise<string> {
  // Check cache first
  if (iconUrlCache.has(iconName)) {
    return iconUrlCache.get(iconName)!;
  }

  try {
    // Get upload URL
    const uploadResponse = await apiRequest("POST", "/api/objects/upload");
    const uploadData = await uploadResponse.json() as { uploadURL: string };
    const { uploadURL } = uploadData;

    // Convert data URL to blob
    const blob = dataUrlToBlob(iconDataUrl);

    // Upload the icon
    const response = await fetch(uploadURL, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": "image/svg+xml",
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    // Set ACL policy for public access
    const aclResponse = await apiRequest("PUT", "/api/contact-icons", {
      iconUrl: uploadURL,
      iconName: iconName,
    });
    
    const aclData = await aclResponse.json() as { objectPath: string };
    const { objectPath } = aclData;
    const publicUrl = `${window.location.origin}${objectPath}`;
    
    // Cache the result
    iconUrlCache.set(iconName, publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error(`Failed to upload icon ${iconName}:`, error);
    // Fallback to data URL if upload fails
    return iconDataUrl;
  }
}

/**
 * Gets a persistent URL for a contact icon (phone, email, website, checkmark)
 */
export async function getContactIconUrl(iconName: 'phone' | 'email' | 'website' | 'checkmark'): Promise<string> {
  const dataUrl = getIconDataUrl(iconName);
  return uploadIconToStorage(`contact-${iconName}`, dataUrl);
}

/**
 * Gets a persistent URL for a social media icon
 */
export async function getSocialIconUrl(platform: string): Promise<string> {
  const dataUrl = getSocialIconDataUrl(platform);
  return uploadIconToStorage(`social-${platform}`, dataUrl);
}

/**
 * Pre-upload all commonly used icons to object storage
 */
export async function preloadIcons(): Promise<void> {
  const contactIcons: Array<'phone' | 'email' | 'website' | 'checkmark'> = ['phone', 'email', 'website', 'checkmark'];
  const socialPlatforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'github', 'youtube'];

  // Upload contact icons
  const contactPromises = contactIcons.map(icon => 
    getContactIconUrl(icon).catch(err => 
      console.warn(`Failed to preload contact icon ${icon}:`, err)
    )
  );

  // Upload social icons
  const socialPromises = socialPlatforms.map(platform => 
    getSocialIconUrl(platform).catch(err => 
      console.warn(`Failed to preload social icon ${platform}:`, err)
    )
  );

  // Wait for all uploads to complete
  await Promise.allSettled([...contactPromises, ...socialPromises]);
}

/**
 * Gets icon URLs for HTML export - loads from cache or object storage
 */
export async function getIconUrlsForExport(): Promise<{
  contact: Record<string, string>;
  social: Record<string, string>;
}> {
  const contactIcons: Array<'phone' | 'email' | 'website' | 'checkmark'> = ['phone', 'email', 'website', 'checkmark'];
  const socialPlatforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'github', 'youtube', 'tiktok'];

  const contactUrls: Record<string, string> = {};
  const socialUrls: Record<string, string> = {};

  // Get contact icon URLs
  await Promise.all(
    contactIcons.map(async (icon) => {
      try {
        contactUrls[icon] = await getContactIconUrl(icon);
      } catch (error) {
        console.error(`Failed to get contact icon ${icon}:`, error);
        contactUrls[icon] = getIconDataUrl(icon); // Fallback to data URL
      }
    })
  );

  // Get social icon URLs
  await Promise.all(
    socialPlatforms.map(async (platform) => {
      try {
        socialUrls[platform] = await getSocialIconUrl(platform);
      } catch (error) {
        console.error(`Failed to get social icon ${platform}:`, error);
        socialUrls[platform] = getSocialIconDataUrl(platform); // Fallback to data URL
      }
    })
  );

  return { contact: contactUrls, social: socialUrls };
}