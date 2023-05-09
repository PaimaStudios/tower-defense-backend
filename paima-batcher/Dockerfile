# Common build stage
FROM node:16.17.0 as common-build-stage

#RUN apk add --no-cache python3 make g++

COPY . ./app

WORKDIR /app

RUN npm install

RUN npm run build

EXPOSE 3330

# Development build stage
FROM common-build-stage as development-build-stage

ENV NODE_ENV development

CMD ["npm", "run", "dev"]

# Production build stage
FROM common-build-stage as production-build-stage

ENV NODE_ENV production

CMD ["npm", "run", "start"]
