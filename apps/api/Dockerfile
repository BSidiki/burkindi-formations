FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN npm install --no-audit --no-fund \
 && npm run build -w @burkindi/shared-types \
 && npm run build -w @burkindi/api \
 && npx prisma generate --schema apps/api/prisma/schema.prisma
ENV NODE_ENV=production
CMD ["node", "apps/api/dist/main.js"]
