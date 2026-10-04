# Immich

Immich is the photo and video management service of the home server.

## Role

- photo and video storage;
- web interface;
- image processing and machine learning;
- PostgreSQL database;
- Redis/Valkey for internal service communication.

## Access

```text
https://immich.home.arpa
```

Caddy forwards requests to:

```text
immich-server:2283
```

## Network

```text
server
```

All Immich containers are connected to the shared Docker network.

## Storage

Persistent data:

```text
/home/s623/docker/immich/library
/home/s623/docker/immich/postgres
```

The ML model cache is stored in a Docker named volume.

## Database

Immich uses PostgreSQL with the required vector extensions.

The database is part of the Immich stack.

Database credentials are provided through environment variables and must not be stored in Git.

## Backup

Required:

- Immich library;
- PostgreSQL data;
- Immich configuration.

ML model cache can be recreated.

## Deployment

Managed as a Docker Stack through Portainer.

The required external Docker network server must exist before deployment.
