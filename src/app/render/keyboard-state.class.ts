export class KeyboardState {
  private readonly MODIFIERS: string[] = ['shift', 'ctrl', 'alt', 'meta'];
  private readonly ALIAS: { [p:string]: number } = {
    'left': 37,
    'up': 38,
    'right': 39,
    'down': 40,
    'space': 32,
    'pageup': 33,
    'pagedown': 34,
    'tab': 9
  };

  private _keyCodes: { [p: string]: boolean } = {};
  private _modifiers: { [p: string]: boolean }	= {};

  constructor() {
    document.addEventListener("keydown", this._onKeyDown.bind(this), false);
    document.addEventListener("keyup", this._onKeyUp.bind(this), false);
  }

  public pressed(keyDesc: string): boolean {
    const keys: string[] = keyDesc.split("+");
    for (let i = 0; i < keys.length; i++) {
      const key: string	= keys[i];
      let pressed: boolean;
      if (this.MODIFIERS.indexOf(key) !== -1 ) {
        pressed	= this._modifiers[key];
      } else if (Object.keys(this.ALIAS).indexOf(key) !== -1) {
        pressed	= this._keyCodes[this.ALIAS[key]];
      } else {
        pressed	= this._keyCodes[key.toUpperCase().charCodeAt(0)]
      }
      if (!pressed) {
        return false;
      }
    }
    return true;
  }

  // create callback to bind/unbind keyboard events
  private _onKeyDown(event: KeyboardEvent): void {
    this._onKeyChange(event, true);
  };

  private _onKeyUp(event: KeyboardEvent): void {
    this._onKeyChange(event, false);
  };

  private _onKeyChange(event: KeyboardEvent, pressed: boolean): void {
    // update this.keyCodes
    const keyCode: number	= event.keyCode;
    this._keyCodes[keyCode] = pressed;

    // update this.modifiers
    this._modifiers['shift'] = event.shiftKey;
    this._modifiers['ctrl'] = event.ctrlKey;
    this._modifiers['alt']	= event.altKey;
    this._modifiers['meta']	= event.metaKey;
  }
}
