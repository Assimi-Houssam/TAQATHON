# Taqathon | AI-Powered Datacenter Anomaly Management

**Taqathon** is a high-stakes, week-long sprint project designed to modernize datacenter operations. It provides an end-to-end pipeline for detecting infrastructure anomalies, generating actionable workplans, and tracking them through to resolution.
At its core, Taqathon uses a _fine-tuned CamemBERT model_ that achieves 90% trust (accuracy) in understanding and categorizing technical reports specifically within the French-speaking industrial context of the TAQA team.

## The AI Engine: CamemBERT 
  While standard LLMs struggle with niche industrial jargon, Taqathon’s intelligence is custom-tailored:
  - **Base Model** : CamemBERT
  - **Custom Dataset** : Fine-tuned on 6,000+ real-world data entries provided by the TAQA expert team.
  - **Performance** : Reached a 90% trust rating, accurately identifying critical anomalies , Specialized in French technical terminology

## The Workflow Pipeline
Anomalies are reported to the datacenter (via manual entry or by excel) -> The fine-tuned CamemBERT model processes the report to determine severity. -> A structured workplan is automatically opened for the detected anomaly. -> The system tracks every step of the "Suivi" (follow-up) process until the issue is officially closed.

## Tech Stack
  - Frontend : NextJs
  - Business backend : Nestjs
  - AI Service : FastApi
  - Model : CammemBert

### Highlights
Fully functional prototype developed within a 7-day hackathon timeframe.  , the 90% accuracy milestone was achieved through rigorous data cleaning and specialized fine-tuning. Next.js provides a smooth UX, while FastAPI ensures the AI responses are served with minimal latency.

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

