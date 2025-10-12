type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
}

class Logger {
  private config: LoggerConfig;

  constructor() {
    this.config = {
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
      enableConsole: process.env.NODE_ENV === 'development',
      enableRemote: process.env.NODE_ENV === 'production',
    };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return `${prefix} ${message}`;
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, ...args);

    if (this.config.enableConsole) {
      switch (level) {
        case 'debug':
          console.debug(formattedMessage, ...args);
          break;
        case 'info':
          console.info(formattedMessage, ...args);
          break;
        case 'warn':
          console.warn(formattedMessage, ...args);
          break;
        case 'error':
          console.error(formattedMessage, ...args);
          break;
      }
    }

    if (this.config.enableRemote) {
      // In production, you might want to send logs to a remote service
      // this.sendToRemoteService(level, formattedMessage, args);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log('error', message, ...args);
  }

  // Specialized logging methods
  themeLoad(themeName: string, success: boolean, error?: string): void {
    if (success) {
      this.info(`Theme loaded successfully: ${themeName}`);
    } else {
      this.error(`Failed to load theme: ${themeName}`, error);
    }
  }

  exportStart(format: string, slideCount: number): void {
    this.info(`Starting ${format} export with ${slideCount} slides`);
  }

  exportComplete(format: string, duration: number): void {
    this.info(`${format} export completed in ${duration}ms`);
  }

  exportError(format: string, error: string): void {
    this.error(`${format} export failed: ${error}`);
  }

  presentationMode(action: 'enter' | 'exit', slideIndex: number): void {
    this.info(`Presentation mode ${action} at slide ${slideIndex + 1}`);
  }

  llmRequest(prompt: string, success: boolean, duration?: number): void {
    if (success) {
      this.info(`LLM request completed in ${duration}ms`);
    } else {
      this.warn('LLM request failed, using fallback');
    }
  }

  // Performance logging
  performance(operation: string, duration: number): void {
    if (duration > 1000) {
      this.warn(`Slow operation: ${operation} took ${duration}ms`);
    } else {
      this.debug(`Operation: ${operation} took ${duration}ms`);
    }
  }

  // Security logging
  security(event: string, details?: unknown): void {
    this.warn(`Security event: ${event}`, details);
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience exports
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  themeLoad: logger.themeLoad.bind(logger),
  exportStart: logger.exportStart.bind(logger),
  exportComplete: logger.exportComplete.bind(logger),
  exportError: logger.exportError.bind(logger),
  presentationMode: logger.presentationMode.bind(logger),
  llmRequest: logger.llmRequest.bind(logger),
  performance: logger.performance.bind(logger),
  security: logger.security.bind(logger),
};

export default logger;
