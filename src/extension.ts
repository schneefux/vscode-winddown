import { window, ExtensionContext, workspace, ConfigurationChangeEvent, commands } from 'vscode'
import Winddown, { WinddownConfiguration } from './winddown'

const winddown = new Winddown()

/**
 * Log user activity.
 */
function onActivity() {
  winddown.logActivity();
}

/**
 * Update the color configuration.
 */
function onChange() {
  winddown.update();
}

/**
 * Postpone break.
 */
function onPostpone() {
  winddown.postpone();
}

/**
 * Reload the configuration.
 */
function reconfigure() {
  const config = workspace.getConfiguration('winddown') as WinddownConfiguration;
  winddown.configure(config);
}

function configChanged(event: ConfigurationChangeEvent) {
  if (event.affectsConfiguration('workbench.preferredDarkColorTheme') ||
      event.affectsConfiguration('workbench.preferredDarkColorTheme') ||
      event.affectsConfiguration('workbench.colorTheme')) {
    onChange();
  }

  if (event.affectsConfiguration('winddown')) {
    reconfigure();
  }
}

export function activate(context: ExtensionContext) {
  Winddown.extensionContext = context
  reconfigure();
  winddown.start();
  onChange();

  context.subscriptions.push(window.onDidChangeWindowState(onActivity));
  context.subscriptions.push(window.onDidChangeActiveTextEditor(onActivity));
  context.subscriptions.push(window.onDidChangeTextEditorViewColumn(onActivity));
  context.subscriptions.push(window.onDidChangeTextEditorSelection(onActivity));
  context.subscriptions.push(window.onDidChangeActiveTextEditor(onActivity));

  context.subscriptions.push(workspace.onDidChangeConfiguration(configChanged));

  commands.registerCommand('winddown.postpone', onPostpone);
}

export function deactivate() {
  winddown.stop();
}
