const { ConvexHttpClient } = require("convex/browser");
const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "https://balanced-seahorse-917.convex.cloud");

async function check() {
  try {
    console.log("Checking organisersAuth...");
    const organisers = await client.query("organisersAuth:getAllOrganisers");
    console.log("Success! Organisers:", organisers.length);
  } catch (e) {
    console.error("Error calling organisersAuth:", e);
  }
}

check();
