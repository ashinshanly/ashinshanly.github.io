# AGENT.md - ashinshanly.github.io Portfolio

## Build/Development Commands
- `npm run dev` or `yarn dev` - Start development server
- `npm run build` or `yarn build` - Build for production  
- `npm run start` or `yarn start` - Start production server
- `npm run export` or `yarn export` - Export static site
- No test suite configured - manual testing required

## Architecture & Structure
- **Tech Stack**: Next.js 15, React 18, Tailwind CSS, Firebase Realtime Database
- **Main Components**: Ubuntu desktop simulator with apps (chrome, chess, vscode, terminal, etc.)
- **Key Directories**: 
  - `components/` - React components (apps/, screen/, SEO/, util components/)
  - `pages/` - Next.js pages (`index.js`, `_app.js`, `_document.js`)
  - `lib/` - Utilities (chess/, firebase/)
  - `config/` - Configuration files
  - `styles/` - CSS and SCSS files
- **Apps Config**: Centralized in `apps.config.js` with app definitions
- **Firebase**: Real-time features for chess game and data sync

## Code Style Guidelines
- Use functional components with hooks (modern pattern)
- Import React explicitly: `import React, { useState } from 'react'`
- Use camelCase for variables, PascalCase for components
- Tailwind classes for styling with custom Ubuntu theme colors (ub-grey, ub-orange, etc.)
- File naming: kebab-case for files, PascalCase for component exports
- Props destructuring in function parameters
- Use `const` for immutable values, `let` for reassignable
- Comment TODO items with "//To do - description"
- Export default for main component, named exports for utilities
