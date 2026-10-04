# Storage

This document describes the storage layout used by the home server.

## Overview

The server uses three main storage mechanisms:

- Docker bind mounts;
- Docker named volumes;
- external SMB/CIFS storage.

The main Docker workspace is:

```text
/home/s623/docker
```

Application data is stored outside the container writable layers so that containers can be recreated without losing persistent data.

---

## Bind mounts

Bind mounts are used when application data should remain directly accessible from the host filesystem.

Important persistent directories include:

```text
/home/s623/docker/pihole/etc-pihole
/home/s623/docker/immich/library
/home/s623/docker/immich/postgres
/home/s623/docker/homepage/config
/home/s623/docker/uptime-kuma
/home/s623/docker/crafty
/srv/obsidian/vaults
/srv/obsidian/config
```

These directories should be treated as application data and managed independently of container lifecycle.

---

## Docker named volumes

The server currently uses the following persistent Docker volumes:

```text
caddy_caddy_data
caddy_caddy_config

immich_model-cache

jellyfin_jellyfin-cache
jellyfin_jellyfin-config

monitoring_grafana-data
monitoring_prometheus-data

snapotter_snapotter-data
```

Named volumes are managed by Docker and persist independently of the container using them.

---

## Volume categories

### Important application data

These contain data that should normally be included in backups:

```text
jellyfin_jellyfin-config
monitoring_grafana-data
snapotter_snapotter-data
caddy_caddy_data
caddy_caddy_config
```

### Replaceable/cache data

These can generally be recreated:

```text
jellyfin_jellyfin-cache
immich_model-cache
monitoring_prometheus-data
```

The exact backup policy may depend on how much historical monitoring data is considered valuable.

---

## External storage

The server mounts media storage from another machine using SMB/CIFS.

### Movies

```text
/mnt/movies
```

Remote source:

```text
//192.168.0.103/Movies
```

The mount is read-only.

### Music

```text
/mnt/music
```

Remote source:

```text
//192.168.0.103/Music
```

The mount is read-write.

Jellyfin uses these mounts as its media libraries.

---

## Storage principles

Persistent application data should not depend on the lifecycle of an individual container.

The repository stores configuration and deployment definitions, while application data remains on the server or in external backups.

Large datasets such as media libraries should not be committed to Git.

Docker named volumes are persistent Docker-managed storage and must be backed up separately when their contents are important.