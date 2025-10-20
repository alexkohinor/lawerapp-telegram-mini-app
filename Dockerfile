# TimeWeb Cloud оптимизированный Dockerfile
FROM node:18-alpine

# Установка системных зависимостей
RUN apk add --no-cache \
    openssl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Рабочая директория
WORKDIR /app

# Копирование файлов конфигурации
COPY package*.json .npmrc ./
COPY .nvmrc ./

# Установка зависимостей с оптимизацией
RUN npm ci --omit=dev --prefer-offline --no-audit --no-fund \
    && npm cache clean --force

# Копирование исходного кода
COPY . .

# Генерация Prisma клиента (если нужно)
RUN npx prisma generate || true

# Сборка приложения
RUN npm run build

# Создание директории для статических файлов
RUN mkdir -p /app/out

# Копирование собранных файлов
RUN cp -r .next/server/app/* /app/out/ 2>/dev/null || true \
    && cp -r public/* /app/out/ 2>/dev/null || true

# Установка nginx для статических файлов
RUN apk add --no-cache nginx

# Конфигурация nginx
RUN echo 'server { \
    listen 80; \
    root /app/out; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /_next/static/ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/http.d/default.conf

# Открытие порта
EXPOSE 80

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]