FROM node:16.17.0
RUN apt-get update \
&& echo "deb http://apt-archive.postgresql.org/pub/repos/apt/ stretch-pgdg main" > /etc/apt/sources.list.d/pgdg.list \ 
&& curl -s https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
&& apt-get -y update \
&& DEBIAN_FRONTEND=noninteractive \
   apt-get install --no-install-recommends --assume-yes \
   postgresql-client-14
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
