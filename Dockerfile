# -----------------------------------------------------------------------------
FROM alpine:3.18.6 AS build-npm
RUN apk add --no-cache \
      bash \
      npm

# Installing a newer npm helps avert timeouts somehow.
RUN npm install -g npm@10.5.1

# Speed up build by caching node_modules separately.
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci

# -----------------------------------------------------------------------------
FROM alpine:3.18.6 AS hardhat
RUN apk add --no-cache \
      npm
WORKDIR /src
COPY --from=build-npm /src/node_modules node_modules
COPY contracts/evm contracts/evm
COPY \
      tsconfig.json \
      ./
WORKDIR /src/contracts/evm
RUN npx hardhat compile
ENTRYPOINT [ "npx", "hardhat", "node", "--hostname", "0.0.0.0" ]

# -----------------------------------------------------------------------------
FROM node:16.20.1-bookworm AS backend
RUN apt-get update \
&& DEBIAN_FRONTEND=noninteractive \
   apt-get install --no-install-recommends --assume-yes \
   postgresql-client \
&& apt-get clean
WORKDIR /usr/src/app
# copy all folders in
COPY . .
EXPOSE ${WEBSERVER_PORT}
RUN npm install tsc -g
WORKDIR /usr/src/app/paima-engine
RUN npm i
RUN npx tsc --build tsconfig.build.json
WORKDIR /usr/src/app/tower-defense
RUN npm i
RUN npx tsc --build tsconfig.build.json
WORKDIR /usr/src/app

# Add Tini
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

CMD ["node", "--experimental-specifier-resolution=node", "/usr/src/app/tower-defense/backend/build/index.js"]
