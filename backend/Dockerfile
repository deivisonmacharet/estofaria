# ── stage 1: instalar dependências ──
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ── stage 2: imagem final enxuta ──
FROM node:20-alpine
WORKDIR /app

# cria usuário não-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY src/                           ./src/
COPY package.json                   ./package.json

# pasta de uploads (volume externo vai ser montado aqui)
RUN mkdir -p public/uploads && chown -R appuser:appgroup public

USER appuser
EXPOSE 3001
CMD ["node", "src/index.js"]
