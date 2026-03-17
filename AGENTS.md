# Repository Guidelines

## Project Structure & Module Organization
This repository is a small `Vite + React + TypeScript` landing page.

- `src/main.tsx`: app bootstrap and root render.
- `src/App.tsx`: main page component and section content.
- `src/styles.css`: global styles, tokens, layout, and animations.
- `index.html`: Vite HTML entry point.
- `vite.config.ts`: Vite configuration.
- `dist/`: production build output. Do not edit manually.
- `node_modules/`: installed dependencies. Do not edit manually.

Keep new UI code inside `src/`. If the page grows, prefer adding `src/components/` for reusable sections and `src/assets/` for local images or icons.

## Build, Test, and Development Commands
- `npm install`: install project dependencies.
- `npm run dev`: start the local Vite dev server.
- `npm run build`: run TypeScript project checks and create a production build in `dist/`.
- `npm run preview`: serve the built app locally for a final check.

Run `npm run build` before submitting changes. That is the current verification gate for this repo.

## Coding Style & Naming Conventions
Use TypeScript with strict, readable React code.

- Indentation: 2 spaces.
- Components: PascalCase file and symbol names, for example `HeroSection.tsx`.
- Variables/functions: camelCase.
- CSS classes: kebab-case, grouped by section when practical.
- Prefer small functional components over large nested JSX blocks.

No formatter or linter is configured yet. Match the existing style in `src/App.tsx` and `src/styles.css`, and keep comments minimal and high-signal.

## Testing Guidelines
There is no test framework configured yet. For now:

- Treat `npm run build` as the required validation step.
- Manually verify responsive behavior in the browser.
- If you add tests later, place them under `src/__tests__/` or next to components as `*.test.tsx`.

## Commit & Pull Request Guidelines
This folder is not currently a Git repository, so there is no commit history to follow. If Git is initialized, use concise Conventional Commit messages such as `feat: add testimonial section` or `fix: correct mobile CTA spacing`.

For pull requests, include:

- A short description of the change.
- Screenshots or a short screen recording for UI updates.
- Notes on validation performed, usually `npm run build`.
