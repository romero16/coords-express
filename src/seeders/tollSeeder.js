const fs = require('fs');
const path = require('path');

require('dotenv').config();

const TollRoad = require('../models/tollsModel');

const FILE_PATH = path.join(__dirname, '../data/toll_roads.json');

async function main() {

    if (!fs.existsSync(FILE_PATH)) {
        console.error('❌ No se encontró toll_roads.json');
        process.exit(1);
    }

    const rawData = fs.readFileSync(FILE_PATH, 'utf8');
    const data = JSON.parse(rawData);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of data) {
        const via = item.via;
        const coords = item.coordinates || null;

        const hasValidCoords = Array.isArray(coords) &&
            coords.length === 2 &&
            typeof coords[0] === 'number' &&
            typeof coords[1] === 'number';

        const payload = {
            via,
            long_km: item.long_km || null,
            vigente_desde: item.vigente_desde || null,
            precio_motos: item.precio_motos || null,
            precio_autos: item.precio_autos || null,
            precio_autobuses_2_ejes: item.precio_autobuses_2_ejes || null,
            precio_autobuses_3_ejes: item.precio_autobuses_3_ejes || null,
            precio_autobuses_4_ejes: item.precio_autobuses_4_ejes || null,
            precio_camiones_2_ejes: item.precio_camiones_2_ejes || null,
            precio_camiones_3_ejes: item.precio_camiones_3_ejes || null,
            precio_camiones_4_ejes: item.precio_camiones_4_ejes || null,
            precio_camiones_5_ejes: item.precio_camiones_5_ejes || null,
            precio_camiones_6_ejes: item.precio_camiones_6_ejes || null,
            precio_camiones_7_ejes: item.precio_camiones_7_ejes || null,
            precio_camiones_8_ejes: item.precio_camiones_8_ejes || null,
            precio_camiones_9_ejes: item.precio_camiones_9_ejes || null,
        };

        if (hasValidCoords) {
            payload.location = {
                type: 'Point',
                coordinates: coords,
            };
        }

        try {
            const existing = await TollRoad.findOne({ via });

            const newDate = item.vigente_desde ? new Date(item.vigente_desde) : null;
            const existingDate = existing?.vigente_desde;

            if (existing) {
                if (newDate && (!existingDate || newDate > existingDate)) {
                    payload.updated_at = new Date();
                    await TollRoad.updateOne({ via }, payload);
                    console.log(`🔄 Actualizado: ${via}`);
                    updated++;
                } else {
                    console.log(`⏩ Omitido (sin cambios): ${via}`);
                    skipped++;
                }
            } else {
                const toll = new TollRoad(payload);
                await toll.save();
                console.log(`✅ Insertado: ${via}`);
                inserted++;
            }

        } catch (err) {
            console.error(`❌ Error con ${via}: ${err.message}`);
        }
    }

    console.log(`\n✅ Completado: ${inserted} insertados, ${updated} actualizados, ${skipped} omitidos`);
}

main();
