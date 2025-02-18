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
