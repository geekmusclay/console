import fs from 'fs';

const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m' // Red
};
class ConsoleLogger {
    constructor(options) {
        this.options = {
            timestamp: true,
            level: true,
            color: true
        };
        if (options) {
            this.options = { ...this.options, ...options };
        }
    }
    formatMessage(level, message, args) {
        let formattedMessage = '';
        // Add timestamp if enabled
        if (this.options.timestamp) {
            formattedMessage += `${this.options.color ? COLORS.dim : ''}[${new Date().toISOString()}]${this.options.color ? COLORS.reset : ''} `;
        }
        // Add log level if enabled
        if (this.options.level) {
            const levelColor = this.options.color ? COLORS[level] : '';
            const levelText = level.toUpperCase().padEnd(7);
            formattedMessage += `${levelColor}${COLORS.bright}${levelText}${COLORS.reset} `;
        }
        // Add message
        formattedMessage += message;
        // Add additional arguments if present
        if (args.length > 0) {
            formattedMessage += ' ';
            args.forEach(arg => {
                if (typeof arg === 'object') {
                    formattedMessage += JSON.stringify(arg, null, 2);
                }
                else {
                    formattedMessage += arg.toString();
                }
            });
        }
        return formattedMessage;
    }
    debug(message, ...args) {
        console.debug(this.formatMessage('debug', message, args));
    }
    info(message, ...args) {
        console.info(this.formatMessage('info', message, args));
    }
    warning(message, ...args) {
        console.warn(this.formatMessage('warning', message, args));
    }
    error(message, ...args) {
        console.error(this.formatMessage('error', message, args));
    }
    setOptions(options) {
        this.options = { ...this.options, ...options };
    }
    getOptions() {
        return { ...this.options };
    }
}

class Tesseract {
    constructor(root = "./tesseract.json", config = null, logger) {
        this.root = null;
        this.command = null;
        this.config = null;
        this.hooks = {
            beforeAll: [],
            afterAll: [],
            beforeCommand: [],
            afterCommand: [],
            onError: []
        };
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
    hook(event, callback, command) {
        if (this.hooks[event]) {
            const hookConfig = {
                callback,
                command
            };
            this.hooks[event].push(hookConfig);
            this.logger.debug(command
                ? `Added hook for event: ${event} on command: ${command}`
                : `Added hook for event: ${event} (global)`);
        }
        return this;
    }
    /**
     * Execute hooks for a specific event
     * @param event The event to execute hooks for
     * @param args Arguments to pass to the hooks
     */
    async executeHooks(event, ...args) {
        const hooks = this.hooks[event];
        if (hooks && hooks.length > 0) {
            const currentCommand = this.command;
            const relevantHooks = hooks.filter(hook => !hook.command || hook.command === currentCommand);
            if (relevantHooks.length > 0) {
                this.logger.debug(`Executing ${relevantHooks.length} hooks for event: ${event}` +
                    (currentCommand ? ` on command: ${currentCommand}` : ' (global)'));
                for (const hook of relevantHooks) {
                    try {
                        await hook.callback(...args);
                    }
                    catch (error) {
                        this.logger.error(`Error executing ${event} hook` +
                            (hook.command ? ` for command ${hook.command}` : ''), error);
                        await this.executeHooks('onError', error);
                    }
                }
            }
        }
    }
    async load() {
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
            const config = JSON.parse(fs.readFileSync(this.root).toString());
            if (!config.commands[this.command]) {
                throw new Error(`Command "${this.command}" not found.`);
            }
            this.config = config;
            this.logger.info('Configuration loaded successfully');
            return this;
        }
        catch (error) {
            this.logger.error('Failed to load Tesseract:', error);
            await this.executeHooks('onError', error);
            throw error;
        }
    }
    async handle() {
        try {
            if (null === this.config || null === this.command) {
                throw new Error("Tesseract not loaded.");
            }
            const commandConfig = this.config.commands[this.command];
            this.logger.info(`Executing command: ${this.command}`);
            this.logger.debug('Command configuration:', commandConfig);
            await this.executeHooks('beforeCommand', this.command, commandConfig);
            // Parse parameters
            const paramsConfig = commandConfig.params;
            const params = {};
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
        }
        catch (error) {
            this.logger.error(`Command ${this.command} failed:`, error);
            await this.executeHooks('onError', error);
            throw error;
        }
    }
    /**
     * Get the logger instance
     */
    getLogger() {
        return this.logger;
    }
    /**
     * Set a custom logger
     */
    setLogger(logger) {
        this.logger = logger;
    }
}

export { Tesseract };
//# sourceMappingURL=index.mjs.map
