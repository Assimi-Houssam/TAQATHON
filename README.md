# 🏢 AChat - OCP Procurement Platform

A modern procurement platform built with NestJS, Next.js, and Keycloak authentication.

## 🚀 Quick Start

```bash
# 1. Clone and setup
git clone <repository>
cd OCP-achat-pl

# 2. Start all services with Docker
chmod +x setup.sh
./setup.sh
```

## 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | - |
| **Backend API** | http://localhost:1337/api | - |
| **API Docs** | http://localhost:1337/api/docs | - |
| **Keycloak Admin** | http://localhost:8080 | admin/admin123 |
| **MinIO Console** | http://localhost:9001 | minioadmin/minioadmin123 |
| **Email Testing** | http://localhost:8025 | - |

## 📁 Project Structure

```
OCP-achat-pl/
├── 🐳 Docker & Setup
│   ├── docker-compose.yml     # Service orchestration
│   ├── setup.sh              # One-command setup
│   ├── env.example           # Environment template
│   └── create-db-users.sh    # Database initialization
├── 📚 Documentation
│   └── docs/                 # Setup guides and summaries
├── 🛠️ Applications
│   ├── achat-backend/        # NestJS API
│   ├── achat-frontend/       # Next.js Web App
│   └── keycloak/            # Authentication server
└── 📖 README.md             # This file
```

## 🛠️ Development

### Prerequisites
- Docker & Docker Compose
- Git

### Common Commands
```bash
# Start services
./setup.sh
# or
docker-compose up -d

# View logs
docker-compose logs -f backend

# Database migrations
docker-compose exec backend npm run migration:run

# Stop services
docker-compose down
```

### Configuration

1. **Initial Setup**: Run `./setup.sh` - creates `.env` from template
2. **Keycloak**: Configure realm and client at http://localhost:8080
3. **Environment**: Update `.env` with real credentials for production

## 🏗️ Architecture

- **Backend**: NestJS with TypeORM, PostgreSQL, Redis, Keycloak
- **Frontend**: Next.js with TypeScript, Tailwind CSS
- **Storage**: MinIO for file uploads
- **Email**: MailHog for development testing
- **Queue**: Bull/Redis for background jobs

## 📚 Documentation

- **[Docker Setup Guide](docs/README-DOCKER.md)** - Detailed Docker instructions
- **[Setup Summary](docs/SETUP-SUMMARY.md)** - What was configured and fixed

## 🤝 Contributing

1. Clone the repository
2. Run `./setup.sh` to start local environment
3. Make your changes
4. Test with `docker-compose logs -f`
5. Submit a pull request

## 📝 License

[Add your license information here]

```
achat-frontend
├── Dockerfile
├── README.md
├── colorthief.d.ts
├── components.json
├── global.d.ts
├── messages
│   ├── en.json
│   └── fr.json
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── appLogoIcon.png
│   ├── background.svg
│   ├── favicon.ico
│   ├── focp_building.png
│   ├── focp_logo.png
│   ├── logo-1-slogan-2.png
│   ├── logo-white.webp
│   ├── macmini_1.jpg
│   ├── macmini_2.jpg
│   ├── mona_lisa.png
│   ├── monk.png
│   ├── supp.png
│   ├── treizeTrenteSeptLogo.png
│   └── treizeTrenteSeptLogoBlack.png
├── src
│   ├── app
│   │   ├── [locale]
│   │   ├── api
│   │   ├── fonts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── not-found.tsx
│   ├── components
│   │   ├── app-sidebar.tsx
│   │   ├── language-switcher.tsx
│   │   └── ui
│   ├── config
│   │   └── company-registration-steps.ts
│   ├── context
│   │   ├── ChatContext.tsx
│   │   ├── react-query.tsx
│   │   ├── stepper-context.tsx
│   │   └── user-context.tsx
│   ├── hooks
│   │   └── use-mobile.tsx
│   ├── i18n
│   │   ├── request.ts
│   │   └── routing.ts
│   ├── lib
│   │   ├── auth.ts
│   │   ├── axios.ts
│   │   ├── purchase-request.ts
│   │   └── utils.ts
│   ├── middleware.ts
│   └── types
│       ├── EntityProfile.ts
│       └── company-form-schema.ts
├── tailwind.config.ts
└── tsconfig.json
```

