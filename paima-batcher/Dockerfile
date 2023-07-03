# Common build stage
FROM node:16.20.1-bookworm as common-build-stage
WORKDIR /app
COPY . .
RUN npm i && npm run build
EXPOSE 3330

# Development build stage
FROM common-build-stage as development-build-stage
ENV NODE_ENV development
CMD ["npm", "run", "dev"]

# Production build stage
FROM common-build-stage as production-build-stage
ENV NODE_ENV production
CMD ["npm", "run", "start"]
