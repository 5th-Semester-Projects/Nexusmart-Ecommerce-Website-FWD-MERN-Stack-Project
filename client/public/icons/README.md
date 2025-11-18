# NexusMart Icon Assets

This directory contains the app icons for the Progressive Web App (PWA) implementation.

## Required Icon Sizes

The following icon sizes are needed for the PWA manifest:

- **icon-72x72.png** - Android devices, notifications
- **icon-96x96.png** - Android devices, app shortcuts
- **icon-128x128.png** - Android devices, Chrome Web Store
- **icon-144x144.png** - Windows, Android tablets
- **icon-152x152.png** - iOS Safari, iPad
- **icon-192x192.png** - Android devices (standard)
- **icon-384x384.png** - Android splash screen
- **icon-512x512.png** - Android splash screen (high-res)

## Design Guidelines

All icons should:

- Use the NexusMart brand colors (Primary: #6366f1, Purple: #764ba2)
- Feature the "N" logo or shopping bag icon
- Have proper safe area padding for maskable icons (10% margin)
- Be exported as PNG with transparent or white background
- Use gradient from primary-600 to purple-600

## Maskable Icons

Icons are marked as "any maskable" in the manifest, meaning they should:

- Have content centered with safe area
- Work well when cropped into different shapes (circle, squircle, rounded square)
- Maintain brand recognition at all sizes

## Generation Tools

Use one of these tools to generate icons:

- [PWA Asset Generator](https://www.npmjs.com/package/pwa-asset-generator)
- [Favicon Generator](https://realfavicongenerator.net/)
- [Canva](https://www.canva.com/) for custom design
- Adobe Illustrator or Figma for professional design

## Command to Generate

```bash
# Using pwa-asset-generator
npx pwa-asset-generator logo.svg ./icons --icon-only --path-override /icons
```

## Apple Touch Icon

Additional file needed for iOS:

- **apple-touch-icon-180x180.png** - iOS home screen icon

## Favicon

For browser tabs:

- **favicon.ico** - Multi-resolution ICO file (16x16, 32x32, 48x48)
