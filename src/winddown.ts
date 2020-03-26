import { ExtensionContext } from 'vscode'
import * as editor from './editor'

export default class Sundial {
  public static readonly extensionName = 'Sundial'
  public static readonly extensionAlias = 'sundial'
  public static extensionContext: ExtensionContext

  private enabled = true
  private isRunning = false
  private firstActive: number // end of last break
  private lastActive: number // last activity
  private timer!: NodeJS.Timer

  constructor() {
    this.firstActive = Date.now()
    this.lastActive = Date.now()
  }

  public enableExtension() {
    this.enabled = true
    this.startTimer()
    this.update();
  }

  public disableExtension() {
    clearInterval(this.timer)
    this.enabled = false
  }

  public startTimer() {
    this.timer = setInterval(() => {
      this.update()
    }, 1000 * 15) // TODO DEBUG
  }

  public async logActivity() {
    this.lastActive = Date.now()
    this.update();
  }

  public async update() {
    if (!this.enabled || this.isRunning) {
      return
    }

    this.isRunning = true
    clearInterval(this.timer)

    const now = Date.now()
    const minutesSinceLastActive = (now - this.lastActive) / 1000 / 60
    const minutesSinceFirstActive = (now - this.firstActive) / 1000 / 60

    console.log('minutes since last activity: ' + minutesSinceLastActive)
    console.log('minutes since first activity: ' + minutesSinceFirstActive)
    /*
    if (minutesSinceLastActive > 1) {
      // on a break
      this.firstActive = Date.now()
      editor.setSaturation(1)
    } else {
      // still coding
      if (minutesSinceFirstActive > 2) {
        // needs a break
        editor.setSaturation(3 - minutesSinceFirstActive)
      }
    }
    */
    editor.setSaturation(0)

    this.isRunning = false
    this.startTimer()
  }
}
