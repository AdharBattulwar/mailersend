## Multi-stage Dockerfile for Bun + Hono + MailerSend
# Uses the official oven/bun image

FROM oven/bun:latest AS base
WORKDIR /app

ARG ENV_FILE=.env
COPY . .

COPY ${ENV_FILE} .env

# Install production dependencies
RUN bun install --production

ENV NODE_ENV=production
# Allow port to be configured from env; default used in examples is 3001
ENV PORT=3001

EXPOSE 3001

# Start the app (Bun can run TypeScript directly)
CMD ["bun", "src/index.ts"]
