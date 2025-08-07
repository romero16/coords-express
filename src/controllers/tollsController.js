const HttpStatus = require('../enums/status.enum');
const TollRoad = require('../models/tollsModel');
const axios = require('axios');
const turf = require('@turf/turf');
const polyline = require('@mapbox/polyline');


// const processRoute = async (req, res) => {
//   try {
//     const { coordinates, typeCargo } = req.body;

//     if (!Array.isArray(coordinates) || coordinates.length === 0) {
//       return res.status(400).json({ message: 'Se requiere un arreglo de coordenadas.' });
//     }

//     const coordsArray = coordinates.map(coord => [coord.lng, coord.lat]);
//     const coordsArrayUsed = coordsArray;
//     const costField = `precio_camiones_${typeCargo}_ejes`;

//     let line = turf.lineString(coordsArrayUsed);
//     line = turf.simplify(line, { tolerance: 0.00001, highQuality: false });

//     const buffer = turf.buffer(line, 0.022, { units: 'kilometers' }); // 35 metros

//     const tolls = await TollRoad.find({
//       location: {
//         $geoWithin: { $geometry: buffer.geometry }
//       }
//     });

//     const selectedTolls = tolls.map(toll => {
//       const tollCoord = toll.location.coordinates;
//       const tollPoint = turf.point(tollCoord);
//       const nearest = turf.nearestPointOnLine(line, tollPoint, { units: 'kilometers' });

//       const dist = nearest.properties.dist;
//       const index = nearest.properties.index;
//       const routeCoords = line.geometry.coordinates;

//       const prev = routeCoords[index - 1] || routeCoords[index];
//       const next = routeCoords[index + 1] || routeCoords[index];

//       const tangent = [next[0] - prev[0], next[1] - prev[1]];
//       const toToll = [
//         tollCoord[0] - nearest.geometry.coordinates[0],
//         tollCoord[1] - nearest.geometry.coordinates[1]
//       ];

//       const dot = tangent[0] * toToll[0] + tangent[1] * toToll[1];
//       const cross = tangent[0] * toToll[1] - tangent[1] * toToll[0];

//       console.log(`Caseta ${toll.via} | dist: ${(dist * 1000).toFixed(2)}m | dot: ${dot.toFixed(6)} | cross: ${cross.toFixed(6)}`);

//       return {
//         toll,
//         dist,
//         dot,
//         cross,
//         index,
//         sense: (dot > -0.001 && dot < 0.001 && cross < 0.0005) ? 'correcto' : 'opuesto'
//       };
//     });

//     // Agrupar por índice cercano en la línea
//     const groupedTolls = {};

//     selectedTolls.forEach(item => {
//       if (!groupedTolls[item.index]) {
//         groupedTolls[item.index] = [];
//       }
//       groupedTolls[item.index].push(item);
//     });

//     // Seleccionar mejor caseta por grupo
//     let filteredTolls = Object.values(groupedTolls).map(group => {
//       const preferred = group.find(({ dist, dot, cross }) =>
//         dist <= 0.008 && dot > -0.001 && dot < 0.001 && cross < 0.0005
//       );
//       if (preferred) return preferred;

//       // Si no hay en sentido correcto, tomar la más cercana dentro del rango permitido
//       return group.find(({ dist }) => dist <= 0.035);
//     }).filter(Boolean);

//     // Eliminar duplicados por coordenadas redondeadas (5 decimales ~1m precisión)
//     const seenCoords = new Set();
//     filteredTolls = filteredTolls.filter(({ toll }) => {
//       const key = `${toll.location.coordinates[0].toFixed(5)}:${toll.location.coordinates[1].toFixed(5)}`;
//       if (seenCoords.has(key)) return false;
//       seenCoords.add(key);
//       return true;
//     });

//     console.log(`Casetas filtradas (una por tramo, sin duplicados): ${filteredTolls.length}`);

//     if (filteredTolls.length > 0) {
//       const tollsMapped = filteredTolls.map(({ toll, sense }) => ({
//         id: toll._id,
//         name: toll.via,
//         position: [toll.location.coordinates[1], toll.location.coordinates[0]],
//         cost: toll[costField] || 0,
//       }));

//       const totalCost = tollsMapped.reduce((sum, toll) => sum + toll.cost, 0);
//       return res.json({ tolls: tollsMapped, totalCost });
//     }

//     return res.json({ tolls: [], totalCost: 0 });

//   } catch (error) {
//     console.error('Error en processRoute:', error);
//     return res.status(500).json({ message: error.message });
//   }
// };



// ************************************************FUNCION PARA PROCESAR DESDE EL API*********************************************

const processRoute = async (req, res) => {
  try {
      let { typeCargo, origin, destination} = req.body;
      let points = [];

      const [dataOrigin, dataDestination] = await Promise.all([
        axios.post(
          `https://gaia.inegi.org.mx/sakbe_v3.1/buscalinea?escala=10000&x=${origin[0]}&y=${origin[1]}&proj=GRS80&type=json&key=OddXDtiQ-CyeP-TL6r-uxJ0-vK8WB10pHeax`,
          {}, // No borrar el para evitar cierres del servidor
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            timeout: 180000, // 3 minutos en milisegundos
          }
        ),
        axios.post(
          `https://gaia.inegi.org.mx/sakbe_v3.1/buscalinea?escala=10000&x=${destination[0]}&y=${destination[1]}&proj=GRS80&type=json&key=OddXDtiQ-CyeP-TL6r-uxJ0-vK8WB10pHeax`,
          {}, // No borrar el para evitar cierres del servidor
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            timeout: 180000, // 3 minutos en milisegundos
          }
        )
      ]);
      let  getTolls = [];
      if(dataOrigin.data.data && dataOrigin.data.data?.id_routing_net && dataDestination.data.data?.id_routing_net){
        getTolls = await axios.post(
          `https://gaia.inegi.org.mx/sakbe_v3.1/detalle_c?id_i=${dataOrigin.data.data.id_routing_net}&id_f=${dataDestination.data.data.id_routing_net}&v=${typeCargo}&source_i=${dataOrigin.data.data.source}&source_f=${dataDestination.data.data.source}&target_i=${dataOrigin.data.data.target}&target_f=${dataDestination.data.data.target}&type=json&proj=GRS80&key=OddXDtiQ-CyeP-TL6r-uxJ0-vK8WB10pHeax`,
          {}, // No borrar el para evitar cierres del servidor
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            timeout: 180000, // 3 minutos en milisegundos
          }
        );

        if(getTolls){
            points = await axios.post(
            `https://gaia.inegi.org.mx/sakbe_v3.1/cuota?id_i=${dataOrigin.data.data.id_routing_net}&source_i=${dataOrigin.data.data.source}&target_i=${dataOrigin.data.data.target}&id_f=${dataDestination.data.data.id_routing_net}&source_f=${dataDestination.data.data.source}&target_f=${dataDestination.data.data.target}&v=${typeCargo}&type=json&proj=GRS80&key=OddXDtiQ-CyeP-TL6r-uxJ0-vK8WB10pHeax`,
            {}, // No borrar el para evitar cierres del servidor
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              timeout: 180000, // 3 minutos en milisegundos
            }
          );
        }

      }else{
        return res.status(500).json({ message: 'Error en datos de origen y destino!' });
      }
   
    if (!getTolls.data || !Array.isArray(getTolls.data.data)) {
      return res.status(500).json({ message: 'INEGI no devolvió datos válidos para casetas.' });
    }
    const route = getTolls.data.data;

    const distanciaTotalMetros = route.reduce((acc, segmento) => acc + segmento.long_m, 0);
    const tiempoTotalMinutos = route.reduce((acc, segmento) => acc + segmento.tiempo_min, 0);

    const distanceValues = {
      valueText: `${(distanciaTotalMetros / 1000).toFixed(2)} km`,
      valueNumber: distanciaTotalMetros
    };

    // Cálculo de días, horas y minutos
    const dias = Math.floor(tiempoTotalMinutos / (60 * 24));
    const horas = Math.floor((tiempoTotalMinutos % (60 * 24)) / 60);
    const minutos = Math.round(tiempoTotalMinutos % 60);

    let tiempoFormateado = '';
    if (dias > 0) tiempoFormateado += `${dias} d `;
    if (horas > 0 || dias > 0) tiempoFormateado += `${horas} h `;
    tiempoFormateado += `${minutos} m`;

    const durationValues = {
      valueText: tiempoFormateado.trim(),
      valueNumber: tiempoTotalMinutos
    };


      
    // Filtrar casetas con peaje
    const tolls = getTolls.data.data.filter(
      toll => toll.punto_caseta !== null && toll.punto_caseta !== 'null'
    );

    const tollsMapped = tolls.map((toll, index) => {
      const punto = JSON.parse(toll.punto_caseta);
      const [lng, lat] = punto.coordinates;

      return {
        id: index,
        name: toll.direccion,
        position: [lat, lng],
        cost: toll.costo_caseta || 0
      };
    });

  const totalCost = tollsMapped.reduce((sum, toll) => sum + toll.cost, 0);
  return res.json({route:route, tolls: tollsMapped, totalCost, distanceValues, durationValues, points: JSON.parse(points.data.data.geojson)});

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  processRoute
};