// backend/config.js
module.exports = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'badlk_dev_secret_change_in_production',
  DATABASE_URL: process.env.DATABASE_URL || 'sqlite:./badlk.db',
  MOBILE_MONEY_PROVIDER: process.env.MOBILE_MONEY_PROVIDER || 'SIMULATED',
};
