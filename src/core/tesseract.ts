import fs from "fs";

import TesseractConfigInterface from "../interfaces/TesseractConfigInterface";
import ArgumentMapInterface from "../interfaces/ArgumentMapInterface";
import CommandHooksInterface, { CommandHook } from "../interfaces/CommandHooksInterface";

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

    constructor(
        root: string = "./tesseract.json",
        config: TesseractConfigInterface | null = null
    ) {
        this.root = root;
        this.config = config;
    }

    /**
     * Add a hook for a specific event
     * @param event The event to hook into ('beforeAll', 'afterAll', 'beforeCommand', 'afterCommand', 'onError')
     * @param callback The callback function to execute
     */
    hook(event: keyof CommandHooksInterface, callback: CommandHook): Tesseract {
        if (this.hooks[event]) {
            this.hooks[event]!.push(callback);
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
            for (const hook of hooks) {
                try {
                    await hook(...args);
                } catch (error) {
                    console.error(`Error executing ${event} hook:`, error);
                    await this.executeHooks('onError', error);
                }
            }
        }
    }

    async load(): Promise<Tesseract> {
        try {
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
            const config: TesseractConfigInterface = JSON.parse(fs.readFileSync(this.root).toString());
            
            if (!config.commands[this.command]) {
                throw new Error(`Command "${this.command}" not found.`);
            }

            this.config = config;
            return this;
        } catch (error) {
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
            await this.executeHooks('beforeCommand', this.command, commandConfig);

            // Execute command logic here
            console.log(`Executing command: ${this.command}`);
            console.log('Command config:', commandConfig);

            const paramsConfig: string[] = commandConfig.params;
            const params: ArgumentMapInterface = {};
            for (let i = 0; i < paramsConfig.length; i++) {
                if (process.argv[i + 3] === undefined || paramsConfig[i] === undefined) {
                    throw new Error(`Parameter ${paramsConfig[i]} not provided.`);
                }
                params[paramsConfig[i]] = process.argv[i + 3];
            }

            const dirs = commandConfig.dir;
            // Check for directory existance, and create if it doesn't
            for (let i = 0; i < dirs.length; i++) {
                if (false === fs.existsSync(dirs[i])) {
                    fs.mkdirSync(dirs[i], { recursive: true });
                }
            }

            const files = commandConfig.files;
            // Copy each file to the correct location
            for (let i = 0; i < files.length; i++) {
                const from = files[i].from;
                let to = files[i].to;
                let file = fs.readFileSync(from).toString();

                for (const [key, value] of Object.entries(params)) {
                    to = to.replace(`{${key}}`, value);
                    file = file.toString().replace(`{${key}}`, value);
                }

                fs.writeFileSync(to, file);
            }

            await this.executeHooks('afterCommand', this.command, commandConfig);
            await this.executeHooks('afterAll');
        } catch (error) {
            await this.executeHooks('onError', error);
            throw error;
        }
    }
}
