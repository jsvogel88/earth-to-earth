import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const SCREENSHOT_DIR = path.join('test-results', 'screenshots');

function ensureScreenshotDir() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function capture(page, name) {
  ensureScreenshotDir();
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: false,
  });
}

/** PMOS command bar exposes `pmos-mode-{registryId}`; legacy panel used `mode-btn-{layerId}`. */
async function selectMode(page, registryId) {
  const pmosId = `pmos-mode-${registryId}`;
  const legacyId = `mode-btn-${registryId}`;
  const pmos = page.getByTestId(pmosId);
  if (await pmos.isVisible({ timeout: 3000 }).catch(() => false)) {
    await pmos.click();
  } else {
    await page.getByTestId(legacyId).click();
  }
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
}

async function toggleLayer(page, stateKey) {
  const el = page.getByTestId(`layer-toggle-${stateKey}`);
  if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
    await el.click({ force: true });
  }
}

async function openDockSection(page, label) {
  await page.getByRole('button', { name: label, exact: true }).click({ force: true });
}

test.describe('Transport Map — browser smoke', () => {
  test('loads without blank screen, console errors, or page errors', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/');
    await expect(page.getByTestId('transport-map-root')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId('transport-map-container')).toBeVisible();
    await expect(page.locator('#root')).not.toBeEmpty();

    expect(pageErrors, `page errors: ${pageErrors.join('; ')}`).toEqual([]);
    const ignorable = consoleErrors.filter(
      (t) =>
        !t.includes('Failed to load resource') &&
        !t.includes('favicon') &&
        !t.includes('404')
    );
    expect(ignorable, `console errors: ${ignorable.join('; ')}`).toEqual([]);
  });

  test('E2E and Hyperloop Web modes load', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('transport-map-root')).toBeVisible({ timeout: 60_000 });
    await selectMode(page, 'mode_e2e_starship');
    await capture(page, '01-default-e2e-view');
    await selectMode(page, 'mode_hyperloop_core');
    await capture(page, '02-hyperloop-web-view');
    await expect(page.getByTestId('transport-map-container')).toBeVisible();
  });

  test('layer toggles and sidebar sections work', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('transport-map-root')).toBeVisible({ timeout: 60_000 });
    await openDockSection(page, 'Layers');
    await expect(page.getByTestId('transport-control-panel')).toBeVisible({ timeout: 60_000 });

    await selectMode(page, 'mode_civilization_grid');
    await toggleLayer(page, 'showWorldCitiesPlanningGrid');
    await capture(page, '03-planning-grid-enabled');

    await selectMode(page, 'mode_e2m_orbital');
    await toggleLayer(page, 'showE2MLayer');
    await capture(page, '04-e2m-enabled');

    await selectMode(page, 'mode_robotaxi');
    await capture(page, '05-robotaxi-enabled');

    await selectMode(page, 'mode_e2e_starship');
    await toggleLayer(page, 'showRareEarthHubs');
    await capture(page, '06-rare-earth-enabled');

    await openDockSection(page, 'Planner');
    const parseSection = page.getByRole('button', { name: 'Parse Cities' });
    if (await parseSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await parseSection.click({ force: true });
      await expect(page.getByLabel(/city list to parse/i)).toBeVisible();
      const isolationToggle = page.getByLabel(/show only parsed cities/i);
      if (await isolationToggle.isVisible().catch(() => false)) {
        expect(await isolationToggle.isDisabled()).toBe(true);
      }
    }

    const sectionToggle = page.locator('.transport-os-section-toggle').first();
    if (await sectionToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sectionToggle.click({ force: true });
      await sectionToggle.click({ force: true });
    }
    await capture(page, '07-sidebar-expanded');

    const legend = page.getByTestId('pmos-dynamic-legend').or(page.getByTestId('grouped-legend'));
    await expect(legend.first()).toBeVisible();
    await capture(page, '08-legend-visible');
  });

  test('Integrated Grid loads with diagnostics and layer toggles', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('transport-map-root')).toBeVisible({ timeout: 60_000 });
    await selectMode(page, 'mode_civilization_grid');
    await openDockSection(page, 'Layers');
    await expect(page.getByTestId('transport-control-panel')).toBeVisible({ timeout: 60_000 });
    const diag = page.getByTestId('integrated-grid-diagnostics');
    if (await diag.isVisible({ timeout: 5000 }).catch(() => false)) {
      await diag.locator('summary').click();
    }
    await toggleLayer(page, 'showIntegratedE2M');
    await toggleLayer(page, 'showIntegratedE2E');
    await capture(page, '10-integrated-grid-phase4');
    await expect(page.getByTestId('transport-map-container')).toBeVisible();
  });

  test('survives repeated mode switches without blank screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('transport-map-root')).toBeVisible({ timeout: 60_000 });
    const modes = [
      'mode_e2e_starship',
      'mode_hyperloop_core',
      'mode_robotaxi',
      'mode_e2m_orbital',
      'mode_civilization_grid',
    ];
    for (let i = 0; i < 2; i += 1) {
      for (const id of modes) {
        await selectMode(page, id);
      }
    }
    await expect(page.getByTestId('transport-map-container')).toBeVisible();
    await capture(page, '09-after-mode-switching');
  });
});
