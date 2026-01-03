# Auth Implementation - Prompt 3 Complete

## Overview

Strict dual-identity authentication system implemented with **complete separation** between internal users and client users.

## Key Principles (ENFORCED)

1. **Two separate identity types**:
   - `User` (internal team members)
   - `ClientUser` (external clients)

2. **NO mixing allowed**:
   - Internal users access `/app/*`
   - Client users access `/p/*` with signed tokens
   - ClientUser CANNOT sign in to `/app`

3. **Authentication methods**:
   - Internal users: email + password OR magic link
   - Client users: magic link ONLY (no passwords)

## Files Created

### Core Auth Configuration
- `lib/auth.ts` - Auth.js v5 configuration
- `lib/auth-utils.ts` - Password hashing & portal token utilities
- `lib/prisma.ts` - Prisma client singleton
- `lib/session.ts` - Session helper functions

### Database
- `prisma/schema.prisma` - User, ClientUser, ClientOrg models + Auth.js tables
- `prisma/prisma.config.ts` - Prisma 7 configuration

### Middleware & Protection
- `middleware.ts` - Route protection (/app requires auth, /p uses tokens)
- `app/api/auth/[...nextauth]/route.ts` - Auth.js API handler

### UI Pages
- `app/login/page.tsx` - Internal user login
- `app/signup/page.tsx` - Internal user registration
- `app/verify-request/page.tsx` - Magic link sent confirmation
- `app/app/page.tsx` - Protected dashboard (test page)

### Components
- `components/auth/login-form.tsx` - Login form component
- `components/auth/signup-form.tsx` - Signup form component

### API Routes
- `app/api/auth/signup/route.ts` - User registration endpoint

### Types
- `types/next-auth.d.ts` - TypeScript declarations for Auth.js

## Environment Variables Required

```env
DATABASE_URL="postgresql://user:password@localhost:5432/sygnoff"
AUTH_SECRET="change-this-to-a-random-string"
EMAIL_FROM="noreply@sygnoff.app"
```

## How It Works

### Internal Users (User model)
1. Sign up at `/signup` with email + password
2. User record created with hashed password
3. Sign in at `/login`
4. Session cookie issued
5. Access `/app/*` routes

### Client Users (ClientUser model)
1. Created via invitation (not self-registration)
2. Receive magic link with signed token
3. Token contains: `{ clientUserId, projectId, expiresAt, signature }`
4. Access `/p/[projectKey]/*` routes
5. Token verified on each request
6. **Cannot access `/app` routes**

## Portal Token Security

Portal tokens are HMAC-SHA256 signed:

```typescript
const token = signPortalToken({
  type: "approval",
  clientUserId: "uuid",
  approvalRequestId: "uuid",
  projectId: "uuid",
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

Tokens are verified on each portal route access:

```typescript
const payload = verifyPortalToken(token);
if (!payload) {
  // Invalid or expired
}
```

## Database Schema

### User (Internal)
```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  passwordHash  String?   // nullable for magic link users
  emailVerified DateTime?
  accounts      Account[]
  sessions      Session[]
}
```

### ClientUser (External)
```prisma
model ClientUser {
  id            String   @id @default(uuid())
  clientOrgId   String
  email         String
  name          String?
  emailVerified DateTime?
  clientOrg     ClientOrg @relation(...)

  @@unique([clientOrgId, email])
}
```

### ClientOrg
```prisma
model ClientOrg {
  id          String       @id @default(uuid())
  name        String
  clientUsers ClientUser[]
}
```

## Next Steps

To use the database:

1. Set up PostgreSQL database
2. Update `DATABASE_URL` in `.env`
3. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Seed test user (optional):
   ```bash
   npx prisma db seed
   ```

## Testing

### Test Internal User Auth
1. Go to `/signup`
2. Create account
3. Sign in at `/login`
4. Should redirect to `/app`

### Test Route Protection
1. Try accessing `/app` without login → redirects to `/login`
2. Sign in → can access `/app`
3. Portal routes `/p/*` do not require session (use tokens)

## Security Checklist

- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ Session-based auth for internal users
- ✅ Token-based auth for client users
- ✅ Middleware protects `/app/*` routes
- ✅ ClientUser cannot access internal routes
- ✅ Portal tokens are signed and verified
- ✅ Tokens have expiration
- ✅ No password storage for ClientUser

## Important: What NOT to do

❌ DO NOT allow ClientUser to sign in via credentials
❌ DO NOT merge User and ClientUser tables
❌ DO NOT use session auth for portal routes
❌ DO NOT allow clients into `/app` routes
❌ DO NOT skip token verification on portal routes

## Dependencies Installed

```json
{
  "next-auth": "^5.0.0-beta.30",
  "@auth/prisma-adapter": "^2.11.1",
  "prisma": "^7.2.0",
  "@prisma/client": "^7.2.0",
  "bcryptjs": "^3.0.3",
  "nodemailer": "^7.0.12",
  "zod": "^4.2.1"
}
```

## Prompt 3 Status: ✅ COMPLETE

All requirements from Prompt 3 implemented:
- ✅ Auth.js configured
- ✅ User and ClientUser separation enforced
- ✅ /app routes protected
- ✅ Portal token system implemented
- ✅ Login/signup pages built
- ✅ Magic link flow prepared
