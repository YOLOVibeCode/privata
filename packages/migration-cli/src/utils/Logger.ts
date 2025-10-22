export class Logger {
  constructor(private verbose: boolean = false) {}

  info(message: string, ...args: any[]): void {
    console.log(`[INFO] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (this.verbose) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }

  success(message: string, ...args: any[]): void {
    console.log(`[SUCCESS] ${message}`, ...args);
  }

  log(message: string, ...args: any[]): void {
    console.log(message, ...args);
  }
}

