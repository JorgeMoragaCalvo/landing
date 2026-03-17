All CDN image URLs replaced — 0 remaining. 77 local image references across HTML and CSS.

Here's what's done:

Files created:

- public/images/ — 38 images organized in subfolders (carousel, icons, logos, spa, rooms, blog, termas, resort, gallery)
- public/images.json — human-readable config listing all images - public/preventa-corralco.template.html — source template (keeps original CDN URLs)
- public/corralco-base.template.css — source template
- scripts/build-images.mjs — replaces CDN URLs with local paths

Files modified:

- package.json — added build:images script, dev and build run it automatically - .gitignore — generated HTML/CSS excluded from git

How to change images each year:

1. Drop new image files into public/images/ (keep same filenames like carousel/slide-1.webp, spa/jacuzzi.jpg, etc.)
2. Run npm run dev — done
