# Authentication Updates Summary

## Overview
Updated the authentication system to support social logins (Google, GitHub, GitLab) and email OTP authentication, replacing the previous email/password system.

## Changes Made

### 1. Database Schema (`prisma/schema.prisma`)
- ✅ Added `OTPToken` model for email OTP verification
  - Stores 6-digit tokens with expiration
  - Tracks used status to prevent reuse
  - Indexed on `[email, token]` for fast lookups

### 2. Auth Configuration (`lib/auth.ts`)
- ✅ Added OAuth providers:
  - **Google**: Uses `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
  - **GitHub**: Uses `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
  - **GitLab**: Uses `GITLAB_CLIENT_ID` and `GITLAB_CLIENT_SECRET`
- ✅ Replaced Resend magic links with Email OTP provider
  - Validates 6-digit OTP tokens
  - Automatically creates users on first login
  - Marks tokens as used after successful authentication
- ✅ Updated `signIn` callback to handle OAuth user creation
  - Auto-creates internal users when signing in with OAuth
  - Sets `emailVerified` timestamp on creation

### 3. API Routes
- ✅ Created `/api/auth/send-otp` endpoint
  - Validates email addresses
  - Generates 6-digit OTP codes
  - Sets 10-minute expiration
  - Cleans up old unused tokens
  - Returns OTP in response (development only)
  - TODO: Integrate with email service provider (Resend, SendGrid, etc.)

### 4. UI Components
- ✅ Updated `components/auth/login-form.tsx`
  - Social login buttons (Google, GitHub, GitLab)
  - Email OTP flow with two-step process
  - Clean, modern design matching homepage
- ✅ Updated `components/auth/signup-form.tsx`
  - Same social + OTP flow as login
  - Includes Terms of Service agreement
- ✅ Updated page titles and styling
  - Login: "Welcome back"
  - Signup: "Get started with Versisi"

### 5. Environment Variables (`.env.example`)
Updated with required OAuth credentials:
```env
# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# GitHub OAuth
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# GitLab OAuth
GITLAB_CLIENT_ID="..."
GITLAB_CLIENT_SECRET="..."
```

## Setup Instructions

### 1. Run Database Migration
```bash
npx prisma migrate dev --name add_otp_tokens
```

### 2. Set Up OAuth Applications

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env`

#### GitLab OAuth
1. Go to [GitLab Applications](https://gitlab.com/-/profile/applications)
2. Create a new application
3. Set Redirect URI: `http://localhost:3000/api/auth/callback/gitlab`
4. Select scopes: `read_user`, `email`
5. Copy Application ID and Secret to `.env`

### 3. Configure Email Service (Optional)
For production, integrate an email service provider in `/api/auth/send-otp/route.ts`:
- [Resend](https://resend.com/) - Recommended
- [SendGrid](https://sendgrid.com/)
- [AWS SES](https://aws.amazon.com/ses/)
- [Postmark](https://postmarkapp.com/)

## Testing

### Development Mode
In development, the OTP is logged to console and returned in the API response:
```json
{
  "message": "OTP sent successfully",
  "debug": { "token": "123456" }
}
```

### Test Flow
1. **Social Login**: Click any social provider button → should redirect to OAuth
2. **Email OTP Login**:
   - Enter email → Submit
   - Check console for OTP code
   - Enter OTP → Verify
   - Should redirect to `/app`

## Security Features
- ✅ `allowDangerousEmailAccountLinking: true` - Links accounts with same email
- ✅ OTP tokens expire after 10 minutes
- ✅ Tokens can only be used once
- ✅ Old unused tokens are cleaned up on new OTP request
- ✅ Email verification set on OAuth and OTP authentication
- ✅ Session strategy: JWT (stateless)

## What Was Removed
- ❌ Email/password credentials provider
- ❌ Password hashing utilities (still in codebase but unused)
- ❌ Full name field in signup
- ❌ Password confirmation field
- ❌ Resend magic link provider

## Next Steps
1. Set up OAuth applications with the providers
2. Update `.env` with OAuth credentials
3. Run database migration
4. Integrate email service for OTP delivery
5. Test all authentication flows
6. Update production environment variables

## Notes
- OAuth providers auto-create users in the `User` table
- `ClientUser` accounts remain separate (for external client stakeholders)
- Email OTP works for both login and signup
- GitLab was chosen as the third provider (popular with developers)
