FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3400
COPY --from=build /app/.output ./.output
EXPOSE 3400
CMD ["node", ".output/server/index.mjs"]
