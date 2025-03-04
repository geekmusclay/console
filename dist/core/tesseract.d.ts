import TesseractConfigInterface from "../interfaces/TesseractConfigInterface";
import CommandHooksInterface, { CommandHook } from "../interfaces/CommandHooksInterface";
import LoggerInterface from "../interfaces/LoggerInterface";
export default class Tesseract {
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
     */
    hook(event: keyof CommandHooksInterface, callback: CommandHook): Tesseract;
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
