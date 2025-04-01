const path = require('path');

function determineEnv() {
  const argv = process.argv.slice(2);
  const env = argv[0] || 'development';

  if (env !== 'production' && env !== 'development') {
    console.warn('Warning: Defaulting to development mode.');
    console.warn(
      "Warning: Run 'pnpm run typesense:<command> production' to run with production environment variables."
    );
  } else {
    console.log('IMPORTANT: Running in', env, 'mode');
  }

  const dotEnvPath =
    env === 'production' ? '.env.production.local' : '.env.development';

  require('dotenv').config({
    path: [path.resolve(process.cwd(), dotEnvPath)],
  });

  return env;
}

module.exports = {
  determineEnv,
};
