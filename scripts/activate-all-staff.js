// Script to activate all staff accounts
const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://sleek-reindeer-280.convex.cloud";

async function activateAllStaff() {
  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    console.log("🔄 Fetching all staff accounts...");
    
    // Get all organisers
    const organisers = await client.query("organisersAuth:getAllOrganisers");
    
    if (!organisers || organisers.length === 0) {
      console.log("❌ No organisers found");
      return;
    }

    console.log(`✅ Found ${organisers.length} organiser(s)`);

    for (const organiser of organisers) {
      console.log(`\n📋 Processing organiser: ${organiser.institutionName}`);
      
      // Get all staff for this organiser
      const staff = await client.query("verificationStaff:getVerificationStaff", {
        organiserId: organiser._id
      });

      if (!staff || staff.length === 0) {
        console.log(`  ℹ️  No staff found for ${organiser.institutionName}`);
        continue;
      }

      console.log(`  ✅ Found ${staff.length} staff member(s)`);

      // Activate each staff member
      for (const member of staff) {
        if (!member.isActive) {
          console.log(`  🔄 Activating: ${member.staffName} (${member.username})`);
          
          await client.mutation("verificationStaff:updateStaffStatus", {
            staffId: member._id,
            isActive: true,
            updatedBy: organiser._id
          });
          
          console.log(`  ✅ Activated: ${member.staffName}`);
        } else {
          console.log(`  ℹ️  Already active: ${member.staffName} (${member.username})`);
        }
      }
    }

    console.log("\n✅ All staff accounts processed!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    client.close();
  }
}

activateAllStaff();
