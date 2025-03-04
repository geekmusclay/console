import fs from "fs";

import TesseractConfigInterface from "../interfaces/TesseractConfigInterface";
import ArgumentMapInterface from "../interfaces/ArgumentMapInterface";
import CommandHooksInterface, { CommandHook } from "../interfaces/CommandHooksInterface";
import LoggerInterface from "../interfaces/LoggerInterface";
import ConsoleLogger from "./Logger";

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
     */
    hook(event: keyof CommandHooksInterface, callback: CommandHook): Tesseract {
        if (this.hooks[event]) {
            this.hooks[event]!.push(callback);
            this.logger.debug(`Added hook for event: ${event}`);
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
            this.logger.debug(`Executing ${hooks.length} hooks for event: ${event}`);
            for (const hook of hooks) {
                try {
                    await hook(...args);
                } catch (error) {
                    this.logger.error(`Error executing ${event} hook:`, error);
                    await this.executeHooks('onError', error);
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
                    to = to.replace(`{${key}}`, value);
                    file = file.toString().replace(`{${key}}`, value);
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
