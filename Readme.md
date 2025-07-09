# Project Docker Setup

This project contains three services managed with Docker Compose: `frontend`, `backend`, and `camembert-api`.

## Prerequisites

- Docker
- Docker Compose
- Make (optional, but recommended for convenience)

## Usage

### Build all images

```bash
make build
```

### Start all services (detached)

```bash
make up
```

### Stop all services

```bash
make down
```

### View logs for all services (follow mode)

```bash
make logs
```

### Clean up everything (stop containers, remove images, volumes, and orphans)

```bash
make clean
```

## Notes

- Frontend service runs `npm run dev` on port 3000
- Backend service runs `npm run start:dev` and Prisma Studio on ports 7532 and 5555
- Camembert API service runs on port 7533 with environment variables for host, port, log level, and model path

---
