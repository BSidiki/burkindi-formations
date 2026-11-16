// Développement local : charge le fichier .env de la racine du dépôt s'il existe.
// En production (Docker), les variables viennent de `env_file` et ce fichier est absent : rien n'est chargé.
import { existsSync } from 'fs';
import { resolve } from 'path';

const file = resolve(__dirname, '../../../.env');
if (existsSync(file) && typeof (process as any).loadEnvFile === 'function') (process as any).loadEnvFile(file);
