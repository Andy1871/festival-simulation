import type { FestivalConfig } from '../types';

export interface SavedConfig {
    id: string;
    name: string;
    savedAt: string;
    config: FestivalConfig;
}

function key(userId: string) {
    return `festival_sim_configs_${userId}`;
}

export function listSavedConfigs(userId: string): SavedConfig[] {
    try { return JSON.parse(localStorage.getItem(key(userId)) ?? '[]'); }
    catch { return []; }
}

export function saveConfig(userId: string, config: FestivalConfig, saveName?: string): SavedConfig {
    const configs = listSavedConfigs(userId);
    const name = (saveName ?? config.name ?? '').trim() || 'Unnamed festival';
    const existingIdx = configs.findIndex(c => c.config.id === config.id);

    // If the name changed on an existing save, branch off as a new independent entry
    const branchOff = existingIdx >= 0 && configs[existingIdx].name !== name;
    const entryId = branchOff ? crypto.randomUUID() : config.id;

    const entry: SavedConfig = {
        id: entryId,
        name,
        savedAt: new Date().toISOString(),
        config: { ...config, id: entryId, name },
    };

    if (existingIdx >= 0 && !branchOff) configs[existingIdx] = entry;
    else configs.push(entry);

    localStorage.setItem(key(userId), JSON.stringify(configs));
    return entry;
}

export function deleteConfig(userId: string, configId: string) {
    const configs = listSavedConfigs(userId).filter(c => c.id !== configId);
    localStorage.setItem(key(userId), JSON.stringify(configs));
}
