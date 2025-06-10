const cron = require('node-cron');
const flushInactiveDrivers = require('./saveInactivityDrivers');

// Corre cada 30 minutos
cron.schedule('*/30 * * * *', async () => {
  console.log('*********************Verificando choferes inactivos...******************************');
  await flushInactiveDrivers();
});
