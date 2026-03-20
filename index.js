import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';

import { CONFIG } from './config.js';
import { log, esBroadcast, esGrupo, tipoMensaje, extraerTexto, estadoNegocio } from './utils.js';
import { procesarMensaje } from './handler.js';
import { ultimaRespuesta, COOLDOWN_MS } from './session.js';

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

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log('\n📱 Escanea este QR en WhatsApp → Dispositivos vinculados:\n');
            qrcode.generate(qr, { small: true });
            console.log('─'.repeat(50));
        }
        if (connection === 'open') {
            const e = estadoNegocio();
            log(`🟢 Bot Papas XL conectado — ${e.abierto ? '🟢 Abierto' : '🔴 Cerrado'}`);
            console.log('─'.repeat(50));
        }
        if (connection === 'close') {
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