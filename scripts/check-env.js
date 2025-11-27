// Environment Variables Checker
// Run this with: node scripts/check-env.js

const requiredEnvVars = {
    // Convex
    'CONVEX_DEPLOYMENT': 'Convex deployment name',
    'NEXT_PUBLIC_CONVEX_URL': 'Convex API URL',

    // Clerk
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': 'Clerk publishable key',
    'CLERK_SECRET_KEY': 'Clerk secret key',

    // Razorpay
    'NEXT_PUBLIC_RAZORPAY_KEY_ID': 'Razorpay key ID',
    'RAZORPAY_KEY_SECRET': 'Razorpay secret key',

    // Cloudinary
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME': 'Cloudinary cloud name',
    'CLOUDINARY_API_KEY': 'Cloudinary API key',
    'CLOUDINARY_API_SECRET': 'Cloudinary API secret',
};

const optionalEnvVars = {
    'NEXT_PUBLIC_APP_URL': 'Application URL',
    'NEXT_PUBLIC_ADMIN_URL': 'Admin dashboard URL',
    'NEXT_PUBLIC_ORGANIZER_URL': 'Organizer dashboard URL',
    'RAZORPAY_WEBHOOK_SECRET': 'Razorpay webhook secret',
    'NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET': 'Cloudinary upload preset',
};

console.log('\n🔍 Checking Environment Variables...\n');
console.log('='.repeat(60));

let missingRequired = [];
let missingOptional = [];

// Check required variables
console.log('\n✅ Required Variables:\n');
Object.entries(requiredEnvVars).forEach(([key, description]) => {
    const value = process.env[key];
    if (value) {
        console.log(`✓ ${key}`);
        console.log(`  ${description}: ${value.substring(0, 20)}...`);
    } else {
        console.log(`✗ ${key} - MISSING`);
        console.log(`  ${description}`);
        missingRequired.push(key);
    }
    console.log('');
});

// Check optional variables
console.log('\n📋 Optional Variables:\n');
Object.entries(optionalEnvVars).forEach(([key, description]) => {
    const value = process.env[key];
    if (value) {
        console.log(`✓ ${key}`);
        console.log(`  ${description}: ${value}`);
    } else {
        console.log(`⚠ ${key} - Not set`);
        console.log(`  ${description}`);
        missingOptional.push(key);
    }
    console.log('');
});

// Summary
console.log('='.repeat(60));
console.log('\n📊 Summary:\n');

if (missingRequired.length === 0) {
    console.log('✅ All required environment variables are set!');
} else {
    console.log(`❌ Missing ${missingRequired.length} required variable(s):`);
    missingRequired.forEach(key => console.log(`   - ${key}`));
    console.log('\n⚠️  Please add these to your .env.local file');
}

if (missingOptional.length > 0) {
    console.log(`\n⚠️  ${missingOptional.length} optional variable(s) not set:`);
    missingOptional.forEach(key => console.log(`   - ${key}`));
    console.log('\n💡 These are optional but recommended for production');
}

console.log('\n' + '='.repeat(60));

// Exit with error if required vars are missing
if (missingRequired.length > 0) {
    console.log('\n❌ Setup incomplete. Please configure missing variables.\n');
    process.exit(1);
} else {
    console.log('\n✅ Environment setup is complete!\n');
    process.exit(0);
}
