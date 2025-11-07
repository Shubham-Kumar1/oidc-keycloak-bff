# 🔐 Enterprise OIDC + Keycloak Authentication System

A production-grade demonstration of OpenID Connect (OIDC) authentication using Keycloak with a Backend-for-Frontend (BFF) pattern. This project showcases enterprise-level identity and access management features with a modern, secure architecture.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![Keycloak](https://img.shields.io/badge/Keycloak-25.0-orange)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

## 🎯 Features

### Core Authentication
- ✅ **OIDC/OAuth 2.0** - Authorization Code Flow with PKCE
- ✅ **BFF Pattern** - Tokens stored server-side, never exposed to browser
- ✅ **Secure Session Management** - Encrypted httpOnly cookies
- ✅ **Token Refresh** - Automatic and manual token renewal
- ✅ **Role-Based Access Control (RBAC)** - Realm and client roles

### Enterprise Features
- ✅ **Multi-Factor Authentication (MFA)** - TOTP setup and verification
- ✅ **Social Login** - Google/GitHub identity provider integration
- ✅ **Session Management** - View and manage active sessions
- ✅ **Audit Logging** - Authentication events and activity tracking
- ✅ **API Gateway Pattern** - Protected endpoints with token validation
- ✅ **Developer Tools** - JWT decoder and token introspection

### Security
- ✅ **PKCE S256** - Code challenge protection
- ✅ **State Parameter** - CSRF protection
- ✅ **Server-Side Token Storage** - XSS protection
- ✅ **Secure Cookie Configuration** - httpOnly, sameSite, secure flags

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │─────────▶│  Next.js BFF │─────────▶│  Keycloak   │
│  (Client)   │◀────────│  (Server)    │◀────────│  (IdP)      │
└─────────────┘         └──────────────┘         └─────────────┘
     │                          │
     │ Session Cookie           │ Access/Refresh Tokens
     │ (httpOnly)               │ (Server-side only)
     │                          │
```

### BFF Pattern Benefits
- **Security**: Access tokens never leave the server
- **XSS Protection**: Tokens can't be stolen from localStorage
- **Token Refresh**: Server handles refresh automatically
- **API Calls**: Server makes authenticated requests on behalf of user

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and npm
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd oidc-keycloak-bff
```

### 2. Start Keycloak
```bash
docker compose up -d
```

Wait for Keycloak to start (usually 30-60 seconds), then access:
- **Admin Console**: http://localhost:8080
- **Credentials**: `admin` / `admin`

### 3. Configure Keycloak Realm

#### Option A: Import Realm (Recommended)
1. Go to http://localhost:8080
2. Click on the realm dropdown (top-left, shows "Master")
3. Click **"Create realm"**
4. Toggle **"Import"** ON
5. Click **"Select file"** and choose `keycloak/realm-export.json`
6. Click **"Create"**

#### Option B: Manual Setup
1. Create a new realm named `oidc-demo`
2. Create a client:
   - Client ID: `next-bff`
   - Client Protocol: `openid-connect`
   - Access Type: `confidential`
   - Valid Redirect URIs: `http://localhost:3000/api/auth/callback`
   - Valid Post Logout Redirect URIs: `http://localhost:3000/*`
   - Web Origins: `http://localhost:3000`
   - Client Secret: `dev-secret` (or generate a new one)

### 4. Create a Test User
1. Go to **Users** → **Add user**
2. Username: `test` (or any username)
3. Email: `test@example.com`
4. Click **Save**
5. Go to **Credentials** tab
6. Set password (e.g., `Testpass123`)
7. Toggle **"Temporary"** OFF
8. Click **Save**

### 5. Configure Environment Variables

Create `web/.env.local`:

```bash
# Keycloak Configuration
OIDC_ISSUER_URL=http://localhost:8080/realms/oidc-demo
OIDC_CLIENT_ID=next-bff
OIDC_CLIENT_SECRET=dev-secret
OIDC_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Session Configuration
SESSION_PASSWORD=your-super-secret-session-password-at-least-32-characters-long
BASE_URL=http://localhost:3000
```

**⚠️ Important**: Generate a strong `SESSION_PASSWORD`:
```bash
openssl rand -base64 32
```

### 6. Install Dependencies and Run
```bash
cd web
npm install
npm run dev
```

### 7. Access the Application
- **Application**: http://localhost:3000
- **Keycloak Admin**: http://localhost:8080

## 📁 Project Structure

```
oidc-keycloak-bff/
├── docker-compose.yml          # Keycloak + PostgreSQL setup
├── keycloak/
│   └── realm-export.json       # Keycloak realm configuration
├── web/                        # Next.js application
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   │   ├── api/           # API routes
│   │   │   │   ├── auth/      # Authentication endpoints
│   │   │   │   └── protected/ # Protected API endpoints
│   │   │   ├── admin/         # Admin dashboard (RBAC)
│   │   │   ├── profile/       # User profile page
│   │   │   ├── sessions/      # Session management
│   │   │   ├── settings/      # User settings
│   │   │   ├── mfa/           # MFA setup
│   │   │   ├── social-login/  # Social login info
│   │   │   ├── dev-tools/     # JWT decoder
│   │   │   └── audit-log/     # Audit logging
│   │   ├── components/        # React components
│   │   └── lib/               # Utility libraries
│   │       ├── oidc.ts        # OIDC client setup
│   │       ├── session.ts     # Session management
│   │       ├── auth.ts        # Authorization helpers
│   │       └── token-refresh.ts # Token refresh logic
│   └── package.json
└── README.md
```

## 🔑 Key Components

### Authentication Flow
1. User clicks "Login" → Redirected to Keycloak
2. User authenticates → Keycloak redirects with authorization code
3. Server exchanges code for tokens (with PKCE verifier)
4. Tokens stored server-side in encrypted session
5. Browser receives only httpOnly session cookie

### Protected Routes
- `/protected` - Requires authentication
- `/admin` - Requires `admin` or `realm-admin` role
- `/profile` - User profile and token information
- `/sessions` - Session management dashboard
- `/settings` - Account settings
- `/mfa` - Multi-factor authentication setup
- `/social-login` - Social login configuration
- `/dev-tools` - JWT decoder and debugging
- `/audit-log` - Authentication event logs

### API Endpoints
- `GET /api/auth/login` - Initiate OIDC login
- `GET /api/auth/callback` - Handle OIDC callback
- `GET /api/auth/logout` - End session
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/session` - Get session info
- `GET /api/protected` - Protected endpoint (requires auth)
- `GET /api/protected/admin` - Admin endpoint (requires admin role)

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React** - UI library

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **iron-session** - Secure session management
- **openid-client** - OIDC client library

### Infrastructure
- **Keycloak 25.0** - Identity and access management
- **PostgreSQL** - Database for Keycloak
- **Docker Compose** - Container orchestration

## 🔒 Security Features

### Implemented
- ✅ PKCE (Proof Key for Code Exchange) with S256
- ✅ State parameter for CSRF protection
- ✅ Server-side token storage (BFF pattern)
- ✅ HttpOnly, Secure, SameSite cookies
- ✅ Role-based access control
- ✅ Token expiration and refresh
- ✅ Secure session encryption

### Best Practices
- Never expose tokens to browser
- Validate all tokens server-side
- Use HTTPS in production
- Rotate session passwords regularly
- Implement rate limiting
- Monitor authentication events

## 📚 Documentation

### Setting Up Social Login

#### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `http://localhost:8080/realms/oidc-demo/broker/google/endpoint`
4. In Keycloak: **Identity Providers** → **Add provider** → **Google**
5. Enter Client ID and Secret

#### GitHub
1. Go to GitHub → **Settings** → **Developer settings** → **OAuth Apps**
2. Create new OAuth App
3. Authorization callback URL: `http://localhost:8080/realms/oidc-demo/broker/github/endpoint`
4. In Keycloak: **Identity Providers** → **Add provider** → **GitHub**
5. Enter Client ID and Secret

### Enabling MFA
1. In Keycloak: **Authentication** → **Required Actions**
2. Enable **"Configure OTP"**
3. Users will be prompted to set up TOTP on login
4. Or configure in Account Console

### Assigning Admin Role
1. Go to **Users** → Select user
2. **Role Mappings** tab
3. **Assign role** → Select `admin` or `realm-admin`
4. Click **Assign**

## 🧪 Testing

### Manual Testing
1. Test login flow
2. Verify protected routes require authentication
3. Test role-based access (admin route)
4. Test token refresh
5. Test logout

### API Testing
Use the built-in API testing console at `/api-test` to test protected endpoints.

## 🚢 Deployment

### Production Considerations
1. **Environment Variables**: Use secure secret management
2. **HTTPS**: Enable SSL/TLS certificates
3. **Keycloak**: Use production database (not H2)
4. **Session Security**: Use strong session passwords
5. **CORS**: Configure proper CORS settings
6. **Rate Limiting**: Implement rate limiting
7. **Monitoring**: Set up logging and monitoring

### Docker Production Setup
```bash
# Build and run in production mode
docker compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Keycloak](https://www.keycloak.org/) - Open-source identity and access management
- [Next.js](https://nextjs.org/) - The React framework
- [openid-client](https://github.com/panva/node-openid-client) - OIDC client library

## 📧 Contact

For questions or issues, please open an issue on GitHub.

---

**⭐ If you find this project useful, please give it a star!**
