import fs from "fs";

import TesseractConfigInterface from "../interfaces/TesseractConfigInterface";
import ArgumentMapInterface from "../interfaces/ArgumentMapInterface";
import CommandHooksInterface, { CommandHook, HookConfig } from "../interfaces/CommandHooksInterface";
import LoggerInterface from "../interfaces/LoggerInterface";
import ConsoleLogger from "./Logger";
import { exit } from "process";

export default class Tesseract {
    root: string | null = null;
    command: string | null = null;
    config: TesseractConfigInterface | null = null;
    hooks: CommandHooksInterface = {
        beforeAll: [],
        afterAll: [],
        beforeCommand: [],
        afterCommand: [],
        onError: []
    };
    private logger: LoggerInterface;

    constructor(
        root: string = "./tesseract.json",
        config: TesseractConfigInterface | null = null,
        logger?: LoggerInterface
    ) {
        this.root = root;
        this.config = config;
        this.logger = logger || new ConsoleLogger();
    }

    /**
     * Add a hook for a specific event
     * @param event The event to hook into ('beforeAll', 'afterAll', 'beforeCommand', 'afterCommand', 'onError')
     * @param callback The callback function to execute
     * @param command Optional command name to restrict the hook to
     */
    hook(event: keyof CommandHooksInterface, callback: CommandHook, command?: string): Tesseract {
        if (this.hooks[event]) {
            const hookConfig: HookConfig = {
                callback,
                command
            };
            this.hooks[event]!.push(hookConfig);
            this.logger.debug(
                command 
                    ? `Added hook for event: ${event} on command: ${command}`
                    : `Added hook for event: ${event} (global)`
            );
        }
        return this;
    }

    /**
     * Execute hooks for a specific event
     * @param event The event to execute hooks for
     * @param args Arguments to pass to the hooks
     */
    private async executeHooks(event: keyof CommandHooksInterface, ...args: any[]): Promise<void> {
        const hooks = this.hooks[event];
        if (hooks && hooks.length > 0) {
            const currentCommand = this.command;
            const relevantHooks = hooks.filter(hook => 
                !hook.command || hook.command === currentCommand
            );

            if (relevantHooks.length > 0) {
                this.logger.debug(
                    `Executing ${relevantHooks.length} hooks for event: ${event}` +
                    (currentCommand ? ` on command: ${currentCommand}` : ' (global)')
                );

                for (const hook of relevantHooks) {
                    try {
                        await hook.callback(...args);
                    } catch (error) {
                        this.logger.error(
                            `Error executing ${event} hook` +
                            (hook.command ? ` for command ${hook.command}` : ''),
                            error
                        );
                        await this.executeHooks('onError', error);
                    }
                }
            }
        }
    }

    async load(): Promise<Tesseract> {
        try {
            this.logger.info('Loading Tesseract configuration...');
            await this.executeHooks('beforeAll');

            if (null === this.root) {
                throw new Error("Tesseract root not set.");
            }

            if (false === fs.existsSync(this.root)) {
                throw new Error("This project does not use tesseract.");
            }

            if (process.argv.length < 3) {
                throw new Error("No arguments provided.");
            }

            this.command = process.argv[2];
            this.logger.info(`Loading command: ${this.command}`);
            
            const config: TesseractConfigInterface = JSON.parse(fs.readFileSync(this.root).toString());
            
            if (!config.commands[this.command]) {
                throw new Error(`Command "${this.command}" not found.`);
            }

            this.config = config;
            this.logger.info('Configuration loaded successfully');
            return this;
        } catch (error) {
            this.logger.error('Failed to load Tesseract:', error);
            await this.executeHooks('onError', error);
            throw error;
        }
    }

    async handle(): Promise<void> {
        try {
            if (null === this.config || null === this.command) {
                throw new Error("Tesseract not loaded.");
            }

            const commandConfig = this.config.commands[this.command];
            this.logger.info(`Executing command: ${this.command}`);
            this.logger.debug('Command configuration:', commandConfig);
            
            await this.executeHooks('beforeCommand', this.command, commandConfig);

            // Parse parameters
            const paramsConfig: string[] = commandConfig.params;
            const params: ArgumentMapInterface = {};
            for (let i = 0; i < paramsConfig.length; i++) {
                if (process.argv[i + 3] === undefined || paramsConfig[i] === undefined) {
                    throw new Error(`Parameter ${paramsConfig[i]} not provided.`);
                }
                params[paramsConfig[i]] = process.argv[i + 3];
                this.logger.debug(`Parameter ${paramsConfig[i]} = ${params[paramsConfig[i]]}`);
            }

            // Create directories
            const dirs = commandConfig.dir;
            for (let i = 0; i < dirs.length; i++) {
                if (false === fs.existsSync(dirs[i])) {
                    this.logger.info(`Creating directory: ${dirs[i]}`);
                    fs.mkdirSync(dirs[i], { recursive: true });
                }
            }

            // Process files
            const files = commandConfig.files;
            for (let i = 0; i < files.length; i++) {
                const from = files[i].from;
                let to = files[i].to;
                this.logger.info(`Processing file: ${from} -> ${to}`);
                
                let file = fs.readFileSync(from).toString();

                for (const [key, value] of Object.entries(params)) {
                    // Handle basic replacement
                    to = to.replace(new RegExp(`{${key}}`, 'g'), value);
                    file = file.replace(new RegExp(`{${key}}`, 'g'), value);

                    // Handle transformations
                    const transformRegex = new RegExp(`{${key}\\|(\\w+)}`, 'g');
                    let match;

                    // Process transformations in the destination path
                    to = to.replace(transformRegex, (_, transform) => {
                        this.logger.debug(`Transforming ${key} with ${transform}`);
                        return this.applyTransformation(value, transform);
                    });
                    this.logger.debug(`Key: ${key}, Value: ${value}`);
                    this.logger.debug(`Transformed path: ${to}`);

                    // Create directories from destination path
                    const path: string = to.split('/').slice(0, -1).join('/');
                    if (false === fs.existsSync(path)) {
                        this.logger.info(`Creating directory: ${path}`);
                        fs.mkdirSync(path, { recursive: true });
                    }

                    // Process transformations in the file content
                    file = file.replace(transformRegex, (_, transform) => this.applyTransformation(value, transform));
                }

                fs.writeFileSync(to, file);
                this.logger.info(`File written successfully: ${to}`);
            }

            await this.executeHooks('afterCommand', this.command, commandConfig);
            this.logger.info(`Command ${this.command} completed successfully`);
            await this.executeHooks('afterAll');
        } catch (error) {
            this.logger.error(`Command ${this.command} failed:`, error);
            await this.executeHooks('onError', error);
            throw error;
        }
    }

    /**
     * Apply a transformation to a value based on the specified transform type.
     * 
     * @param {string} value - The value to transform
     * @param {string} transform - The type of transformation to apply
     * @returns {string} The transformed value
     */
    private applyTransformation(value: string, transform: string): string {
        switch (transform) {
            case 'lower':
                return value.toLowerCase();
            case 'upper':
                return value.toUpperCase();
            case 'capitalize':
                return value.charAt(0).toUpperCase() + value.slice(1);
            case 'snake':
                return value.replace(/ /g, '_');
            case 'camelToSnake':
                return this.camelToSnakeCase(value);
            default:
                return value;
        }
    }

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
    private camelToSnakeCase(camelCaseString: string): string {
        if (!camelCaseString) {
            return '';
        }

        // Conversion de la chaîne avec un underscore avant chaque majuscule
        // puis conversion en minuscule et suppression du premier underscore si présent
        return camelCaseString
            // Ajout d'un underscore avant chaque lettre majuscule 
            .replace(/([A-Z])/g, '_$1')
            // Convertir toute la chaîne en minuscules
            .toLowerCase()
            // Supprimer le premier underscore si la chaîne commençait par une majuscule
            .replace(/^_/, '');
    }

    /**
     * Get the logger instance
     */
    getLogger(): LoggerInterface {
        return this.logger;
    }

    /**
     * Set a custom logger
     */
    setLogger(logger: LoggerInterface): void {
        this.logger = logger;
    }
}
