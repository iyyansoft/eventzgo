// Force activate staff by username
const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://sleek-reindeer-280.convex.cloud";

async function forceActivate() {
  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    console.log(`🔄 Force activating: cibisuryaa_7xsa5a\n`);
    
    // Get TicketsHub organiser
    const organisers = await client.query("organisersAuth:getAllOrganisers");
    const ticketshub = organisers.find(o => o.username === "ticketshub");
    
    if (!ticketshub) {
      console.log("❌ TicketsHub organiser not found");
      return;
    }

    console.log(`✅ Found organiser: ${ticketshub.institutionName}`);
    
    // Get all staff (this will include the raw data)
    const allStaff = await client.query("verificationStaff:getVerificationStaff", {
      organiserId: ticketshub._id
    });

    const staff = allStaff.find(s => s.username === "cibisuryaa_7xsa5a");
    
    if (!staff) {
      console.log("❌ Staff not found");
      return;
    }

    console.log(`✅ Found staff: ${staff.staffName}`);
    console.log(`   Current status: ${staff.isActive ? 'Active' : 'Inactive'}`);
    
    // Force activate
    console.log(`\n🔄 Activating...`);
    await client.mutation("verificationStaff:updateStaffStatus", {
      staffId: staff._id,
      isActive: true,
      updatedBy: ticketshub._id
    });
    
    console.log(`✅ Staff activated!`);
    
    // Test login
    console.log(`\n🔐 Testing login...`);
    const loginResult = await client.mutation("verificationStaff:staffLogin", {
      username: "cibisuryaa_7xsa5a",
      password: "jLQSAWCk@2"
    });

    if (loginResult.success) {
      console.log(`✅ Login successful!`);
      console.log(`   Staff: ${loginResult.staff.staffName}`);
      console.log(`   Role: ${loginResult.staff.role}`);
    } else {
      console.log(`❌ Login failed: ${loginResult.error}`);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    client.close();
  }
}

forceActivate();
