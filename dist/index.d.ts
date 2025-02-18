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
interface CommandHooksInterface {
    beforeAll?: CommandHook[];
    afterAll?: CommandHook[];
    beforeCommand?: CommandHook[];
    afterCommand?: CommandHook[];
    onError?: CommandHook[];
}

declare class Tesseract {
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

export { Tesseract };
