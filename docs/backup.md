# Backup

This document defines what should be backed up from the home server.

The Git repository stores infrastructure configuration and deployment definitions. It is not a replacement for application data backups.

---

## Backup priorities

### Critical

The following data should be backed up:

```text
/home/s623/docker/immich/library
/home/s623/docker/immich/postgres

/home/s623/docker/crafty

/srv/obsidian/vaults
/srv/obsidian/config

/home/s623/docker/pihole/etc-pihole
/home/s623/docker/homepage/config
/home/s623/docker/uptime-kuma

jellyfin_jellyfin-config
monitoring_grafana-data
snapotter_snapotter-data

caddy_caddy_data
caddy_caddy_config
```

These contain application state, databases, configuration or user data.

---

## Minecraft

Minecraft data is stored in the Minecraft project's persistent `data` directory.

The complete directory should be included in backups:

```text
/home/s623/docker/minecraft/data
```

This includes the Minecraft world and server data.

---

## Crafty

Crafty stores its persistent data in:

```text
/home/s623/docker/crafty/backups
/home/s623/docker/crafty/logs
/home/s623/docker/crafty/servers
/home/s623/docker/crafty/config
/home/s623/docker/crafty/import
```

The important directories are:

```text
servers
config
backups
```

Logs are less critical and may be excluded from long-term backups.

---

## Replaceable data

The following data is generally replaceable:

```text
jellyfin_jellyfin-cache
immich_model-cache
```

Prometheus data may also be treated as replaceable when historical metrics are not considered critical.

---

## Secrets

Secrets must be backed up separately from Git.

Examples:

```text
.env
Portainer stack environment variables
Pi-hole password
database passwords
private keys
TLS-related secrets
Tailscale credentials
```

Secrets must never be committed to the repository.

---

## Git repository

The repository should contain:

```text
Compose definitions
Caddy configuration
Prometheus configuration
Homepage configuration
deployment documentation
storage documentation
backup documentation
recovery documentation
```

The repository should not contain:

```text
databases
media files
Minecraft worlds
Obsidian vaults
Docker volume data
passwords
API tokens
private keys
runtime databases
```

---

## Backup destination

The current infrastructure documentation does not define a finalized external backup destination or automated backup schedule.

These should be documented here once implemented.

A backup stored only on the same physical server should not be considered sufficient protection against complete server or storage failure.