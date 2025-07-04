# Mock Authentication & API System

This frontend now runs completely independently with mock authentication and API endpoints, allowing you to develop the UI without a backend dependency.

## 🔐 Authentication

**Login Credentials:**
- Username: `Admin`
- Password: `Admin`

The system will authenticate you as an admin user with full access to all dashboard features.

## 🐳 Docker Usage

```bash
# Build and run the frontend
docker-compose build frontend
docker-compose up frontend -d

# Check logs
docker-compose logs frontend

# Stop the container
docker-compose stop frontend
```

The application will be available at: **http://localhost:3000**

## 📡 Available Mock API Endpoints

All endpoints require the mock JWT token in the Authorization header.

### Authentication
- `POST /api/auth/login` - Login with Admin:Admin
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout
- `POST /api/auth/2fa/verify` - 2FA verification

### Dashboard Data
- `GET /api/companies` - Company metrics and list
- `GET /api/users/ocp/agents` - OCP agents data
- `GET /api/users/ocp/suppliers` - Suppliers data
- `GET /api/ocp/purchase-requests` - Purchase requests
- `GET /api/ocp/purchase-requests/drafts` - Draft purchase requests
- `GET /api/ocp/bids` - Bids data
- `GET /api/departements` - Department analytics
- `GET /api/reports` - Reports with pagination and filtering

### System
- `GET /api/notifications` - User notifications
- `GET /api/logs` - System activity logs

## 🎯 Mock Data Features

- **Realistic Data**: All endpoints return realistic mock data with proper structure
- **Pagination**: Reports API supports pagination with `page` and `limit` parameters
- **Filtering**: Reports API supports `search` and `status` filtering
- **Authentication**: Proper JWT-style authentication flow
- **Error Handling**: Proper HTTP status codes and error responses

## 🔧 Development Notes

- **No Backend Required**: All API calls are handled by Next.js API routes
- **Persistent Session**: Login state persists until manually logged out
- **Safe for Development**: All data is mock data, safe to experiment with
- **Docker Only**: Configured specifically for Docker development environment

## 🚀 Next Steps

1. **Access the App**: Navigate to http://localhost:3000
2. **Login**: Use Admin:Admin credentials
3. **Explore Dashboard**: All dashboard features work with mock data
4. **Develop Features**: Add new components and pages as needed
5. **Mock New APIs**: Add new API routes in `src/app/api/` as needed

## 📂 File Structure

```
frontend/src/app/api/
├── auth/
│   ├── login/route.ts
│   ├── me/route.ts
│   ├── logout/route.ts
│   └── 2fa/verify/route.ts
├── companies/route.ts
├── users/ocp/
│   ├── agents/route.ts
│   └── suppliers/route.ts
├── ocp/
│   ├── purchase-requests/
│   │   ├── route.ts
│   │   └── drafts/route.ts
│   └── bids/route.ts
├── departements/route.ts
├── reports/route.ts
├── notifications/route.ts
└── logs/route.ts
```

All mock APIs follow the same pattern with authentication checks and realistic response data. 