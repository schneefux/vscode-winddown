import { workspace, window, extensions } from 'vscode'
import { readFileSync } from 'fs'
import * as path from 'path'
import * as chroma from 'chroma-js'
import json5 from 'json5'

interface ThemeColors {
  [key: string]: string;
}

/**
 * Load the current theme's configuration files.
 * @param themeName Theme to search for
 * @returns colors and tokenRules
 */
function getThemeColors(themeName: string): { colors: ThemeColors, tokenRules: any[] } {
  // workaround for https://github.com/Microsoft/vscode/issues/32813
  let currentThemePath = null as string|null;
  for (const extension of extensions.all) {
    const themes = extension.packageJSON.contributes?.themes;
    const currentTheme = themes?.find(theme => theme.id === themeName || theme.label === themeName);
    if (currentTheme !== undefined) {
      currentThemePath = path.join(extension.extensionPath, currentTheme.path);
      break;
    }
  }

  const themePaths = [] as string[];
  if (currentThemePath !== null) {
    themePaths.push(currentThemePath);
  }

  let colors = {} as ThemeColors;
  colors['statusBar.background'] = '#007ACC'; // missing default
  let tokenRules = [] as any[];
  while (themePaths.length > 0) {
    const themePath = themePaths.pop() as string;
    const theme = json5.parse(readFileSync(themePath).toString());
    if ('include' in theme) {
      themePaths.push(path.join(path.dirname(themePath), theme.include));
    }
    if ('colors' in theme) {
      colors = {...colors, ...theme.colors};
    }
    if ('tokenColors' in theme) {
      tokenRules = [...tokenRules, ...theme.tokenColors];
    }
  }

  return {
    colors,
    tokenRules,
  };
}

/**
 * Update the workspace configuration file.
 * @param settings key-values to write into the configuration
 */
function applySettings(settings: object) {
  if (!settings) {
    return
  }
  const workspaceSettings = workspace.getConfiguration()
  Object.keys(settings).forEach((k) => {
    workspaceSettings.update(k, settings[k], true)
      .then(undefined, (reason: string) => console.error(reason))
  })
}

/**
 * Set the saturation of theme and token colors.
 * @param fraction 0.0 (gray) to 1.0 (no change).
 */
export function setSaturation(fraction: number) {
  fraction = Math.min(1, Math.max(0, fraction))

  const workbench = workspace.getConfiguration('workbench')
  const colors = getThemeColors(workbench.colorTheme)

  // see https://en.wikipedia.org/wiki/Munsell_color_system#Chroma
  const desaturate = (color: string) => chroma.hex(color).desaturate((1 - fraction) * 5).hex()

  const newColors = {} as ThemeColors;
  Object.entries(colors.colors)
    .forEach(([key, color]) => newColors[key] = desaturate(color))

  const newTokenRules = [] as any[];
  colors.tokenRules.forEach(rule => {
    const newSettings = {} as ThemeColors;
    Object.entries(rule.settings)
      .forEach(([key, value]) => newSettings[key] = (<string>value).startsWith('#') ? desaturate(<string>value) : <string>value)
    newTokenRules.push({
      ...rule,
      settings: newSettings,
    });
  });

  applySettings({
    'workbench.colorCustomizations': newColors,
    'editor.tokenColorCustomizations': {
      'textMateRules': newTokenRules,
    },
  });
}

/**
 * Clear all customizations.
 */
export function reset() {
  const workspaceSettings = workspace.getConfiguration();
  Object.keys(workspaceSettings.get('workbench.colorCustomizations') || {}).forEach(key => {
    workspaceSettings.update(key, undefined, true)
      .then(undefined, (reason: string) => console.error(reason))
  });
  workspaceSettings.update('editor.tokenColorCustomizations', undefined, true)
    .then(undefined, (reason: string) => console.error(reason))
  workspaceSettings.update('workbench.colorCustomizations', undefined, true)
    .then(undefined, (reason: string) => console.error(reason))
}
