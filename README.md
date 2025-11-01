# Iris Authentication System

A secure authentication system using iris biometric verification with magic link fallback.

## Overview

This system provides a secure authentication mechanism using iris biometrics. It includes:

- Backend API built with FastAPI
- Frontend built with Next.js
- Docker containerization for easy deployment
- Database migrations with Alembic
- Secure iris template storage and verification

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Make
- Node.js and pnpm (for frontend development)
- Python 3.9+ (for local backend development)

### Setup

1. Clone the repository
2. Copy the example environment file:
   ```
   cp .env.example .env
   ```
3. Start the development environment:
   ```
   docker compose up --build
   ```

## Development Commands

### Backend

```bash
# Start the backend service
docker compose up backend

# Access backend shell
make backend-shell

# Run backend tests
make backend-test

# Generate database migrations
make backend-migrations
```

### Frontend

```bash
# Install dependencies
pnpm install --filter frontend

# Start the frontend development server
pnpm --filter frontend dev

# Build the frontend
pnpm --filter frontend build
```

## API Examples

### Register a new user

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "full_name": "Test User"}'
```

### Capture iris for registration

```bash
curl -X POST http://localhost:8000/api/v1/auth/capture \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"iris_data": "base64_encoded_iris_data"}'
```

### Login with iris

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "iris_data": "base64_encoded_iris_data"}'
```

### Request magic link

```bash
curl -X POST http://localhost:8000/api/v1/magic_link/request \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Verify magic link

```bash
curl -X GET "http://localhost:8000/api/v1/magic_link/verify?token=your_token_here"
```

## Security Checklist

- [ ] Implement proper iris template encryption at rest
- [ ] Set up KMS for encryption key management
- [ ] Configure HTTPS with proper certificates
- [ ] Implement rate limiting for all API endpoints
- [ ] Set secure HTTP headers (HSTS, CSP, etc.)
- [ ] Implement proper CORS configuration
- [ ] Add input validation for all API endpoints
- [ ] Implement audit logging for security events
- [ ] Set up monitoring and alerting for suspicious activities
- [ ] Implement proper session management
- [ ] Configure database with minimal privileges
- [ ] Implement proper error handling without leaking sensitive information
- [ ] Add legal consent collection for biometric data
- [ ] Conduct security penetration testing
- [ ] Implement proper backup and recovery procedures

## Production Hardening Next Steps

1. **Infrastructure Security**
   - Deploy behind a WAF (Web Application Firewall)
   - Set up network segmentation
   - Implement proper VPC configuration
   - Configure security groups with least privilege

2. **Data Protection**
   - Implement proper data classification
   - Set up data retention policies
   - Configure database encryption
   - Implement proper backup procedures

3. **Authentication & Authorization**
   - Implement MFA for admin access
   - Set up proper role-based access control
   - Configure proper session timeout
   - Implement account lockout policies

4. **Compliance**
   - Ensure GDPR compliance for biometric data
   - Implement proper consent management
   - Set up data subject access request procedures
   - Configure proper audit trails

5. **Operational Security**
   - Set up centralized logging
   - Implement proper secret management
   - Configure automated security scanning
   - Set up incident response procedures