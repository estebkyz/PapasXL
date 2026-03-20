import { CONFIG } from './config.js';
import { TEXTO, RESPUESTA_TIPO } from './messages.js';
import { getSesion, resetSesion } from './session.js';
import { estadoNegocio, tipoMensaje, extraerTexto } from './utils.js';

export function procesarMensaje(msg, jid) {
    const tipo = tipoMensaje(msg);
    const texto = extraerTexto(msg);
    const t = texto.toLowerCase().trim();
    const sesion = getSesion(jid);
    sesion.ultimaActividad = Date.now();

    if (texto.length > CONFIG.maxLongitudMensaje) {
        if (sesion.estado === 'esperando_pedido') {
            resetSesion(jid);
            return TEXTO.pedidoRecibido();
        }
        return `Ese mensaje es muy largo 😅 Escribe *hola* para ver el menú.`;
    }

    if (tipo !== 'texto') {
        const fn = RESPUESTA_TIPO[tipo];
        if (fn === null) return null;
        return fn ? fn() : RESPUESTA_TIPO.desconocido();
    }

    const estado = estadoNegocio();
    if (!estado.abierto && sesion.estado === 'inicio') return TEXTO.fueraDeHorario();
    if (estado.ocupado) return TEXTO.ocupado();
    if (sesion.estado === 'esperando_pedido') {
        resetSesion(jid);
        return TEXTO.pedidoRecibido();
    }

    const triggerSaludo = ['hola', 'buenas', 'buenos', 'buen dia', 'buen día', 'hey', 'ola',
        'saludos', 'hi', 'buenas noches', 'buenas tardes', 'buenos días', 'inicio'];
    if (triggerSaludo.some(s => t.includes(s)) || t === '') {
        resetSesion(jid);
        return TEXTO.menuOpciones();
    }

    if (t === '1' || /^(menu|menú|carta|combos|que tienen|qué tienen)/.test(t))
        return TEXTO.menuCompleto();

    if (t === '2' || /^(horario|hora|abren|cierran|atienden)/.test(t))
        return TEXTO.horarios();

    if (t === '3' || /^(ubicaci[oó]n|direcci[oó]n|d[oó]nde|como llegar|mapa)/.test(t))
        return TEXTO.ubicacion();

    if (t === '4' || /pedido|pedir|pido|quiero|ordenar|orden|domicilio|llevar|comprar/.test(t)) {
        sesion.estado = 'esperando_pedido';
        return TEXTO.formularioPedido();
    }

    return TEXTO.noEntiendo();
}