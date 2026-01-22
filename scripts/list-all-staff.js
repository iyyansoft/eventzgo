// Script to list all staff accounts with their usernames
const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://sleek-reindeer-280.convex.cloud";

async function listAllStaff() {
  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    console.log("🔄 Fetching all staff accounts...\n");
    
    // Get all organisers
    const organisers = await client.query("organisersAuth:getAllOrganisers");
    
    if (!organisers || organisers.length === 0) {
      console.log("❌ No organisers found");
      return;
    }

    for (const organiser of organisers) {
      console.log(`📋 Organiser: ${organiser.institutionName}`);
      console.log(`   Username: ${organiser.username}\n`);
      
      // Get all staff for this organiser
      const staff = await client.query("verificationStaff:getVerificationStaff", {
        organiserId: organiser._id
      });

      if (!staff || staff.length === 0) {
        console.log(`   ℹ️  No staff members\n`);
        continue;
      }

      console.log(`   Staff Members (${staff.length}):`);
      staff.forEach((member, index) => {
        console.log(`   ${index + 1}. ${member.staffName}`);
        console.log(`      Username: ${member.username}`);
        console.log(`      Email: ${member.staffEmail}`);
        console.log(`      Role: ${member.role}`);
        console.log(`      Status: ${member.isActive ? '✅ Active' : '❌ Inactive'}`);
        console.log(`      Event: ${member.eventName || 'All Events'}`);
        console.log(`      Temp Password: ${member.tempPassword || 'Not available'}`);
        console.log(``);
      });
    }

    console.log("✅ Done!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    client.close();
  }
}

listAllStaff();
