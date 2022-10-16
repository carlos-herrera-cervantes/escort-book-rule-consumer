export {};

declare global {
  interface String {
    extractServiceMetadata(): [string, string];
    toShortDateString(): string;
  }
}

String.prototype.extractServiceMetadata = function (): [string, string] {
  const self = this as string;
  
  if (!self.includes('|')) return [self, self];

  const parts = self.split('|');

  return [parts[0], parts[1]];
}

String.prototype.toShortDateString = function (): string {
  const self = this as string;
  const portions = self.split(' ');
  const now = new Date();

  const date = `${now.getUTCFullYear()}-${portions[3]}-${portions[2]}`;
  const hour = `${portions[1]}:${portions[0]}`;

  return date + 'T' + hour;
}
