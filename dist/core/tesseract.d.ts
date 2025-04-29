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
     * Apply a transformation to a value based on the specified transform type.
     *
     * @param {string} value - The value to transform
     * @param {string} transform - The type of transformation to apply
     * @returns {string} The transformed value
     */
    private applyTransformation;
    /**
     * Convertit une chaîne en format camelCase vers le format snake_case.
     *
     * Cette fonction transforme une chaîne de caractères du format camelCase
     * (ou PascalCase) vers le format snake_case. Par exemple, "coucouLesGens"
     * ou "CoucouLesGens" seront convertis en "coucou_les_gens".
     *
     * @param {string} camelCaseString - La chaîne en format camelCase ou PascalCase à convertir
     * @returns {string} La chaîne convertie en format snake_case
     *
     * @example
     * camelToSnakeCase("helloWorld"); // Retourne "hello_world"
     * camelToSnakeCase("CoucouLesGens"); // Retourne "coucou_les_gens"
     * camelToSnakeCase("ABC"); // Retourne "a_b_c"
     */
    private camelToSnakeCase;
    /**
     * Get the logger instance
     */
    getLogger(): LoggerInterface;
    /**
     * Set a custom logger
     */
    setLogger(logger: LoggerInterface): void;
}
