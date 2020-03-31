import { ExtensionContext, WorkspaceConfiguration, StatusBarItem, window, StatusBarAlignment } from 'vscode'
import * as editor from './editor'

export interface WinddownConfiguration extends WorkspaceConfiguration {
  minutesTillBreak: number;
  saturationDecayPerMinute: number;
  breakDurationMinutes: number;
}

export default class Winddown {
  public static readonly extensionName = 'Winddown'
  public static readonly extensionAlias = 'winddown'
  public static extensionContext: ExtensionContext

  private config = {
    minutesTillBreak: 15,
    saturationDecayPerMinute: 0.2,
    breakDurationMinutes: 3,
  } as WinddownConfiguration;
  private firstActive: number // end of last break
  private lastActive: number // last activity
  private timer!: NodeJS.Timer
  private statusBarItem!: StatusBarItem;

  constructor() {
    this.firstActive = Date.now()
    this.lastActive = Date.now()
  }

  public start() {
    this.timer = setInterval(() => {
      this.update()
    }, 1000 * 15)
    this.update();
  }

  public stop() {
    clearInterval(this.timer)
  }

  public configure(config: WinddownConfiguration) {
    this.config = config;
    this.update();
  }

  /**
   * Register user activity.
   */
  public logActivity() {
    this.lastActive = Date.now()
  }

  /**
   * Re-render the UI.
   */
  public update() {
    const now = Date.now()
    const minutesSinceLastActive = (now - this.lastActive) / 1000 / 60
    const minutesSinceFirstActive = (now - this.firstActive) / 1000 / 60

    if (minutesSinceLastActive > this.config.breakDurationMinutes) {
      // on a break
      this.firstActive = Date.now();
      editor.setSaturation(1);
      if (this.statusBarItem) {
        this.statusBarItem.hide();
      }
    } else {
      // still coding
      if (minutesSinceFirstActive > this.config.minutesTillBreak) {
        // needs a break
        const overtimeMinutes = minutesSinceFirstActive - this.config.minutesTillBreak;
        editor.setSaturation(1 - overtimeMinutes * this.config.saturationDecayPerMinute);
        if (!this.statusBarItem) {
          this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        }
        this.statusBarItem.show();
        this.statusBarItem.text = 'You should take a break!';
      }
    }
  }
}
