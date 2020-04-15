# Winddown - Write code and stay healthy

Be reminded to get off the screen without being interrupted.

After 25 minutes, winddown slowly fades out the colors until you take your hands off the keyboard for a moment.

Save on pain medication and buy me a soda instead: [![donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=Y9TKS7F2E2A2E)

![demo gif](https://raw.githubusercontent.com/schneefux/vscode-winddown/master/demo.gif)

Warning! This plugin will overwrite `workbench.colorCustomizations` and `editor.tokenColorCustomizations`.

## Installation

[Install winddown from the VS Code marketplace](https://marketplace.visualstudio.com/items?itemName=winddown.vscode-winddown)

## Configuration

  * `winddown.minutesTillBreak` (default 25): Time in minutes until theme colors start fading out.
  * `winddown.winddownDurationMinutes` (default 5): Time in minutes until theme colors have fully faded out.
  * `winddown.breakDurationMinutes` (default 3): Time in minutes until theme colors are reset to normal.
  * `winddown.framesPerMinute` (default 4): Color update frequency during winddown. Usually you do not need to change this. Lower it if you are distracted by screen flashes, increase it for smoother color transitions. Must be between 1 and 60.

## Development

  * `npm install`
  * In VS Code, "Run", "Start Debugging"
