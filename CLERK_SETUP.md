# Clerk Authentication Setup Guide

This guide will help you configure Clerk authentication with Google and LinkedIn OAuth providers for the Alumni Management Dashboard.

## Prerequisites

1. A Clerk account (sign up at https://clerk.com)
2. Google Cloud Console account for Google OAuth
3. LinkedIn Developer account for LinkedIn OAuth

## Step 1: Create a Clerk Application

1. Go to https://dashboard.clerk.com
2. Click "Create Application"
3. Choose your application name (e.g., "Alumni Management Dashboard")
4. Select the authentication methods you want to enable
5. Click "Create Application"

## Step 2: Get Clerk API Keys

1. In your Clerk dashboard, go to "API Keys"
2. Copy the following keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_` or `pk_live_`)
   - `CLERK_SECRET_KEY` (starts with `sk_test_` or `sk_live_`)
3. Update your `.env.local` file with these keys

## Step 3: Configure Google OAuth

### Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For development: `https://your-clerk-frontend-api.clerk.accounts.dev/v1/oauth_callback`
     - For production: `https://your-production-domain.clerk.accounts.dev/v1/oauth_callback`
   - Save the Client ID and Client Secret

### Configure Google in Clerk

1. In your Clerk dashboard, go to "User & Authentication" > "Social Connections"
2. Find "Google" and click "Configure"
3. Enter your Google OAuth Client ID and Client Secret
4. Configure the scopes: `openid email profile`
5. Save the configuration

## Step 4: Configure LinkedIn OAuth

### Create LinkedIn OAuth Application

1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com)
2. Click "Create App"
3. Fill in the required information:
   - App name: "Alumni Management Dashboard"
   - LinkedIn Page: Your organization's LinkedIn page
   - App use: Select appropriate use case
4. In the "Auth" tab:
   - Add authorized redirect URLs:
     - For development: `https://your-clerk-frontend-api.clerk.accounts.dev/v1/oauth_callback`
     - For production: `https://your-production-domain.clerk.accounts.dev/v1/oauth_callback`
   - Request access to "Sign In with LinkedIn" product
5. Save your Client ID and Client Secret

### Configure LinkedIn in Clerk

1. In your Clerk dashboard, go to "User & Authentication" > "Social Connections"
2. Find "LinkedIn" and click "Configure"
3. Enter your LinkedIn OAuth Client ID and Client Secret
4. Configure the scopes: `r_liteprofile r_emailaddress`
5. Save the configuration

## Step 5: Configure Webhooks (Optional)

1. In your Clerk dashboard, go to "Webhooks"
2. Click "Add Endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/clerk`
4. Select the events you want to listen to:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the webhook secret and add it to your `.env.local` as `CLERK_WEBHOOK_SECRET`

## Step 6: Update Environment Variables

Update your `.env.local` file with all the required variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your-actual-publishable-key"
CLERK_SECRET_KEY="sk_test_your-actual-secret-key"
CLERK_WEBHOOK_SECRET="whsec_your-actual-webhook-secret"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
```

## Step 7: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click "Sign In" and test both Google and LinkedIn OAuth flows
4. Verify that users are redirected to the dashboard after successful authentication

## Troubleshooting

### Common Issues

1. **OAuth redirect URI mismatch**: Ensure the redirect URIs in Google/LinkedIn match exactly with Clerk's callback URLs
2. **CORS errors**: Make sure your domain is properly configured in both OAuth providers
3. **Webhook verification fails**: Double-check that the webhook secret is correctly set in your environment variables

### Getting Help

- Clerk Documentation: https://clerk.com/docs
- Google OAuth Documentation: https://developers.google.com/identity/protocols/oauth2
- LinkedIn OAuth Documentation: https://docs.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow

## Security Notes

- Never commit your actual API keys to version control
- Use different keys for development and production environments
- Regularly rotate your API keys and secrets
- Monitor your Clerk dashboard for any suspicious activity