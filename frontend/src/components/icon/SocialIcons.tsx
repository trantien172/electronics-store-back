// Social media icons — SVG riêng, không phụ thuộc lucide-react
// (lucide-react bản đang dùng không có Instagram, Tiktok, Zalo...)

export function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.86c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.45 2.91h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94z"/>
    </svg>
  );
}

export function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function TiktokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82c-.86-.78-1.39-1.9-1.39-3.14V2h-3.45v13.5c0 1.27-1.03 2.3-2.3 2.3a2.3 2.3 0 0 1-2.3-2.3c0-1.27 1.03-2.3 2.3-2.3.24 0 .47.04.69.1v-3.5a5.8 5.8 0 0 0-.69-.04A5.8 5.8 0 0 0 3.66 15.5a5.8 5.8 0 0 0 5.8 5.8 5.8 5.8 0 0 0 5.8-5.8V9.01a8.18 8.18 0 0 0 4.74 1.52V7.07c-1.04 0-2-.46-3.4-1.25z"/>
    </svg>
  );
}

export function ZaloIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.04 2 11c0 2.83 1.45 5.36 3.74 7.06-.13.78-.5 2.18-1.24 3.6-.1.18.07.4.27.34 1.7-.51 3.07-1.4 3.86-1.98A11.1 11.1 0 0 0 12 20c5.52 0 10-4.04 10-9S17.52 2 12 2zM8.5 14.5h-2v-5h2v5zm5.5 0h-3.8v-1.1l2.2-2.9H10.4v-1h3.7v1.1l-2.2 2.9h2.1v1zm3.5 0h-2v-5h2v5z" />
    </svg>
  );
}