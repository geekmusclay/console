interface CommandConfigInterface {
    [key: string]: {
        params: string[];
        dir: string[];
        files: {
            from: string;
            to: string;
        }[];
    };
}

interface TesseractConfigInterface {
    src: string;
    commands: CommandConfigInterface;
}

interface CommandHook {
    (...args: any[]): void | Promise<void>;
}
interface HookConfig {
    callback: CommandHook;
    command?: string;
}
interface CommandHooksInterface {
    beforeAll: HookConfig[];
    afterAll: HookConfig[];
    beforeCommand: HookConfig[];
    afterCommand: HookConfig[];
    onError: HookConfig[];
}

interface LogOptions {
    timestamp?: boolean;
    level?: boolean;
    color?: boolean;
}
interface LoggerInterface {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warning(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    setOptions(options: LogOptions): void;
    getOptions(): LogOptions;
}

declare class Tesseract {
    root: string | null;
    command: string | null;
    config: TesseractConfigInterface | null;
    hooks: CommandHooksInterface;
    private logger;
    constructor(root?: string, config?: TesseractConfigInterface | null, logger?: LoggerInterface);
    /**
     * Add a hook for a specific event
     * @param event The event to hook into ('beforeAll', 'afterAll', 'beforeCommand', 'afterCommand', 'onError')
     * @param callback The callback function to execute
     * @param command Optional command name to restrict the hook to
     */
    hook(event: keyof CommandHooksInterface, callback: CommandHook, command?: string): Tesseract;
    /**
     * Execute hooks for a specific event
     * @param event The event to execute hooks for
     * @param args Arguments to pass to the hooks
     */
    private executeHooks;
    load(): Promise<Tesseract>;
    handle(): Promise<void>;
    /**
     * Get the logger instance
     */
    getLogger(): LoggerInterface;
    /**
     * Set a custom logger
     */
    setLogger(logger: LoggerInterface): void;
}

export { Tesseract };
