import { Tesseract } from '../src';
import ConsoleLogger from '../src/core/Logger';

// Créer une instance du logger avec des options personnalisées
const logger = new ConsoleLogger({
    timestamp: true,
    level: true,
    color: true
});

// Créer une instance de Tesseract avec le logger personnalisé
const terminal = new Tesseract('./tesseract.json', null, logger);

// Exemple d'utilisation des différents niveaux de log
logger.debug('Démarrage de l\'application en mode debug');
logger.info('Application prête');
logger.warning('Attention: fichier de configuration non trouvé, utilisation des valeurs par défaut');
logger.error('Erreur lors de l\'exécution de la commande', { code: 500, message: 'Internal Server Error' });

// Désactiver les timestamps dans les logs
logger.setOptions({ timestamp: false });

// Exécution avec hooks et logging
terminal.hook('beforeCommand', (command, config) => {
    logger.info(`Préparation de la commande: ${command}`, config);
});

// Exécution asynchrone
async function run() {
    try {
        await terminal.load();
        await terminal.handle();
    } catch (error) {
        logger.error('Échec de l\'exécution:', error);
    }
}

run();
