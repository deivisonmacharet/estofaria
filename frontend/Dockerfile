# ── stage 1: build do React ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY public/ ./public/
COPY src/    ./src/
# a variável REACT_APP_API_URL será usada pelo React para chamar o backend
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# ── stage 2: Nginx serve os arquivos estáticos ──
FROM nginx:alpine
# copia build
COPY --from=builder /app/build /usr/share/nginx/html
# copia config do nginx que redireciona rotas SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
