require('dotenv').config();
const Typesense = require('typesense');

const client = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST,
      port: Number(process.env.TYPESENSE_PORT),
      protocol: 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 2,
});

(async function main() {
  const keys = await client.keys().retrieve();

  console.log('Current keys:');
  console.log(keys);
})();
