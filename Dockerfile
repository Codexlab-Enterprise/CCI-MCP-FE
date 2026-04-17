FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn build
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app .
EXPOSE 3000
CMD ["yarn", "start"]