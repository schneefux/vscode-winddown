'use strict'

import { window, ExtensionContext, commands, workspace, ConfigurationChangeEvent } from 'vscode'
import Winddown from './winddown'

const winddown = new Winddown()

function onActivity() {
  winddown.logActivity()
}

function onChange() {
  winddown.update()
}

function configChanged(event: ConfigurationChangeEvent) {
  const darkColorTheme = event.affectsConfiguration('workbench.preferredDarkColorTheme')
  const lightColorTheme = event.affectsConfiguration('workbench.preferredDarkColorTheme')

  if (darkColorTheme || lightColorTheme) {
    onChange();
  }
}

export function activate(context: ExtensionContext) {
  Winddown.extensionContext = context
  winddown.enableExtension()

  context.subscriptions.push(window.onDidChangeWindowState(onActivity)) // TODO disable on unfocus?
  context.subscriptions.push(window.onDidChangeActiveTextEditor(onActivity))
  context.subscriptions.push(window.onDidChangeTextEditorViewColumn(onActivity))
  context.subscriptions.push(window.onDidChangeTextEditorSelection(onActivity))
  context.subscriptions.push(window.onDidChangeActiveTextEditor(onActivity))

  context.subscriptions.push(workspace.onDidChangeConfiguration(configChanged))

  commands.registerCommand('winddown.enableExtension', () => winddown.disableExtension())
  commands.registerCommand('winddown.disableExtension', () => winddown.disableExtension())
}

export function deactivate() {
  winddown.disableExtension()
}
