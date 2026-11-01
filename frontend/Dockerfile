# Install and build inside the image so the host does not need Node.js or npm.
FROM node:22.20.0-alpine
WORKDIR /app
# Vite writes a bundled config into node_modules/.vite-temp at startup, so the app user owns /app.
RUN chown node:node /app
USER node

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY --chown=node:node . .
RUN npm run build

EXPOSE 5173
# vite preview serves dist/ and proxies /api to the backend (see vite.config.js).
CMD ["npm", "run", "preview"]
