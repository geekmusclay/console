import TesseractConfigInterface from "../interfaces/TesseractConfigInterface";
import CommandHooksInterface, { CommandHook } from "../interfaces/CommandHooksInterface";
export default class Tesseract {
    root: string | null;
    command: string | null;
    config: TesseractConfigInterface | null;
    hooks: CommandHooksInterface;
    constructor(root?: string, config?: TesseractConfigInterface | null);
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
}
