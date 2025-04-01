const { execSync } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

// Load the .env.production.local file
const envPath = path.join(process.cwd(), '.env.production.local');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env.production.local:', result.error);
  process.exit(1);
}

// Get all environment variables
const envVars = process.env;

// Update each secret in Cloudflare
Object.entries(envVars).forEach(([key, value]) => {
  try {
    console.log(`Updating secret: ${key}`);
    execSync(`wrangler secret put ${key}`, {
      input: value,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    console.log(`Successfully updated secret: ${key}`);
  } catch (error) {
    console.error(`Failed to update secret ${key}:`, error.message);
  }
});
