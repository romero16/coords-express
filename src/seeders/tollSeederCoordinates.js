const fs = require('fs');
const path = require('path');
const axios = require('axios');
const TollRoad = require('../models/tollsModel');
require('dotenv').config();



const FILE_PATH = path.join(__dirname, '../data/toll_manual_coordinates.json');

const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/[^a-z0-9\s\-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const updateTollRoadCoordinatesFromDataMX = async () => {
  try {
    const tolls = await TollRoad.find({
      $or: [
        { location: { $exists: false } },
        { 'location.coordinates': { $eq: undefined } }
      ]
    });

    const response = await axios.get(
      'https://datamx.io/api/3/action/datastore_search?resource_id=2708db87-485b-4e97-8f1f-bea65a7dac1e&limit=1000'
    );

    const records = response.data.result.records;

    // Crear mapa con claves normalizadas del campo "Tramo de cobro"
    const tramoMap = new Map();

    for (const record of records) {
      const key = normalizeText(record['Tramo de cobro'] || '');
      if (
        key &&
        record['Coordenada latitud en grados'] &&
        record['Coordenada longitud en grados']
      ) {
        tramoMap.set(key, record);
      }
    }

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const toll of tolls) {
      const tollKey = normalizeText(toll.via || '');

      const match = tramoMap.get(tollKey);

      if (match) {
        const lat = parseFloat(match['Coordenada latitud en grados']);
        const lng = parseFloat(match['Coordenada longitud en grados']);

        if (!isNaN(lat) && !isNaN(lng)) {
          toll.location = {
            type: 'Point',
            coordinates: [lng, lat],
          };
          await toll.save();
          updatedCount++;
        } else {
          notFoundCount++;
        }
      } else {
        console.log(`❌ Sin coincidencia exacta para: ${toll.via}`);
        notFoundCount++;
      }
    }

    console.log('\n📊 RESUMEN FINAL');
    console.log(`🟢 Actualizados: ${updatedCount}`);
    console.log(`🔴 Sin coincidencia: ${notFoundCount}`);
  } catch (error) {
        console.log(`🔴 Error: ${error}`);
  }
};


const manualCoordinates = async () => {
    if (!fs.existsSync(FILE_PATH)) {
        console.error('❌ No se encontró toll_roads.json');
        process.exit(1);
    }

    const rawData = fs.readFileSync(FILE_PATH, 'utf8');
    const data = JSON.parse(rawData);
    for (const [via, coords] of Object.entries(data)) {
        try {
        const location = {
            type: 'Point',
            coordinates: [coords[1], coords[0]],
        };

        const result = await TollRoad.updateOne(
            { via: via.trim() },
            { $set: { location } }
        );

        if (result.matchedCount > 0) {
            console.log(`✔️ Actualizado: ${via}`);
        } else {
            console.log(`⚠️ No encontrado: ${via}`);
        }
        } catch (err) {
        console.error(`❌ Error actualizando ${via}:`, err.message);
        }
    }

    console.log('Actualización finalizada');
}

async function main() {
    console.log('🔄 Actualizando coordenadas automáticas...');
    await updateTollRoadCoordinatesFromDataMX();
    console.log('🔄 Aplicando coordenadas manuales desde JSON...');
    await manualCoordinates();
    console.log(`🟢 Proceso completado!`);

}

main();
