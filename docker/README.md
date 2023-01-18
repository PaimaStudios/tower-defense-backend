# Paima Catapult Docker Setup

## How to use

Paima games are structured as a set of npm packages for the generic Paima Engine, and a set of npm packages for each individual game.

Dockerfiles can't traverse their parent folders, so copy all the files in this folder to a root folder containing both the `paima-engine` folder and the game (in this case `catapult`) folder. There you can run the following commands.

## Useful commands

### Build or Rebuild containers

`docker compose build`

### Start containers

`docker compose up`

### Check running container names

`docker container ls`

### Inspect database

`docker exec -ti <container-name> psql -U postgres

### Start parallel containers

`docker compose -p replica up`
`replica` here being a name you give it. The extra containers should appear in `docker container ls`.

### Inspect the file system in the container

`docker exec -ti <container-name> ls`

### Copy files from container to host

`docker cp <container-name>:path/to/file path/in/host`
e.g. `docker cp paima-catapult-1:/usr/src/app/snapshots/paima-snapshot-2000.sql' .`
