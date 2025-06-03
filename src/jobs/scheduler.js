const cron = require('node-cron');
const flushInactiveDrivers = require('./saveInactivityDrivers');

// Corre cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  console.log('*********************Verificando buffers inactivos...******************************');
  await flushInactiveDrivers();
});
