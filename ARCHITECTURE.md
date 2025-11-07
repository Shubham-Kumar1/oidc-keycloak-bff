# Architecture Documentation

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React UI   │  │  API Calls   │  │  Session     │     │
│  │  Components  │  │  (fetch)     │  │  Cookie      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP Requests
                          │ (Session Cookie Only)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js BFF Server                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  API Routes  │  │   Session    │  │   OIDC       │     │
│  │  /api/*      │  │  Management  │  │   Client     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Token Storage (Server-Side Only)              │  │
│  │  • Access Token  • Refresh Token  • ID Token         │  │
│  │  • Encrypted Session Cookie                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ OIDC Protocol
                          │ (Authorization Code + PKCE)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Keycloak IdP                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Realm       │  │   Users      │  │   Clients    │     │
│  │  Management  │  │   & Roles    │  │   & Secrets  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐                                           │
│  │  PostgreSQL  │  (Persistent Storage)                    │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow

### 1. Login Initiation
```
User → Click "Login"
  ↓
Next.js → Generate PKCE verifier & challenge
  ↓
Next.js → Store verifier in session
  ↓
Next.js → Redirect to Keycloak with:
  - authorization_endpoint
  - client_id
  - redirect_uri
  - code_challenge (S256)
  - state (CSRF protection)
  - scope (openid profile email roles)
```

### 2. User Authentication
```
Keycloak → Display login page
  ↓
User → Enter credentials
  ↓
Keycloak → Validate credentials
  ↓
Keycloak → Generate authorization code
  ↓
Keycloak → Redirect to callback URL with:
  - code (authorization code)
  - state (for validation)
```

### 3. Token Exchange
```
Next.js → Receive callback
  ↓
Next.js → Validate state parameter
  ↓
Next.js → Exchange code for tokens:
  - POST /token_endpoint
  - code
  - code_verifier (PKCE)
  - client_id
  - client_secret
  ↓
Keycloak → Return tokens:
  - access_token
  - refresh_token
  - id_token
  - expires_in
```

### 4. Session Creation
```
Next.js → Extract user info from tokens
  ↓
Next.js → Extract roles from tokens
  ↓
Next.js → Store in encrypted session:
  - refresh_token
  - token expiration
  - user info (sub, email, roles)
  - id_token claims
  ↓
Next.js → Set httpOnly cookie
  ↓
Next.js → Redirect to protected page
```

## Authorization Flow

### Role-Based Access Control (RBAC)

```
User Request → Protected Route
  ↓
Next.js → Check session
  ↓
Next.js → Extract roles from session
  ↓
Next.js → Check required role
  ↓
  ├─ Has Role → Allow Access
  └─ No Role → Return 403 Forbidden
```

### Token Refresh Flow

```
Token Expiring (< 5 minutes)
  ↓
Next.js → Detect expiration
  ↓
Next.js → Call refresh endpoint
  ↓
Next.js → POST /token_endpoint
  - grant_type: refresh_token
  - refresh_token
  - client_id
  - client_secret
  ↓
Keycloak → Validate refresh token
  ↓
Keycloak → Return new tokens
  ↓
Next.js → Update session with new tokens
```

## Security Layers

### 1. Network Layer
- HTTPS (in production)
- CORS configuration
- Rate limiting

### 2. Application Layer
- PKCE protection
- State parameter (CSRF)
- Secure session cookies
- Server-side token storage

### 3. Token Layer
- JWT validation
- Signature verification
- Expiration checking
- Scope validation

### 4. Access Control Layer
- Role-based authorization
- Resource-level permissions
- Session validation

## Data Flow

### Request Flow
```
Browser Request
  ↓
Next.js Middleware (if needed)
  ↓
API Route / Page Component
  ↓
Session Validation
  ↓
Authorization Check
  ↓
Business Logic
  ↓
Response
```

### Token Storage
```
┌─────────────────────────────────────┐
│  Server Memory (Session Store)     │
│  ┌───────────────────────────────┐ │
│  │  Encrypted Session Cookie     │ │
│  │  • refresh_token              │ │
│  │  • token expiration           │ │
│  │  • user info                 │ │
│  │  • roles                     │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
         │
         │ (Never sent to browser)
         │
┌─────────────────────────────────────┐
│  Browser                             │
│  ┌───────────────────────────────┐ │
│  │  httpOnly Cookie              │ │
│  │  (Encrypted session ID only)  │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Component Architecture

### Frontend Components
- **Server Components**: Pages, layouts (Next.js App Router)
- **Client Components**: Interactive UI (TokenCountdown, forms)
- **API Routes**: Server-side endpoints

### Backend Services
- **OIDC Client**: Token management, userinfo
- **Session Manager**: Cookie encryption, session storage
- **Auth Helpers**: Role checking, authorization
- **Token Refresh**: Automatic token renewal

## Deployment Architecture

### Development
```
Docker Compose
├── Keycloak (port 8080)
└── PostgreSQL (port 5432)

Next.js Dev Server (port 3000)
```

### Production
```
Load Balancer
├── Next.js App (multiple instances)
│   └── Session Store (Redis/Database)
└── Keycloak Cluster
    └── PostgreSQL (HA)
```

## Performance Considerations

1. **Token Caching**: Cache OIDC client discovery
2. **Session Optimization**: Minimal data in cookies
3. **Token Refresh**: Proactive refresh before expiration
4. **Database Connection Pooling**: For Keycloak
5. **CDN**: Static assets delivery

## Monitoring & Logging

- Authentication events
- Token refresh attempts
- Failed authorization attempts
- Session creation/destruction
- API endpoint usage

