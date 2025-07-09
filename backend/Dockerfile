# backend/Dockerfile
FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npx prisma db push 

EXPOSE 7532
CMD ["npm", "run", "start:dev"]
