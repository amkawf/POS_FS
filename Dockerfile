FROM node:22-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/pos/package.json ./apps/pos/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter pos build

# stage 2
FROM nginx:alpine

#copy ke web root nginx
COPY --from=builder /app/apps/pos/dist /usr/share/nginx/html

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]