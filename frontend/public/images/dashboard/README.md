# Dashboard image assets

Place dashboard images in this folder. These files are served from the website root at `/images/dashboard/`.

## Recommended filenames

- `hero-product.png` — main hero/product image (transparent PNG works best)
- `hero-background.jpg` — optional wide background photo or texture
- `feature-search.gif` — optional small feature animation
- `feature-chat.gif` — optional chat animation

## How to use them

Example public URL in React:
```tsx
<img src="/images/dashboard/hero-product.png" alt="Featured product" />
```

Recommended:
- Hero image: PNG or WebP, around 1200 × 900 px, transparent background if possible.
- Background: JPG or WebP, around 1920 × 900 px.
- GIF: use short, optimized loops; keep each file reasonably small for faster loading.
- Use lowercase filenames with hyphens. File names and paths are case-sensitive after deployment.

The dashboard currently has a CSS-based animated artwork fallback, so it will still render if no custom image is present. Add images here when ready, then reference them using the public URL above.
