import { Tesseract } from '../src';

const terminal = new Tesseract('./tesseract.json');

// Hook global (s'exécute pour toutes les commandes)
terminal.hook('beforeAll', () => {
    console.log('Démarrage de l\'exécution...');
});

// Hook spécifique à la commande "create"
terminal.hook('beforeCommand', (command, config) => {
    console.log(`Préparation de la création du projet: ${config.name}`);
}, 'create');

// Hook spécifique à la commande "build"
terminal.hook('beforeCommand', (command, config) => {
    console.log(`Démarrage de la compilation du projet...`);
}, 'build');

// Hook global pour les erreurs
terminal.hook('onError', (error) => {
    console.error('Une erreur est survenue:', error);
});

// Hook spécifique pour les erreurs de la commande "build"
terminal.hook('onError', (error) => {
    console.error('Erreur de compilation:', error);
    console.error('Vérifiez votre configuration de build');
}, 'build');

// Exécution asynchrone
async function run() {
    try {
        await terminal.load();
        await terminal.handle();
    } catch (error) {
        console.error('Échec de l\'exécution:', error);
    }
}

run();
