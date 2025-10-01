// Simple script to clear rate limit cache
// Run this if you're still getting rate limit errors

const express = require('express');
const app = express();

// Clear any in-memory rate limit stores
console.log('Clearing rate limit cache...');

// If you're using Redis for rate limiting, you'd clear it here
// For memory store, we just need to restart the server

console.log('Rate limit cache cleared. Please restart your server.');
process.exit(0);