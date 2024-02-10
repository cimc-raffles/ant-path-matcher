export default class StringBuilder {
  private _buffer: string[] = [];
  constructor() {}
  append(value: string): StringBuilder {
    this._buffer.push(value);
    return this;
  }
  toString() {
    return this._buffer.join("");
  }
}
