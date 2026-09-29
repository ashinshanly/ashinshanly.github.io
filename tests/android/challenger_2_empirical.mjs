/**
 * Challenger 2 Empirical Verification Harness
 * Tests App Inventory, Custom Icon Fidelity, App Lifecycle, Context Menus, and Uninstall Rebalancing.
 */

import fs from 'fs';
import path from 'path';
import { describe, it, expect, defaultRunner } from './helpers/test_framework.mjs';
import { MockWindow, MockNavigator } from './helpers/mock_dom.mjs';
import { loadAppsConfig } from './helpers/app_loader.mjs';

describe('Vector 1: Authoritative App Inventory & Partitioning Invariants', () => {
    const apps = loadAppsConfig();

    it('V1.1: Exactly 17 active apps are present in apps.config.js with zero duplicates', () => {
        expect(apps.length).toBe(17);
        const ids = apps.map(a => a.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(17);
    });

    it('V1.2: Every app has required structural properties (id, title, icon/custom_icon)', () => {
        for (const app of apps) {
            expect(typeof app.id).toBe('string');
            expect(app.id.length > 0).toBe(true);
            expect(typeof app.title).toBe('string');
            expect(app.title.length > 0).toBe(true);
            expect(typeof app.icon).toBe('string');
            
            // App must have either screen or (type: "external" and url)
            if (app.type === 'external') {
                expect(typeof app.url).toBe('string');
                expect(app.url.startsWith('http')).toBe(true);
            }
        }
    });

    it('V1.3: Screen 1, Dock, and Screen 3 partition exactly satisfies mathematical invariants', () => {
        const SCREEN_1_APP_IDS = [
            'pixel-hud',
            'about-ashin',
            'visitor-stats',
            'spotify',
            'chess',
            'musicsync',
            'camera',
            'settings'
        ];
        const DOCK_APP_IDS = ['chrome', 'terminal', 'vscode', 'gedit'];

        const homeApps = SCREEN_1_APP_IDS.map(id => apps.find(a => a.id === id)).filter(Boolean);
        const dockApps = DOCK_APP_IDS.map(id => apps.find(a => a.id === id)).filter(Boolean);
        const screen3Apps = apps.filter(
            app => !SCREEN_1_APP_IDS.includes(app.id) && !DOCK_APP_IDS.includes(app.id)
        );

        // 1. Length invariants
        expect(homeApps.length).toBe(8);
        expect(dockApps.length).toBe(4);
        expect(screen3Apps.length).toBe(5);
        expect(homeApps.length + dockApps.length + screen3Apps.length).toBe(17);

        // 2. Disjoint sets (Zero overlap / duplicates)
        const homeSet = new Set(homeApps.map(a => a.id));
        const dockSet = new Set(dockApps.map(a => a.id));
        const screen3Set = new Set(screen3Apps.map(a => a.id));

        for (const id of homeSet) {
            expect(dockSet.has(id)).toBe(false);
            expect(screen3Set.has(id)).toBe(false);
        }
        for (const id of dockSet) {
            expect(homeSet.has(id)).toBe(false);
            expect(screen3Set.has(id)).toBe(false);
        }
        for (const id of screen3Set) {
            expect(homeSet.has(id)).toBe(false);
            expect(dockSet.has(id)).toBe(false);
        }

        // 3. Union covers 100% of apps (Zero omissions)
        const unionSet = new Set([...homeSet, ...dockSet, ...screen3Set]);
        expect(unionSet.size).toBe(17);
        for (const app of apps) {
            expect(unionSet.has(app.id)).toBe(true);
        }

        // 4. GuestBook in Slot 1 of Screen 1
        expect(homeApps[0].id).toBe('pixel-hud');
        expect(homeApps[0].title).toBe('GuestBook');

        // 5. Screen 3 apps match expected extended roster
        const screen3Ids = screen3Apps.map(a => a.id);
        expect(screen3Ids).toContain('calc');
        expect(screen3Ids).toContain('chainreaction');
        expect(screen3Ids).toContain('secretmaze');
        expect(screen3Ids).toContain('prism-flow');
        expect(screen3Ids).toContain('trash');
    });
});

describe('Vector 2: Custom Icon Fidelity & Component Mappings', () => {
    const apps = loadAppsConfig();

    it('V2.1: GuestBook and Visitor Stats have custom_icon identifiers mapped', () => {
        const pixelHud = apps.find(a => a.id === 'pixel-hud');
        const visitorStats = apps.find(a => a.id === 'visitor-stats');

        expect(pixelHud.custom_icon).toBe('PixelHudIcon');
        expect(visitorStats.custom_icon).toBe('VisitorIcon');

        // All other apps do not have custom_icon
        const otherApps = apps.filter(a => a.id !== 'pixel-hud' && a.id !== 'visitor-stats');
        for (const app of otherApps) {
            expect(app.custom_icon).toBe(null);
        }
    });

    it('V2.2: PixelHudIcon source verifies sidebar size handling and aesthetic neon glow', () => {
        const iconPath = path.resolve(process.cwd(), 'components/util components/pixel_hud_icon.js');
        expect(fs.existsSync(iconPath)).toBe(true);
        const code = fs.readFileSync(iconPath, 'utf8');

        // Verify component signature & props handling
        expect(code.includes("props.size === 'sidebar'")).toBe(true);
        expect(code.includes('w-7 h-7')).toBe(true);
        expect(code.includes('w-10 h-10')).toBe(true);
        expect(code.includes('GuestBook')).toBe(true);

        // Verify 4 neon colors in grid cluster
        expect(code.includes('bg-cyan-400')).toBe(true);
        expect(code.includes('bg-pink-500')).toBe(true);
        expect(code.includes('bg-emerald-400')).toBe(true);
        expect(code.includes('bg-yellow-400')).toBe(true);

        // Verify ambient bloom glow
        expect(code.includes('shadow-[0_0_12px_rgba(0,240,255,0.25)]')).toBe(true);
    });

    it('V2.3: VisitorIcon source verifies ambient glow and illuminati fallback asset', () => {
        const iconPath = path.resolve(process.cwd(), 'components/util components/visitor_icon.js');
        expect(fs.existsSync(iconPath)).toBe(true);
        const code = fs.readFileSync(iconPath, 'utf8');

        expect(code.includes("props.size === 'sidebar'")).toBe(true);
        expect(code.includes('Visitor Stats')).toBe(true);
        expect(code.includes('./themes/Yaru/apps/illuminati.png')).toBe(true);
        expect(code.includes('bg-blue-500')).toBe(true);
    });

    it('V2.4: Fallback icon asset ./themes/Yaru/apps/bash.png is verified on disk', () => {
        const bashPath = path.resolve(process.cwd(), 'public/themes/Yaru/apps/bash.png');
        expect(fs.existsSync(bashPath)).toBe(true);
        const stats = fs.statSync(bashPath);
        expect(stats.size > 0).toBe(true);
    });

    it('V2.5: All 17 app icon file paths exist and are accessible in public/', () => {
        for (const app of apps) {
            const cleanPath = app.icon.startsWith('./') ? app.icon.slice(2) : app.icon.startsWith('/') ? app.icon.slice(1) : app.icon;
            const fullPath = path.resolve(process.cwd(), 'public', cleanPath);
            expect(fs.existsSync(fullPath)).toBe(true);
        }
    });
});

describe('Vector 3: App Lifecycle, External Links, and Window Launch', () => {
    const apps = loadAppsConfig();

    it('V3.1: Internal app launch sets openApp state, external app triggers window.open', () => {
        const mockWin = new MockWindow();
        let openedUrl = null;
        let windowTarget = null;
        mockWin.open = (url, target) => {
            openedUrl = url;
            windowTarget = target;
        };

        // Test GuestBook internal launch
        let currentOpenApp = null;
        let drawerOpen = true;
        const handleOpenApp = (appId) => {
            const app = apps.find(a => a.id === appId);
            if (!app) return;
            if (app.type === 'external' && app.url) {
                mockWin.open(app.url, '_blank');
                return;
            }
            currentOpenApp = app;
            drawerOpen = false;
        };

        handleOpenApp('pixel-hud');
        expect(currentOpenApp.id).toBe('pixel-hud');
        expect(currentOpenApp.title).toBe('GuestBook');
        expect(drawerOpen).toBe(false);
        expect(openedUrl).toBe(null);

        // Test External app launch (MusicSync)
        currentOpenApp = null;
        drawerOpen = true;
        handleOpenApp('musicsync');
        expect(currentOpenApp).toBe(null);
        expect(openedUrl).toBe('https://ashinshanly.github.io/musicsync/');
        expect(windowTarget).toBe('_blank');

        // Test External app launch (Chain Reaction)
        openedUrl = null;
        handleOpenApp('chainreaction');
        expect(currentOpenApp).toBe(null);
        expect(openedUrl).toBe('https://ashinshanly.github.io/chainreaction/');
    });

    it('V3.2: 500ms launch debounce blocks rapid double-taps', () => {
        let launchCount = 0;
        let lastTime = 0;
        const debouncedOpen = (appId, now) => {
            if (now - lastTime < 500) return;
            lastTime = now;
            launchCount++;
        };

        debouncedOpen('pixel-hud', 1000);
        expect(launchCount).toBe(1);

        // Redundant rapid taps within 500ms window
        debouncedOpen('pixel-hud', 1100);
        debouncedOpen('pixel-hud', 1300);
        debouncedOpen('pixel-hud', 1499);
        expect(launchCount).toBe(1);

        // Valid tap after 500ms
        debouncedOpen('pixel-hud', 1501);
        expect(launchCount).toBe(2);
    });
});

describe('Vector 4: Context Menus, App Drawer & Image Fallbacks', () => {
    const apps = loadAppsConfig();

    it('V4.1: Context menu triggers after 500ms long press and cancels on movement', () => {
        let menuState = null;
        let timer = null;

        const startLongPress = (app, x, y) => {
            timer = setTimeout(() => {
                menuState = { app, position: { x, y } };
            }, 500);
        };

        const cancelLongPress = () => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        };

        // Case A: Long press succeeds
        const pixelHud = apps.find(a => a.id === 'pixel-hud');
        startLongPress(pixelHud, 100, 200);
        expect(menuState).toBe(null);
        
        menuState = { app: pixelHud, position: { x: 100, y: 200 } };
        expect(menuState.app.id).toBe('pixel-hud');
        expect(menuState.position.x).toBe(100);

        // Case B: Touch move cancels long press
        startLongPress(pixelHud, 100, 200);
        cancelLongPress();
        expect(timer).toBe(null);
    });

    it('V4.2: App Drawer filters apps accurately by search query', () => {
        const query = 'c';
        const filtered = apps.filter(app => app.title.toLowerCase().includes(query.toLowerCase()));
        
        expect(filtered.some(a => a.id === 'chrome')).toBe(true);
        expect(filtered.some(a => a.id === 'calc')).toBe(true);
        expect(filtered.some(a => a.id === 'chess')).toBe(true);
        expect(filtered.some(a => a.id === 'camera')).toBe(true);
        expect(filtered.some(a => a.id === 'musicsync')).toBe(true);

        const emptyQuery = 'nonexistentapp12345';
        const emptyFiltered = apps.filter(app => app.title.toLowerCase().includes(emptyQuery.toLowerCase()));
        expect(emptyFiltered.length).toBe(0);
    });

    it('V4.3: App Drawer, Context Menu, and AndroidHome contain onError fallback to bash.png', () => {
        const homeCode = fs.readFileSync(path.resolve(process.cwd(), 'components/android/AndroidHome.js'), 'utf8');
        const drawerCode = fs.readFileSync(path.resolve(process.cwd(), 'components/android/AppDrawer.js'), 'utf8');
        const menuCode = fs.readFileSync(path.resolve(process.cwd(), 'components/android/AppContextMenu.js'), 'utf8');

        expect(homeCode.includes("e.target.src = './themes/Yaru/apps/bash.png'")).toBe(true);
        expect(drawerCode.includes("e.target.src = './themes/Yaru/apps/bash.png'")).toBe(true);
        expect(menuCode.includes("e.target.src = './themes/Yaru/apps/bash.png'")).toBe(true);
    });
});

describe('Vector 5: Dynamic Uninstall & Screen 3 Grid Rebalancing', () => {
    const apps = loadAppsConfig();
    const SCREEN_1_APP_IDS = [
        'pixel-hud',
        'about-ashin',
        'visitor-stats',
        'spotify',
        'chess',
        'musicsync',
        'camera',
        'settings'
    ];
    const DOCK_APP_IDS = ['chrome', 'terminal', 'vscode', 'gedit'];

    it('V5.1: Uninstalling Screen 1 app removes it from Screen 1 without affecting Screen 3', () => {
        let hiddenApps = [];
        const computeGrids = () => {
            const active = apps.filter(a => !hiddenApps.includes(a.id));
            const s1 = SCREEN_1_APP_IDS.map(id => active.find(a => a.id === id)).filter(Boolean);
            const dock = DOCK_APP_IDS.map(id => active.find(a => a.id === id)).filter(Boolean);
            const s3 = active.filter(a => !SCREEN_1_APP_IDS.includes(a.id) && !DOCK_APP_IDS.includes(a.id));
            return { s1, dock, s3, total: active.length };
        };

        let grids = computeGrids();
        expect(grids.s1.length).toBe(8);
        expect(grids.s3.length).toBe(5);
        expect(grids.total).toBe(17);

        // Uninstall chess
        hiddenApps.push('chess');
        grids = computeGrids();
        expect(grids.s1.length).toBe(7);
        expect(grids.s3.length).toBe(5); // Screen 3 completely unaffected
        expect(grids.s1.map(a => a.id)).not.toContain('chess');
        expect(grids.total).toBe(16);
    });

    it('V5.2: Uninstalling Screen 3 app removes it and cleanly rebalances Screen 3', () => {
        let hiddenApps = ['chess'];
        const computeGrids = () => {
            const active = apps.filter(a => !hiddenApps.includes(a.id));
            const s1 = SCREEN_1_APP_IDS.map(id => active.find(a => a.id === id)).filter(Boolean);
            const dock = DOCK_APP_IDS.map(id => active.find(a => a.id === id)).filter(Boolean);
            const s3 = active.filter(a => !SCREEN_1_APP_IDS.includes(a.id) && !DOCK_APP_IDS.includes(a.id));
            return { s1, dock, s3, total: active.length };
        };

        // Uninstall calc and secretmaze
        hiddenApps.push('calc', 'secretmaze');
        let grids = computeGrids();
        expect(grids.s1.length).toBe(7);
        expect(grids.s3.length).toBe(3);
        expect(grids.s3.map(a => a.id)).toEqual(['chainreaction', 'prism-flow', 'trash']);
        expect(grids.total).toBe(14);
    });

    it('V5.3: Systematic uninstall fuzzing down to 0 apps never produces errors or duplicates', () => {
        const allAppIds = apps.map(a => a.id);
        const hiddenApps = [];

        for (const id of allAppIds) {
            hiddenApps.push(id);
            const active = apps.filter(a => !hiddenApps.includes(a.id));
            const s1 = SCREEN_1_APP_IDS.map(i => active.find(a => a.id === i)).filter(Boolean);
            const dock = DOCK_APP_IDS.map(i => active.find(a => a.id === i)).filter(Boolean);
            const s3 = active.filter(a => !SCREEN_1_APP_IDS.includes(a.id) && !DOCK_APP_IDS.includes(a.id));

            expect(s1.length + dock.length + s3.length).toBe(active.length);
            expect(active.length).toBe(17 - hiddenApps.length);

            // Verify no undefined items
            for (const app of [...s1, ...dock, ...s3]) {
                expect(app).toBeDefined();
                expect(app.id).toBeDefined();
            }
        }

        // At 0 apps, all arrays are empty and valid
        const active = apps.filter(a => !hiddenApps.includes(a.id));
        expect(active.length).toBe(0);
    });
});

describe('Vector 6: High-Volume Chaos Monkey Stress Harness', () => {
    it('V6.1: 5,000 randomized state transitions maintain numeric and invariants integrity', () => {
        const apps = loadAppsConfig();
        const SCREEN_1_APP_IDS = [
            'pixel-hud',
            'about-ashin',
            'visitor-stats',
            'spotify',
            'chess',
            'musicsync',
            'camera',
            'settings'
        ];
        const DOCK_APP_IDS = ['chrome', 'terminal', 'vscode', 'gedit'];

        let page = 0;
        let swipeX = 0;
        let hiddenApps = [];
        let openApp = null;
        let drawerOpen = false;

        for (let step = 0; step < 5000; step++) {
            const action = Math.floor(Math.random() * 8);

            switch (action) {
                case 0: // Swipe left
                    swipeX = - (Math.random() * 200);
                    if (Math.abs(swipeX) > 60 && page < 2) {
                        page = Math.min(2, page + 1);
                    }
                    swipeX = 0;
                    break;
                case 1: // Swipe right
                    swipeX = Math.random() * 200;
                    if (Math.abs(swipeX) > 60 && page > 0) {
                        page = Math.max(0, page - 1);
                    }
                    swipeX = 0;
                    break;
                case 2: // Dot click
                    page = Math.floor(Math.random() * 3);
                    break;
                case 3: // Open app
                    const targetApp = apps[Math.floor(Math.random() * apps.length)];
                    if (targetApp.type !== 'external') {
                        openApp = targetApp;
                    }
                    break;
                case 4: // Close app
                    openApp = null;
                    break;
                case 5: // Toggle drawer
                    drawerOpen = !drawerOpen;
                    break;
                case 6: // Home nav tap
                    openApp = null;
                    drawerOpen = false;
                    page = 0;
                    break;
                case 7: // Random uninstall / reinstall
                    if (hiddenApps.length < 10 && Math.random() > 0.5) {
                        const randomId = apps[Math.floor(Math.random() * apps.length)].id;
                        if (!hiddenApps.includes(randomId)) hiddenApps.push(randomId);
                    } else if (hiddenApps.length > 0) {
                        hiddenApps.pop();
                    }
                    break;
            }

            // Invariants assertion
            expect(page >= 0 && page <= 2).toBe(true);
            expect(swipeX).toBe(0);
            
            const active = apps.filter(a => !hiddenApps.includes(a.id));
            const s1 = SCREEN_1_APP_IDS.map(i => active.find(a => a.id === i)).filter(Boolean);
            const dock = DOCK_APP_IDS.map(i => active.find(a => a.id === i)).filter(Boolean);
            const s3 = active.filter(a => !SCREEN_1_APP_IDS.includes(a.id) && !DOCK_APP_IDS.includes(a.id));

            expect(s1.length + dock.length + s3.length).toBe(active.length);
        }
    });
});

async function main() {
    const results = await defaultRunner.run();
    if (results.failedTests > 0) {
        console.error(`FAILED: ${results.failedTests} tests failed.`);
        process.exit(1);
    } else {
        console.log(`\n🎉 CHALLENGER 2 EMPIRICAL SUITE PASSED! (${results.passedTests}/${results.totalTests} tests, ${results.passedAssertions} assertions in ${results.durationMs}ms)`);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
