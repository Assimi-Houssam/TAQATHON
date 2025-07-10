# Nginx Reverse Proxy Configuration

## Overview

This Nginx configuration provides a secure and efficient reverse proxy setup for your application, routing traffic between your frontend (port 3000) and backend (port 7532) services.

## Architecture

```
Internet → Nginx (Port 8080/8443) → Frontend (Port 3000) | Backend (Port 7532)
```

## Key Features

### 🔒 Security
- **Security Headers**: X-Frame-Options, X-XSS-Protection, X-Content-Type-Options, CSP
- **Rate Limiting**: 
  - API endpoints: 10 requests/second
  - Login endpoints: 5 requests/minute
- **Hidden Files Protection**: Denies access to dotfiles
- **Server Token Hiding**: Hides Nginx version information

### ⚡ Performance
- **Gzip Compression**: Reduces bandwidth usage
- **Static Asset Caching**: 1-year cache for static files
- **Optimized Buffering**: Efficient proxy buffering
- **Connection Keep-Alive**: Reduces connection overhead

### 🎯 Routing
- `/api/*` → Backend service (port 7532)
- `/_next/*` → Frontend service (Next.js assets)
- Static assets → Frontend with caching
- All other routes → Frontend (SPA routing)

## Configuration Files

### `nginx.conf`
- Main Nginx configuration
- Global settings, security headers, compression
- Worker processes and connection handling

### `conf.d/default.conf`
- Server-specific configuration
- Upstream definitions for frontend/backend
- Location-based routing rules
- Rate limiting and caching policies

## Usage

### Starting the Stack
```bash
docker-compose up -d
```

### Accessing the Application
- **Frontend**: http://localhost:8080 (port 8080)
- **Backend API**: http://localhost:8080/api/
- **Health Check**: http://localhost:8080/health
- **Prisma Studio**: http://localhost:5555 (direct access, not proxied)

### Stopping the Stack
```bash
docker-compose down
```

## Security Best Practices Implemented

1. **Network Isolation**: Frontend/backend only accessible through Nginx
2. **Rate Limiting**: Prevents abuse and DDoS attacks
3. **Security Headers**: Protects against common web vulnerabilities
4. **Input Validation**: Proper proxy header forwarding
5. **Error Handling**: Custom error pages without information leakage

## Monitoring and Logs

Nginx logs are available in the container:
- Access logs: `/var/log/nginx/access.log`
- Error logs: `/var/log/nginx/error.log`

To view logs:
```bash
docker logs nginx
```

## Customization

### Adding HTTPS
To enable HTTPS, update the docker-compose.yml to mount SSL certificates and modify the server block in `default.conf`:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    # ... rest of configuration
}
```

### Adjusting Rate Limits
Modify the rate limiting zones in `nginx.conf`:
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=20r/s;  # Increase API rate
limit_req_zone $binary_remote_addr zone=login:10m rate=10r/m; # Increase login rate
```

### Adding New Routes
Add new location blocks in `default.conf`:
```nginx
location /special-api/ {
    proxy_pass http://backend;
    # ... proxy settings
}
```

## Benefits

✅ **Single Entry Point**: All traffic goes through port 8080/8443
✅ **Enhanced Security**: Multiple layers of protection
✅ **Better Performance**: Caching and compression
✅ **Load Balancing Ready**: Easy to add multiple backend instances
✅ **SSL Termination**: Centralized HTTPS handling
✅ **Development Friendly**: Prisma Studio still directly accessible 