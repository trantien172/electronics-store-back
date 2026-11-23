# Bước 1: Build ứng dụng
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy toàn bộ code (ở môi trường dev sẽ được volume ghi đè)
COPY . .

EXPOSE 3001

# Chạy NestJS ở chế độ Watch Mode (Hot Reload)
CMD ["npm", "run", "start:dev"]
