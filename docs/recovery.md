# Recovery

This document describes the general process for rebuilding the home server after a failure or migration to new hardware.

The goal is to recreate the Docker infrastructure from the repository and restore persistent application data from backups.

---

## Recovery order

The recommended recovery sequence is:

```text
1. Install Fedora
2. Configure networking
3. Install Docker
4. Install Portainer
5. Create external Docker network `server`
6. Configure Tailscale
7. Configure firewalld
8. Configure SMB mounts
9. Connect Portainer to the Git repository
10. Deploy required Stacks
11. Restore persistent application data
12. Restore secrets / environment variables
13. Verify Pi-hole
14. Verify Caddy
15. Verify remaining services
```

---

## Host configuration

The new server should provide:

```text
Fedora Linux
Docker
Docker Compose
firewalld
Tailscale
```

The host should then recreate the required network:

```text
server
```

This network is used by Caddy and the services it reverse-proxies.

---

## Restore persistent data

Restore bind-mounted application data to the expected paths.

Important locations include:

```text
/home/s623/docker/immich/library
/home/s623/docker/immich/postgres
/home/s623/docker/pihole/etc-pihole
/home/s623/docker/homepage/config
/home/s623/docker/uptime-kuma
/home/s623/docker/crafty

/srv/obsidian/vaults
/srv/obsidian/config

/home/s623/docker/minecraft/data
```

Restore required Docker named volumes separately.

---

## Restore secrets

Restore environment variables and other secrets separately.

Examples include:

```text
IMMICH_DB_PASSWORD
PIHOLE_PASSWORD
```

Secrets must be configured before starting services that depend on them.

---

## Deploy services

Deploy the infrastructure stacks through Portainer.

Recommended dependency order:

```text
1. Docker network
2. Pi-hole
3. Caddy
4. Docker Socket Proxy
5. Monitoring
6. Remaining services
```

Services that depend on the `server` network should only be started after that network exists.

---

## DNS verification

After Pi-hole is restored, verify local DNS records.

Example:

```bash
dig @192.168.0.105 portainer.home.arpa
```

The hostname should resolve to the server's LAN address.

---

## Reverse proxy verification

After Caddy is restored, verify the configured `.home.arpa` routes.

Examples:

```text
jellyfin.home.arpa
grafana.home.arpa
prometheus.home.arpa
pihole.home.arpa
immich.home.arpa
portainer.home.arpa
crafty.home.arpa
home.home.arpa
uptime.home.arpa
snapotter.home.arpa
glances.home.arpa
typing.home.arpa
obsidian.home.arpa
```

---

## Application verification

Each service should be checked after deployment.

Verify:

```text
container status
Docker network connectivity
persistent storage
application logs
web interface
DNS resolution
reverse proxy access
```

---

## Media storage

Jellyfin depends on the external SMB mounts:

```text
/mnt/movies
/mnt/music
```

These mounts must be restored and available before Jellyfin is expected to access its media libraries.

---

## Recovery principle

The Git repository provides:

```text
Infrastructure configuration
Service configuration
Deployment definitions
Documentation
```

Backups provide:

```text
Application data
Databases
User data
Persistent volumes
Secrets
```

Both are required for a complete recovery.

A fresh server should therefore be recoverable without relying on the original containers themselves.