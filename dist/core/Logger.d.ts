import LoggerInterface, { LogOptions } from '../interfaces/LoggerInterface';
export default class ConsoleLogger implements LoggerInterface {
    private options;
    constructor(options?: LogOptions);
    private formatMessage;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warning(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    setOptions(options: LogOptions): void;
    getOptions(): LogOptions;
}
