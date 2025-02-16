# Tesseract - @geekmusclay/console

A flexible console management system for JavaScript applications.

## Installation
To install this package use : 
```bash
npm install https://github.com/geekmusclay/console
```
In the future maybe : 
```bash
npm install @geekmusclay/console
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
const { Tesseract } = require('@geekmusclay/console');

const terminal = new Tesseract('./config.json');
terminal.hook('beforeAll', () => {
    console.log('beforeAll');
});

terminal.load().handle();
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