import { version } from '../../package.json';

export const environment = {
    production: false,
    environment: 'BETA',
    password: null,
    version: 'dev.' + version
};
