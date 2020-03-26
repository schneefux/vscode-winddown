import { workspace, window, extensions } from 'vscode'
import * as path from 'path'
import { readFileSync } from 'fs'
import json5 from 'json5'
import * as chroma from 'chroma-js'

interface ThemeColors {
  [key: string]: string;
}

const getThemeColors = (themeName: string): { colors: ThemeColors, tokenRules: any[] } => {
  let currentThemePath = null as string|null;
  for (const extension of extensions.all) {
    const themes = extension.packageJSON.contributes?.themes;
    const currentTheme = themes?.find(theme => theme.id === themeName);
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

function applySettings(settings: object) {
  if (!settings) {
    return // no settings, nothing to do
  }
  const workspaceSettings = workspace.getConfiguration()
  Object.keys(settings).forEach((k) => {
    workspaceSettings.update(k, settings[k], true).then(undefined, (reason: string) => {
      console.error(reason)
      window.showErrorMessage(
        `You tried to apply \`${k}: ${settings[k]}\` but this is not a valid VS Code settings
          key/value pair. Please make sure all settings that you give to Sundial are valid
          inside VS Code settings!`
      )
    })
  })
}

export function setSaturation(fraction: number) {
  fraction = Math.min(1, Math.max(0, fraction))

  const workbench = workspace.getConfiguration('workbench')
  const colors = getThemeColors(workbench.colorTheme)

  // see https://en.wikipedia.org/wiki/Munsell_color_system#Chroma
  const desaturate = (color: string) => chroma.hex(color).desaturate((1 - fraction) * 10).hex()

  // TODO only works with default light/dark, for others color arrays are empty

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
