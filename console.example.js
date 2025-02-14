const { default: Tesseract } = require('./src/core/tesseract.js');

const terminal = new Tesseract('./tesseract.json');

terminal.hook('beforeAll', () => {
    console.log('beforeAll');
})

try {
    terminal.load().handle();
} catch (error) {
    console.error(error.message);
}
