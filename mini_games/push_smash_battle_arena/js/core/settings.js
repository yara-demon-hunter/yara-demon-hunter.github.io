import { SETTINGS_DEFAULTS, SETTINGS_STORAGE_KEY } from '../../data_model/controls.js';

// --- CONFIGURAÇÕES (salvas no navegador) ---
export const settings = { ...SETTINGS_DEFAULTS };
try { Object.assign(settings, JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}')); } catch (e) {}
export function saveSettings() {
    try { localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings)); } catch (e) {}
}
