export const ICON_PASS = "\u2713";
export const ICON_FAIL = "\u2717";
export const ICON_WARN = "\u26A0";
export const DIM = "\x1b[2m";
export const RESET = "\x1b[0m";
export const CLEAR_LINE = "\x1b[2K\r";
export const SPINNER = ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827"];

export function fail(message: string): never {
  console.error(`  ${ICON_FAIL} ${message}`);
  process.exit(1);
}

export function pass(message: string): void {
  console.log(`  ${ICON_PASS} ${message}`);
}

export function warn(message: string): void {
  console.log(`  ${ICON_WARN} ${message}`);
}
