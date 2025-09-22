#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating environment setup...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found');
  console.log('💡 Run: cp .env.example .env.local');
  process.exit(1);
}

// Read environment variables
require('dotenv').config({ path: envPath });

const requiredVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'DATABASE_URL'
];

const optionalVars = [
  'CLERK_WEBHOOK_SECRET',
  'EMAIL_SERVICE_API_KEY',
  'PAYMENT_PROCESSOR_API_KEY'
];

let hasErrors = false;

console.log('📋 Checking required environment variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.includes('your-') || value.includes('placeholder')) {
    console.error(`❌ ${varName}: Missing or placeholder value`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName}: Set`);
  }
});

console.log('\n📋 Checking optional environment variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.includes('your-') || value.includes('placeholder')) {
    console.warn(`⚠️  ${varName}: Not set (optional)`);
  } else {
    console.log(`✅ ${varName}: Set`);
  }
});

// Validate Clerk keys format
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (publishableKey && !publishableKey.startsWith('pk_')) {
  console.error('❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: Invalid format (should start with pk_)');
  hasErrors = true;
}

const secretKey = process.env.CLERK_SECRET_KEY;
if (secretKey && !secretKey.startsWith('sk_')) {
  console.error('❌ CLERK_SECRET_KEY: Invalid format (should start with sk_)');
  hasErrors = true;
}

// Check middleware file location
const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
if (!fs.existsSync(middlewarePath)) {
  console.error('❌ Middleware file not found at src/middleware.ts');
  hasErrors = true;
} else {
  console.log('✅ Middleware file: Found at src/middleware.ts');
}

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.error('❌ Environment validation failed');
  console.log('\n💡 Next steps:');
  console.log('1. Update .env.local with actual values');
  console.log('2. Get Clerk keys from https://dashboard.clerk.com/');
  console.log('3. Ensure database is running and accessible');
  console.log('\n🚧 Development Mode:');
  console.log('   The app will run in development mode with authentication bypassed.');
  console.log('   Configure Clerk keys for full functionality.');
  process.exit(1);
} else {
  console.log('✅ Environment validation passed');
  console.log('\n🚀 You can now run the application:');
  console.log('   npm run dev');
}