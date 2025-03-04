import LoggerInterface, { LogLevel, LogOptions } from '../interfaces/LoggerInterface';

const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    debug: '\x1b[36m',    // Cyan
    info: '\x1b[32m',     // Green
    warning: '\x1b[33m',  // Yellow
    error: '\x1b[31m'     // Red
};

export default class ConsoleLogger implements LoggerInterface {
    private options: LogOptions = {
        timestamp: true,
        level: true,
        color: true
    };

    constructor(options?: LogOptions) {
        if (options) {
            this.options = { ...this.options, ...options };
        }
    }

    private formatMessage(level: LogLevel, message: string, args: any[]): string {
        let formattedMessage = '';

        // Add timestamp if enabled
        if (this.options.timestamp) {
            formattedMessage += `${this.options.color ? COLORS.dim : ''}[${new Date().toISOString()}]${this.options.color ? COLORS.reset : ''} `;
        }

        // Add log level if enabled
        if (this.options.level) {
            const levelColor = this.options.color ? COLORS[level] : '';
            const levelText = level.toUpperCase().padEnd(7);
            formattedMessage += `${levelColor}${COLORS.bright}${levelText}${COLORS.reset} `;
        }

        // Add message
        formattedMessage += message;

        // Add additional arguments if present
        if (args.length > 0) {
            formattedMessage += ' ';
            args.forEach(arg => {
                if (typeof arg === 'object') {
                    formattedMessage += JSON.stringify(arg, null, 2);
                } else {
                    formattedMessage += arg.toString();
                }
            });
        }

        return formattedMessage;
    }

    debug(message: string, ...args: any[]): void {
        console.debug(this.formatMessage('debug', message, args));
    }

    info(message: string, ...args: any[]): void {
        console.info(this.formatMessage('info', message, args));
    }

    warning(message: string, ...args: any[]): void {
        console.warn(this.formatMessage('warning', message, args));
    }

    error(message: string, ...args: any[]): void {
        console.error(this.formatMessage('error', message, args));
    }

    setOptions(options: LogOptions): void {
        this.options = { ...this.options, ...options };
    }

    getOptions(): LogOptions {
        return { ...this.options };
    }
}
