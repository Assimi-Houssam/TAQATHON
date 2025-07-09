FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Download model if it doesn't exist
RUN mkdir -p app/models && \
    if [ ! -f app/models/model.pth ]; then \
        echo "Model not found. Downloading..."; \
        curl -L -o app/models/model.pth https://github.com/echaoubi/echaoubi/releases/download/model/model.pth; \
    else \
        echo "Model already exists."; \
    fi

# Create non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 7533

# Run the application
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7533"]
