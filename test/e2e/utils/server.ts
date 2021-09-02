import { setConnection } from 'typeorm-seeding';

import {synchronizeDatabase} from '../../utils/database';
import { bootstrapApp } from './bootstrap';

export const prepareServer = async (options?: { migrate: boolean }) => {
    const settings = await bootstrapApp();
    if (options && options.migrate) {
        await synchronizeDatabase(settings.connection);
    }
    setConnection(settings.connection);
    return settings;
};
