/**
 * Simple logger utility with timestamps
 * Provides consistent logging format across the application
 */

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(
    level: string,
    message: string,
    ...args: any[]
  ): [string, ...any[]] {
    const timestamp = this.getTimestamp();
    const prefix = `[${timestamp}] [${level}]`;

    if (typeof message === "string") {
      return [`${prefix} ${message}`, ...args];
    }

    return [prefix, message, ...args];
  }

  log(message: any, ...args: any[]): void {
    const [formattedMessage, ...rest] = this.formatMessage(
      "INFO",
      message,
      ...args
    );
    console.log(formattedMessage, ...rest);
  }

  info(message: any, ...args: any[]): void {
    const [formattedMessage, ...rest] = this.formatMessage(
      "INFO",
      message,
      ...args
    );
    console.log(formattedMessage, ...rest);
  }

  warn(message: any, ...args: any[]): void {
    const [formattedMessage, ...rest] = this.formatMessage(
      "WARN",
      message,
      ...args
    );
    console.warn(formattedMessage, ...rest);
  }

  error(message: any, ...args: any[]): void {
    const [formattedMessage, ...rest] = this.formatMessage(
      "ERROR",
      message,
      ...args
    );
    console.error(formattedMessage, ...rest);
  }

  debug(message: any, ...args: any[]): void {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.DEBUG === "true"
    ) {
      const [formattedMessage, ...rest] = this.formatMessage(
        "DEBUG",
        message,
        ...args
      );
      console.log(formattedMessage, ...rest);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export default for convenience
export default logger;
