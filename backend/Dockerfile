# backend/Dockerfile
FROM node:20

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && \
    ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

# Create and activate virtual environment
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

COPY package*.json ./
RUN npm install

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .

RUN npx prisma generate
RUN npx prisma db push 

EXPOSE 7532
CMD ["npm", "run", "start:dev"]
