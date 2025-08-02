// SVG icons for contact information that will be uploaded to object storage
// These ensure consistent rendering across all email clients

export const contactIcons = {
  phone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="#6b7280"/>
  </svg>`,
  
  email: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#6b7280" stroke-width="2" fill="none"/>
    <polyline points="22,6 12,13 2,6" stroke="#6b7280" stroke-width="2" fill="none"/>
  </svg>`,
  
  website: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#6b7280" stroke-width="2" fill="none"/>
    <line x1="2" y1="12" x2="22" y2="12" stroke="#6b7280" stroke-width="2"/>
    <path d="m4.93 6.5c1.83-1.29 4.24-2.5 7.07-2.5s5.24 1.21 7.07 2.5" stroke="#6b7280" stroke-width="2" fill="none"/>
    <path d="m4.93 17.5c1.83 1.29 4.24 2.5 7.07 2.5s5.24-1.21 7.07-2.5" stroke="#6b7280" stroke-width="2" fill="none"/>
  </svg>`,
  
  checkmark: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#22d3ee"/>
    <path d="m9 12 2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
};

// Function to get base64 encoded SVG for inline use
export function getIconDataUrl(iconName: keyof typeof contactIcons): string {
  const svg = contactIcons[iconName];
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Function to upload icons to object storage and get public URLs
export async function uploadContactIcons(): Promise<Record<string, string>> {
  const iconUrls: Record<string, string> = {};
  
  for (const [iconName, svgContent] of Object.entries(contactIcons)) {
    try {
      // Convert SVG to blob
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      
      // Get upload URL
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const { uploadURL } = await response.json();
      
      // Upload the SVG
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': 'image/svg+xml'
        }
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload icon');
      }
      
      // Convert upload URL to object path for serving
      const objectPath = uploadURL.split('googleapis.com')[1].split('?')[0];
      const normalizedPath = `/objects${objectPath.replace(/^.*\.private\//, '')}`;
      
      // Set ACL policy for public access
      await fetch('/api/contact-icons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          iconUrl: uploadURL,
          iconName: iconName
        })
      });
      
      iconUrls[iconName] = `${window.location.origin}${normalizedPath}`;
    } catch (error) {
      console.error(`Failed to upload ${iconName} icon:`, error);
      // Fallback to data URL
      iconUrls[iconName] = getIconDataUrl(iconName as keyof typeof contactIcons);
    }
  }
  
  return iconUrls;
}