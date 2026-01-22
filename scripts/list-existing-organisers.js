// Script to list existing organisers and get their details
// Run with: node scripts/list-existing-organisers.js

const { ConvexHttpClient } = require("convex/browser");
const fs = require('fs');
const path = require('path');

function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
          process.env[key.trim()] = value;
        }
      }
    }
  } catch (error) {
    console.error('Could not read .env.local file');
  }
}

loadEnv();

async function listOrganisers() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  
  if (!convexUrl) {
    console.error('❌ NEXT_PUBLIC_CONVEX_URL not found');
    process.exit(1);
  }

  const client = new ConvexHttpClient(convexUrl);

  try {
    console.log('\n📋 Fetching ALL organisers from database...\n');
    
    const result = await client.query("managementUsers:listOrganisers", {});
    
    console.log(`Found ${result.length} organiser(s):\n`);
    console.log('========================================');
    
    result.forEach((org, i) => {
      console.log(`${i + 1}. ${org.companyName}`);
      console.log(`   Username: ${org.username}`);
      console.log(`   Email: ${org.email}`);
      console.log(`   Status: ${org.accountStatus}`);
      console.log(`   ID: ${org._id}\n`);
    });
    
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  client.close();
}

listOrganisers();
