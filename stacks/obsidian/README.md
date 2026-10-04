# Obsidian Remote

Obsidian Remote provides a remotely accessible Obsidian environment.

## Role

It runs Obsidian in a container and exposes the environment through a web interface.

## Access

```text
https://obsidian.home.arpa
```

Caddy forwards requests to:

```text
obsidian:8080
```

## Network

```text
server
```

## Storage

Obsidian vaults:

```text
/srv/obsidian/vaults
```

Obsidian configuration:

```text
/srv/obsidian/config
```

Both directories are persistent bind mounts.

## Runtime

The container runs with:

```text
PUID=1000
PGID=1000
TZ=Europe/Warsaw
CUSTOM_PORT=8080
```

## Backup

Required:

```text
/srv/obsidian/vaults
/srv/obsidian/config
```

The vaults are the most important data.

## Deployment

Managed as a Docker Stack through Portainer.
