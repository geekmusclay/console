"use strict";
import fs from "fs";

Object.defineProperty(String.prototype, "capitalize", {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false,
});

interface TesseractConfig {
    src: string;
    commands: {
        [key: string]: {
            params: string[];
            dir: string[];
            files: {
                from: string;
                to: string;
            }[];
        };
    };
}

interface ArgumentMap {
    [key: string]: string
}

const path: string = "./tesseract.json";
if (false === fs.existsSync(path)) {
    throw new Error("This project does not use tesseract.");
}

if (process.argv.length < 3) {
    throw new Error("No arguments provided.");
}
let command: string = process.argv[2];

const config: TesseractConfig = JSON.parse(fs.readFileSync(path).toString());
if (!config.commands[command]) {
    throw new Error(`Command ${command} does not exist.`);
}

let commandConfig = config.commands[command];

const paramsConfig: string[] = commandConfig.params;
const params: ArgumentMap = {};
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
