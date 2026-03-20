import { CONFIG } from './config.js';
import { log } from './utils.js';

export const sesiones = new Map();
export const ultimaRespuesta = new Map();
export const COOLDOWN_MS = 1200;

export function getSesion(jid) {
    if (!sesiones.has(jid)) {
        sesiones.set(jid, {
            estado: 'inicio',
            ultimaActividad: Date.now(),
        });
    }
    return sesiones.get(jid);
}

export function resetSesion(jid) { sesiones.delete(jid); }

setInterval(() => {
    const ahora = Date.now();
    for (const [jid, s] of sesiones.entries()) {
        if (ahora - s.ultimaActividad > CONFIG.sessionTimeout) {
            sesiones.delete(jid);
            log(`🗑️  Sesión expirada: ${jid.split('@')[0]}`);
        }
    }
}, 5 * 60 * 1000);
