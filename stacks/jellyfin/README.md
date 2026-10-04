# Jellyfin

Jellyfin is the media server.

## Role

Jellyfin provides streaming and management of movies and music stored on external SMB storage.

## Access

```text
https://jellyfin.home.arpa
```

Caddy forwards requests to:

```text
jellyfin:8096
```

## Network

```text
server
```

## Storage

Persistent Docker volumes:

```text
jellyfin_jellyfin-config
jellyfin_jellyfin-cache
```

External media:

```text
/mnt/movies
/mnt/music
```

Movies are mounted read-only.

Music is mounted read-write.

## Hardware

Jellyfin has access to:

```text
/dev/dri
```

for hardware-related media processing.

## Backup

Required:

```text
jellyfin_jellyfin-config
```

Cache data can be recreated.

Media files are stored on external SMB storage and should be backed up separately if required.

## Deployment

Managed as a Docker Stack through Portainer.
