// Script to check and activate specific staff account
const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://sleek-reindeer-280.convex.cloud";
const USERNAME = "cibisuryaa_7xsa5a"; // The staff username

async function checkAndActivateStaff() {
  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    console.log(`🔍 Checking staff account: ${USERNAME}\n`);
    
    // Get all organisers
    const organisers = await client.query("organisersAuth:getAllOrganisers");
    
    for (const organiser of organisers) {
      // Get all staff for this organiser
      const staff = await client.query("verificationStaff:getVerificationStaff", {
        organiserId: organiser._id
      });

      // Find the specific staff member
      const targetStaff = staff.find(s => s.username === USERNAME);
      
      if (targetStaff) {
        console.log(`✅ Found staff account!`);
        console.log(`   Name: ${targetStaff.staffName}`);
        console.log(`   Username: ${targetStaff.username}`);
        console.log(`   Email: ${targetStaff.staffEmail}`);
        console.log(`   Role: ${targetStaff.role}`);
        console.log(`   Organiser: ${organiser.institutionName}`);
        console.log(`   Event: ${targetStaff.eventName || 'All Events'}`);
        console.log(`   Status: ${targetStaff.isActive ? '✅ Active' : '❌ Inactive'}`);
        console.log(`   Deleted: ${targetStaff.isDeleted ? '❌ Yes' : '✅ No'}`);
        console.log(`   Temp Password: ${targetStaff.tempPassword || 'Not available'}`);
        console.log(``);

        if (!targetStaff.isActive) {
          console.log(`🔄 Activating account...`);
          
          await client.mutation("verificationStaff:updateStaffStatus", {
            staffId: targetStaff._id,
            isActive: true,
            updatedBy: organiser._id
          });
          
          console.log(`✅ Account activated successfully!`);
        } else {
          console.log(`ℹ️  Account is already active`);
        }
        
        return;
      }
    }

    console.log(`❌ Staff account not found: ${USERNAME}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    client.close();
  }
}

checkAndActivateStaff();
