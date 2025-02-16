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

declare class Tesseract {
    root: string | null;
    command: string | null;
    config: TesseractConfigInterface | null;
    hooks: {
        [key: string]: () => void;
    } | null;
    constructor(root?: string, config?: TesseractConfigInterface | null, hooks?: {
        [key: string]: () => void;
    } | null);
    hook(key: string, callback: () => void): Tesseract;
    load(): Tesseract;
    handle(): Tesseract;
}

export { Tesseract };
