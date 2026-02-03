FROM node:22-slim

WORKDIR /usr/src/app

# Install dependencies for Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

RUN pnpm run prisma:generate:docker

EXPOSE 3002

CMD ["pnpm", "run", "start:debug"]