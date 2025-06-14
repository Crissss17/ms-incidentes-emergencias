# Dockerfile para Microservicio de Incidentes
FROM node:18-alpine AS builder

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar todas las dependencias (incluyendo dev para build)
RUN npm install --legacy-peer-deps && npm cache clean --force

# Copiar código fuente
COPY src/ ./src/

# Compilar TypeScript
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Configurar directorio de trabajo
WORKDIR /app

# Copiar dependencias de producción
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Copiar aplicación compilada
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Cambiar a usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Comando de inicio
CMD ["node", "dist/main.js"]