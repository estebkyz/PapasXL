import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import QRCode from 'qrcode';
import express from 'express';

import { CONFIG } from './config.js';
import { log, esBroadcast, esGrupo, tipoMensaje, extraerTexto, estadoNegocio } from './utils.js';
import { procesarMensaje } from './handler.js';
import { ultimaRespuesta, COOLDOWN_MS } from './session.js';

const app = express();
const PORT = process.env.PORT || 3000;
let qrBase64 = null;
let botListo = false;

app.get('/', (req, res) => {
    if (botListo) {
        return res.send(`
            <html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#111;color:#fff">
                <h1 style="color:#25d366">✅ Bot Papas XL conectado</h1>
                <p>El bot está activo y respondiendo mensajes 🍟</p>
            </body></html>
        `);
    }
    if (!qrBase64) {
        return res.send(`
            <html>
            <head><meta http-equiv="refresh" content="3"></head>
            <body style="font-family:sans-serif;text-align:center;padding:40px;background:#111;color:#fff">
                <h2>⏳ Generando QR...</h2>
                <p>Esta página se actualiza sola, espera unos segundos.</p>
            </body></html>
        `);
    }
    res.send(`
        <html>
        <head><meta http-equiv="refresh" content="30"></head>
        <body style="font-family:sans-serif;text-align:center;padding:40px;background:#111;color:#fff">
            <h1 style="color:#F5C800">📱 Escanea este QR con WhatsApp</h1>
            <p style="color:#aaa">WhatsApp → ⋮ → Dispositivos vinculados → Vincular dispositivo</p>
            <img src="${qrBase64}" style="border-radius:12px;max-width:300px;margin:24px auto;display:block"/>
            <p style="color:#555;font-size:12px">El QR expira en 60s — la página se recarga sola</p>
        </body></html>
    `);
});

app.listen(PORT, '0.0.0.0', () => log(`🌐 Servidor QR activo en puerto ${PORT}`));

async function startBot() {
    const { version } = await fetchLatestBaileysVersion();
    log(`✅ WhatsApp Web v${version.join('.')}`);

    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        browser: ['Papas XL Bot', 'Chrome', '1.0.0'],
        logger: {
            level: 'silent',
            info: () => { }, warn: () => { }, error: () => { }, debug: () => { }, trace: () => { }, fatal: () => { },
            child: () => ({
                level: 'silent', info: () => { }, warn: () => { }, error: () => { },
                debug: () => { }, trace: () => { }, fatal: () => { }, child: () => ({})
            }),
        },
    });

    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            qrcode.generate(qr, { small: true });
            try {
                qrBase64 = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
                log(`📱 QR listo — ábrelo en tu URL de Railway para escanearlo`);
            } catch (e) {
                log(`⚠️  Error generando imagen QR: ${e.message}`);
            }
        }
        if (connection === 'open') {
            botListo = true;
            qrBase64 = null;
            const e = estadoNegocio();
            log(`🟢 Bot Papas XL conectado — ${e.abierto ? '🟢 Abierto' : '🔴 Cerrado'}`);
            console.log('─'.repeat(50));
        }
        if (connection === 'close') {
            botListo = false;
            const code = lastDisconnect?.error?.output?.statusCode;
            const reconectar = code !== DisconnectReason.loggedOut;
            if (reconectar) {
                log(`⚠️  Reconectando en 3s... (código ${code})`);
                setTimeout(startBot, 3000);
            } else {
                log('🔴 Sesión cerrada. Borra auth_info y escanea el QR.');
                process.exit(0);
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            try {
                if (!msg.message) continue;
                if (msg.key.fromMe) continue;
                if (esBroadcast(msg)) continue;
                if (esGrupo(msg.key.remoteJid)) continue;

                const jid = msg.key.remoteJid;
                const ahora = Date.now();

                if (ultimaRespuesta.has(jid) && ahora - ultimaRespuesta.get(jid) < COOLDOWN_MS) continue;
                ultimaRespuesta.set(jid, ahora);

                const texto = extraerTexto(msg);
                const tipo = tipoMensaje(msg);
                const respuesta = procesarMensaje(msg, jid);

                if (respuesta === null) continue;

                await new Promise(r => setTimeout(r, CONFIG.delayRespuesta));
                await sock.sendMessage(jid, { text: respuesta });

                log(`📨 ${jid.split('@')[0]} [${tipo}] → "${texto.slice(0, 40)}${texto.length > 40 ? '…' : ''}"`);

            } catch (err) {
                log(`❌ Error: ${err.message}`);
            }
        }
    });
}

process.on('uncaughtException', err => log(`❌ uncaughtException: ${err.message}`));
process.on('unhandledRejection', err => log(`❌ unhandledRejection: ${err?.message || err}`));

startBot();