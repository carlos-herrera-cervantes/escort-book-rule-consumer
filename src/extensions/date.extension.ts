export {};

declare global {
  interface Date {
    toShortDateString(): string;
  }
}

Date.prototype.toShortDateString = function (): string {
  const self = this as Date;
  const date = `${self.getUTCFullYear()}-${self.getUTCMonth() + 1}-${self.getUTCDate()}`;
  const hour = `${self.getUTCHours()}:${self.getMinutes()}`;

  return date + 'T' + hour;
}
