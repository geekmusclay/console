# Tesseract - @geekmusclay/console

A flexible console management system for JavaScript applications.

## Installation
To install this package use : 
```bash
npm install https://github.com/geekmusclay/console
```

## Usage

### Defining config
This is an example configuration file : 
```json
{
    "root": "./tesseract",
    "commands": {
        "page": {
            "params": [
                "name"
            ],
            "dir": [
                "./src/pages"
            ],
            "files": [
                {
                    "from": "./tesseract/Page.vue",
                    "to": "./src/pages/{name}Page.vue"
                }
            ]
        },
        "component": {
            "params": [
                "name"
            ],
            "dir": [
                "./src/components",
                "./test/components"
            ],
            "files": [
                {
                    "from": "./tesseract/Component.vue",
                    "to": "./src/components/{name}component.vue"
                }
            ]
        }
    }
}
```

### In Node.js (CommonJS)
```javascript
import { Tesseract } from '../src';

const terminal = new Tesseract('./tesseract.json');

// Hook exécuté avant toute opération
terminal.hook('beforeAll', () => {
    console.log('Starting command execution...');
});

// Hook exécuté après toute opération
terminal.hook('afterAll', () => {
    console.log('Command execution completed.');
});

// Hook exécuté avant l'exécution d'une commande spécifique
terminal.hook('beforeCommand', (command, config) => {
    console.log(`Executing command: ${command}`);
    console.log('Command configuration:', config);
});

// Hook exécuté après l'exécution d'une commande spécifique
terminal.hook('afterCommand', (command) => {
    console.log(`Command ${command} executed successfully.`);
});

// Hook exécuté en cas d'erreur
terminal.hook('onError', (error) => {
    console.error('An error occurred:', error.message);
});

// Exécution asynchrone
async function run() {
    try {
        await terminal.load();
        await terminal.handle();
    } catch (error) {
        console.error('Failed to execute command:', error);
    }
}

run();
```

### In ES Modules
```javascript
import { Tesseract } from '@geekmusclay/console';

const terminal = new Tesseract('./config.json');
terminal.hook('beforeAll', () => {
    console.log('beforeAll');
});

terminal.load().handle();
```

### In Browser (UMD)
```html
<script src="node_modules/@geekmusclay/console/dist/index.umd.js"></script>
<script>
    const terminal = new GeekmusclayCLI.Tesseract('./config.json');
    terminal.hook('beforeAll', () => {
        console.log('beforeAll');
    });

    terminal.load().handle();
</script>
```

## License

MIT