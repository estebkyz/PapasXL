import { CONFIG } from './config.js';
import { MENU } from './menu.js';
import { horarioFormateado, proximaApertura } from './utils.js';

export const RESPUESTA_TIPO = {
    audio: () => `🎙️ Solo podemos responder mensajes de texto. Escríbenos lo que necesitas 👇`,
    imagen: () => `📸 Solo podemos responder mensajes de texto. Escríbenos 👇`,
    video: () => `🎥 Solo podemos responder mensajes de texto. Escríbenos 👇`,
    sticker: () => `Solo podemos responder mensajes de texto. Escríbenos 👇`,
    documento: () => `📄 Solo podemos responder mensajes de texto. Escríbenos 👇`,
    contacto: () => `👤 Solo podemos responder mensajes de texto. Escríbenos 👇`,
    ubicacion: () => `📍 Solo podemos responder mensajes de texto. Escríbenos 👇`,
    reaccion: null,
    encuesta: null,
    desconocido: () => `No pudimos leer ese mensaje 😕 Escribe *hola* para ver el menú.`,
};

export const TEXTO = {
    menuOpciones: () =>
        `¡Hola! 👋 Bienvenido a *Papas XL* 🍟🔥

¿En qué te puedo ayudar?

*1️⃣* — Ver el Menú
*2️⃣* — Horarios de atención
*3️⃣* — Cómo llegar
*4️⃣* — Hacer un pedido 🛒

Responde con el número 👇`,

    menuCompleto: () => {
        const combosTexto = MENU.combos.map(c =>
            `*${c.nombre}* — ${c.precio}\n_${c.desc}_`
        ).join('\n\n');

        const salsasCasa = MENU.salsasCasa.map(s => `• ${s}`).join('\n');
        const salsasBase = MENU.salsasBase.map(s => `• ${s}`).join('\n');
        const bebidas = MENU.bebidas.map(b => `• ${b}`).join('\n');

        return (
            `📋 *MENÚ PAPAS XL* 🍟
${'─'.repeat(28)}

${combosTexto}

${'─'.repeat(28)}
🧴 *SALSAS DE LA CASA:*
${salsasCasa}

🧴 *SALSAS CLÁSICAS:*
${salsasBase}

🥤 *BEBIDAS:*
${bebidas}

${'─'.repeat(28)}
Escribe *4* o *pedido* cuando estés listo 🙌`
        );
    },

    formularioPedido: () =>
        `Para agilizar tu pedido envía la siguiente información ⤵️

   🍟 ¿Qué combo deseas?
   🧴 ¿Qué salsas?
   📍 ¿Para dónde? _(Por favor dar referencias exactas)_
   💵 ¿Devuelta de cuánto?
   🥤 ¿Alguna bebida?
   #️⃣ Número telefónico que contesten

*Nota:* por favor mandar todo en un mismo mensaje 🙏`,
    pedidoRecibido: () =>
        `✅ *¡Pedido recibido!*

En un momento lo confirmamos y te decimos el tiempo de espera ⏰

¡Gracias por pedir en *Papas XL*! 🍟🔥`,

    fueraDeHorario: () =>
        `😴 ¡Hola! Por el momento estamos *fuera de horario*.

⏰ Volvemos ${proximaApertura()}.

📋 *Horarios de atención:*
${horarioFormateado()}

💬 Cuando abramos te atendemos con gusto 🙏
📸 ${CONFIG.instagram}`,

    ocupado: () =>
        `🔴 Estamos muy ocupados en este momento.
⏳ Te respondemos lo antes posible.
📲 O llámanos: *${CONFIG.telefono}*`,

    horarios: () =>
        `⏰ *Horarios de atención*
${'─'.repeat(28)}
${horarioFormateado()}

🛵 Tiempo estimado de entrega: *${CONFIG.tiempoEspera}*`,

    ubicacion: () =>
        `📍 *¿Dónde encontrarnos?*
${'─'.repeat(28)}
🏠 ${CONFIG.direccion}
📌 ${CONFIG.referencia}
🗺️ ${CONFIG.maps}`,

    noEntiendo: () =>
        `No entendí bien 😅

Responde con el número de la opción:
*1️⃣* — Ver el Menú
*2️⃣* — Horarios
*3️⃣* — Cómo llegar
*4️⃣* — Hacer un pedido

O escribe *hola* para empezar de nuevo.`,
};
