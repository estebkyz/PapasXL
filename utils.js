import { CONFIG } from './config.js';

export function ahoraEnNegocio() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: CONFIG.timezone }));
}

export function esFestivo(fecha = ahoraEnNegocio()) {
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return CONFIG.festivos.includes(`${mm}-${dd}`);
}

export function estadoNegocio() {
    if (CONFIG.estadoManual !== 'auto') {
        return { abierto: CONFIG.estadoManual === 'abierto', ocupado: CONFIG.estadoManual === 'ocupado' };
    }
    const ahora = ahoraEnNegocio();
    const horaDia = CONFIG.horario[ahora.getDay()];
    const horaActual = ahora.getHours() + ahora.getMinutes() / 60;
    const festivo = esFestivo(ahora);
    if (festivo || !horaDia) return { abierto: false, ocupado: false, esFestivo: festivo };
    
    const abreDec = timeToDecimal(horaDia.abre);
    const cierraDec = timeToDecimal(horaDia.cierra);
    return { abierto: horaActual >= abreDec && horaActual < cierraDec, ocupado: false };
}

export function timeToDecimal(timeStr) {
    if (typeof timeStr === 'number') return timeStr;
    const cleanStr = String(timeStr).toLowerCase().replace(/\s+/g, '');
    const isPM = cleanStr.includes('pm');
    const isAM = cleanStr.includes('am');
    const match = cleanStr.match(/(\d+):?(\d*)/);
    if (!match) return 0;
    let hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    if (isPM && hours !== 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return hours + (minutes / 60);
}

export function proximaApertura() {
    const ahora = ahoraEnNegocio();
    for (let i = 1; i <= 7; i++) {
        const dia = new Date(ahora);
        dia.setDate(dia.getDate() + i);
        const h = CONFIG.horario[dia.getDay()];
        if (h) {
            const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            return i === 1 ? `mañana a las ${h.abre}` : `el ${dias[dia.getDay()]} a las ${h.abre}`;
        }
    }
    return 'próximamente';
}

export function horarioFormateado() {
    const nombres = ['Domingos', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábados'];
    const iconos = ['🟡', '🟢', '🟢', '🟢', '🟢', '🟢', '🟢'];
    return [1, 2, 3, 4, 5, 6, 0].map(d => {
        const h = CONFIG.horario[d];
        return h ? `${iconos[d]} ${nombres[d]}: ${h.abre} – ${h.cierra}`
            : `🔴 ${nombres[d]}: Cerrado`;
    }).join('\n');
}

export function tipoMensaje(msg) {
    const m = msg.message;
    if (!m) return 'desconocido';
    if (m.conversation || m.extendedTextMessage) return 'texto';
    if (m.audioMessage) return 'audio';
    if (m.imageMessage) return 'imagen';
    if (m.videoMessage) return 'video';
    if (m.stickerMessage) return 'sticker';
    if (m.documentMessage) return 'documento';
    if (m.contactMessage || m.contactsArrayMessage) return 'contacto';
    if (m.locationMessage) return 'ubicacion';
    if (m.reactionMessage) return 'reaccion';
    if (m.pollCreationMessage || m.pollUpdateMessage) return 'encuesta';
    return 'desconocido';
}

export function extraerTexto(msg) {
    const m = msg.message;
    return (m?.conversation || m?.extendedTextMessage?.text ||
        m?.imageMessage?.caption || m?.videoMessage?.caption || '').trim();
}

export function esBroadcast(msg) {
    return msg.key?.remoteJid === 'status@broadcast' || msg.key?.remoteJid?.endsWith('@broadcast');
}

export function esGrupo(jid) { return jid?.endsWith('@g.us'); }

export function log(msg) {
    const hora = new Date().toLocaleTimeString('es-CO', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZone: CONFIG.timezone,
    });
    console.log(`[${hora}] ${msg}`);
}
