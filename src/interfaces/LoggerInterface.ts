export type LogLevel = 'debug' | 'info' | 'warning' | 'error';

export interface LogOptions {
    timestamp?: boolean;
    level?: boolean;
    color?: boolean;
}

export default interface LoggerInterface {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warning(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    setOptions(options: LogOptions): void;
    getOptions(): LogOptions;
}
