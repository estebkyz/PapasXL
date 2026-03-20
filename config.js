export const CONFIG = {
    nombre: 'Papas XL',
    telefono: '3133721646',
    direccion: 'Calle 18 # 19-10',
    referencia: 'Frente a la panadería la espiga',
    maps: 'https://maps.app.goo.gl/TULINK',
    instagram: 'https://instagram.com/papasxl.co',
    tiempoEspera: '15 a 25 minutos',
    timezone: 'America/Bogota',

    horario: {
        1: { abre: '11:00 am', cierra: '10:00 pm' }, // Lunes
        2: { abre: '11:00 am', cierra: '10:00 pm' }, // Martes
        3: { abre: '11:00 am', cierra: '10:00 pm' }, // Miércoles
        4: { abre: '11:00 am', cierra: '10:00 pm' }, // Jueves
        5: { abre: '11:00 am', cierra: '11:00 pm' }, // Viernes
        6: { abre: '11:00 am', cierra: '11:00 pm' }, // Sábado
        0: { abre: '12:00 pm', cierra: '09:00 pm' }, // Domingo
    },

    festivos: [
        '01-01', '01-12', '03-23', '04-02', '04-03', '05-01',
        '05-18', '06-08', '06-15', '06-29', '07-20', '08-07',
        '08-17', '10-12', '11-02', '11-16', '12-08', '12-25',
    ],

    maxLongitudMensaje: 500,
    delayLectura: [1000, 3000], // Rango de tiempo para "leer" el mensaje
    delayEscrituraPorLetra: [50, 100], // Ms por cada letra del mensaje
    sessionTimeout: 15 * 60 * 1000,

    // 'auto' | 'abierto' | 'cerrado' | 'ocupado'
    estadoManual: 'auto',
};
