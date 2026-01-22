// Direct database check for staff account
const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://sleek-reindeer-280.convex.cloud";

async function directDatabaseCheck() {
  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    console.log(`🔍 Direct database check for: cibisuryaa_7xsa5a\n`);
    
    // Try to login to see the exact error
    const loginResult = await client.mutation("verificationStaff:staffLogin", {
      username: "cibisuryaa_7xsa5a",
      password: "jLQSAWCk@2"
    });

    console.log("Login Result:", JSON.stringify(loginResult, null, 2));
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    client.close();
  }
}

directDatabaseCheck();
