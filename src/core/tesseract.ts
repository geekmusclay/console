import fs from "fs";

import TesseractConfigInterface from "../interfaces/TesseractConfigInterface";
import ArgumentMapInterface from "../interfaces/ArgumentMapInterface";

export default class Tesseract {
    root: string | null = null;
    command: string | null = null;
    config: TesseractConfigInterface | null = null;
    hooks: { [key: string]: () => void } | null = null;

    constructor(
        root: string = "./tesseract.json",
        config: TesseractConfigInterface | null = null,
        hooks: { [key: string]: () => void } | null = null
    ) {
        this.root = root;
        this.config = config;
        this.hooks = hooks;
    }

    hook(key: string, callback: () => void): Tesseract {
        if (null === this.hooks) {
            this.hooks = {};
        }
        this.hooks[key] = callback;

        return this;
    }

    load(): Tesseract {

        if (null !== this.hooks && null !== this.hooks['beforeAll']) {
            this.hooks['beforeAll']();
        }

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
            throw new Error(`Command ${this.command} does not exist.`);
        }

        this.config = config;

        return this;
    }

    handle(): Tesseract {
        if (null === this.config) {
            throw new Error(`No configuration loaded.`);
        }

        if (null === this.command) {
            throw new Error(`No command provided.`);
        }

        if (!this.config.commands[this.command]) {
            throw new Error(`Command ${this.command} does not exist.`);
        }
        let commandConfig = this.config.commands[this.command];

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

        return this;
    }
}
