# Stage 1 — Build the app
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# Copy files
COPY package.json pnpm-lock.yaml* ./
COPY . .

# Install dependencies and build
RUN pnpm install --frozen-lockfile
RUN pnpm build


# Stage 2 — Run the app
FROM node:22-alpine AS runner
WORKDIR /app

# Install pnpm (needed for runtime)
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# Copy only the built output and necessary files
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

# Expose the default Nuxt port
EXPOSE 3000

# Start the app
CMD ["node", ".output/server/index.mjs"]