import { ExtendedClient } from '../index';
import fs from 'fs';
import path from 'path';
import { Event } from '../types';

export const loadEvents = async (client: ExtendedClient) => {
    const eventsPath = path.join(__dirname, '../events');
    if (!fs.existsSync(eventsPath)) fs.mkdirSync(eventsPath, { recursive: true });
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event: Event<any> = (await import(filePath)).default;
        if (event.name && event.execute) {
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
            console.log(`Loaded event: ${event.name}`);
        }
    }
};
