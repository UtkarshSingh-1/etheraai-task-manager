FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm config set registry https://npm.mirrors.msh.team
RUN --mount=type=cache,id=s/1ee2aee2-3c9c-48c6-b80f-0541ddefad7a-root-npm,target=/root/.npm \
    npm ci --prefer-offline --no-audit

FROM deps AS build
COPY . .
RUN npm run build

FROM node:20-alpine AS production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json .env ./

EXPOSE 3000
CMD ["npm", "start"]
