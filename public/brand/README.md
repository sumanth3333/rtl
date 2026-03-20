Brand asset drop zone
=====================

Place your logo and related assets here so they’re served statically by Next.js.

Suggested files
- logo.svg (primary)
- logo-dark.svg (dark-mode variant, if needed)
- favicon.ico (multi-size favicon)
- app-icon-192.png / app-icon-512.png (PWA icons if you have them)

How to reference
- In components: `<Image src="/brand/logo.svg" ... />` or `<img src="/brand/logo.svg" ... />`
- In CSS: `background-image: url("/brand/logo.svg");`

Notes
- Keep filenames lowercase, hyphenated.
- Prefer SVG for logos; include a PNG backup if necessary.
- If you add many variants, create subfolders like `logos/` and `icons/` to keep it tidy.
