// tests/android/helpers/app_loader.mjs
// Authoritative App Config Loader & Parser for Android Test Suite

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../..");

export function loadAppsConfig() {
  const configPath = path.join(rootDir, "apps.config.js");
  const content = fs.readFileSync(configPath, "utf-8");

  // Regex parser for apps array definition
  const appsRegex = /{\s*id:\s*["']([^"']+)["'],\s*title:\s*["']([^"']+)["'],\s*icon:\s*["']([^"']+)["'],(?:\s*custom_icon:\s*([^,\s]+),)?(?:\s*disabled:\s*([^,\s]+),)?(?:\s*favourite:\s*([^,\s]+),)?(?:\s*desktop_shortcut:\s*([^,\s]+),)?(?:[\s\S]*?(?:type:\s*["']([^"']+)["'],)?[\s\S]*?(?:url:\s*["']([^"']+)["'],)?)/g;

  // Let's parse active items between `const apps = [` and `export default apps;`
  // We exclude commented out blocks /* ... */
  const cleanContent = content.replace(/\/\*[\s\S]*?\*\//g, "");

  const apps = [];
  const appBlockRegex = /{\s*id:\s*["']([^"']+)["'][\s\S]*?}/g;
  let match;

  while ((match = appBlockRegex.exec(cleanContent)) !== null) {
    const block = match[0];
    const idMatch = block.match(/id:\s*["']([^"']+)["']/);
    const titleMatch = block.match(/title:\s*["']([^"']+)["']/);
    const iconMatch = block.match(/icon:\s*["']([^"']+)["']/);
    const customIconMatch = block.match(/custom_icon:\s*([a-zA-Z0-9_]+)/);
    const disabledMatch = block.match(/disabled:\s*(true|false)/);
    const favMatch = block.match(/favourite:\s*(true|false)/);
    const shortcutMatch = block.match(/desktop_shortcut:\s*(true|false)/);
    const typeMatch = block.match(/type:\s*["']([^"']+)["']/);
    const urlMatch = block.match(/url:\s*["']([^"']+)["']/);

    if (idMatch && titleMatch && iconMatch) {
      apps.push({
        id: idMatch[1],
        title: titleMatch[1],
        icon: iconMatch[1],
        custom_icon: customIconMatch ? customIconMatch[1] : null,
        disabled: disabledMatch ? disabledMatch[1] === "true" : false,
        favourite: favMatch ? favMatch[1] === "true" : false,
        desktop_shortcut: shortcutMatch ? shortcutMatch[1] === "true" : false,
        type: typeMatch ? typeMatch[1] : "internal",
        url: urlMatch ? urlMatch[1] : null,
        isCustomIcon: Boolean(customIconMatch)
      });
    }
  }

  return apps;
}

export const PORTFOLIO_APPS = loadAppsConfig();

// Verify expected baseline
export const EXPECTED_TOTAL_APPS = 17;
export const DOCK_APP_IDS = ['chrome', 'terminal', 'vscode', 'gedit'];
export const PAGE_0_APP_IDS = ['pixel-hud', 'about-ashin', 'visitor-stats', 'spotify', 'chess', 'musicsync', 'camera', 'settings'];
export const EXTENDED_APP_IDS = ['calc', 'chainreaction', 'secretmaze', 'prism-flow', 'trash'];
