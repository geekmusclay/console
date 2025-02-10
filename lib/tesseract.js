"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
Object.defineProperty(String.prototype, "capitalize", {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false,
});
const path = "./tesseract.json";
if (false === fs_1.default.existsSync(path)) {
    throw new Error("This project does not use tesseract.");
}
if (process.argv.length < 3) {
    throw new Error("No arguments provided.");
}
let command = process.argv[2];
const config = JSON.parse(fs_1.default.readFileSync(path).toString());
if (!config.commands[command]) {
    throw new Error(`Command ${command} does not exist.`);
}
let commandConfig = config.commands[command];
const paramsConfig = commandConfig.params;
const params = {};
for (let i = 0; i < paramsConfig.length; i++) {
    if (process.argv[i + 3] === undefined || paramsConfig[i] === undefined) {
        throw new Error(`Parameter ${paramsConfig[i]} not provided.`);
    }
    params[paramsConfig[i]] = process.argv[i + 3];
}
const dirs = commandConfig.dir;
// Check for directory existance, and create if it doesn't
for (let i = 0; i < dirs.length; i++) {
    if (false === fs_1.default.existsSync(dirs[i])) {
        fs_1.default.mkdirSync(dirs[i], { recursive: true });
    }
}
const files = commandConfig.files;
// Copy each file to the correct location
for (let i = 0; i < files.length; i++) {
    const from = files[i].from;
    let to = files[i].to;
    let file = fs_1.default.readFileSync(from).toString();
    for (const [key, value] of Object.entries(params)) {
        to = to.replace(`{${key}}`, value);
        file = file.toString().replace(`{${key}}`, value);
    }
    fs_1.default.writeFileSync(to, file);
}
