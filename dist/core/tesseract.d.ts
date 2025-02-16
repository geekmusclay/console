import TesseractConfigInterface from "../interfaces/TesseractConfigInterface";
export default class Tesseract {
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
