# Home Server Infrastructure

This repository is the Git-based source of truth for the home server. It is designed around the deployment flow:

```text
Git repository
      ↓
Portainer
      ↓
Docker Stacks
      ↓
Home server
```

Each service is organized in its own stack directory under `stacks/` and can be deployed independently through Portainer.

The server is a Dell Inspiron 3583 running Fedora Linux 43 and Docker. It hosts personal services, media services, monitoring, network services, Minecraft infrastructure and internal web applications.

The infrastructure is designed primarily for **local network and private VPN access** and does not rely on exposing internal services directly to the public Internet.

---

## Repository layout

```text
home-server-infrastructure/
├── README.md
├── docs/
│   ├── backup.md
│   ├── recovery.md
│   └── storage.md
├── infrastructure/
│   ├── network/
│   └── scripts/
├── stacks/
│   ├── caddy/
│   ├── pihole/
│   ├── monitoring/
│   ├── jellyfin/
│   ├── crafty/
│   ├── immich/
│   ├── homepage/
│   ├── uptime-kuma/
│   ├── snapotter/
│   ├── docker-socket-proxy/
│   ├── glances/
│   ├── obsidian/
│   ├── minecraft/
│   ├── portainer/
│   └── typing-svg/
└── .gitignore
```

The stack directories are the deployment units. The repository keeps documentation and infrastructure references, while runtime data and secrets remain on the host or in external backups.

---

## Overview

### Server

| Component | Details |
|---|---|
| Hardware | Dell Inspiron 3583 |
| OS | Fedora Linux 43 Workstation |
| Architecture | x86-64 |
| Container runtime | Docker 29.6.2 |
| Docker Compose | 5.3.1 |
| Container networking | Docker bridge networks |
| Main Docker network | `server` |
| Firewall | firewalld |
| VPN | Tailscale |
| DNS | Pi-hole |
| Reverse proxy | Caddy |
| Container management | Portainer |

The primary Docker workspace is:

```text
/home/s623/docker
```

---

## Architecture

The server is built around several layers:

```text
                         ┌─────────────────────┐
                         │      Internet       │
                         └──────────┬──────────┘
                                    │
                              Tailscale VPN
                                    │
                         ┌──────────▼──────────┐
                         │       Server        │
                         │   Fedora Linux      │
                         └──────────┬──────────┘
                                    │
                     ┌──────────────┼──────────────┐
                     │              │              │
                  Pi-hole        Caddy         Docker
                     │              │              │
                  DNS only     Reverse Proxy    Containers
                                    │
                              Docker network
                                `server`
```

The server provides:

- local DNS resolution through Pi-hole;
- private remote access through Tailscale;
- reverse proxy through Caddy;
- containerized services through Docker;
- centralized container management through Portainer;
- monitoring through Prometheus, Grafana, cAdvisor and Node Exporter.

---

# Network

The server has two primary access paths.

### Local network

```text
192.168.0.105
```

Services that are published on the host can be accessed directly through the local network.

Example:

```text
http://192.168.0.105:<port>
```

### Tailscale

```text
100.81.82.102
```

Tailscale provides private VPN connectivity to the server from authorized devices.

Example:

```text
http://100.81.82.102:<port>
```

Tailscale is used instead of exposing administrative and internal services directly to the public Internet.

---

# DNS

Pi-hole is used as the local DNS server and network-wide DNS filter.

The server provides local DNS records under:

```text
.home.arpa
```

Example:

```text
portainer.home.arpa → 192.168.0.105
```

### Local service hostnames

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

# Request flow

For services exposed through Caddy, the normal request flow is:

```text
Client
  │
  ▼
Pi-hole DNS
  │
  └── service.home.arpa
          │
          ▼
    192.168.0.105
          │
          ▼
       Caddy
       :443
          │
          ▼
   Reverse proxy
          │
          ▼
 Docker container
```

For example:

```text
grafana.home.arpa
        │
        ▼
192.168.0.105
        │
        ▼
Caddy
        │
        ▼
grafana:3000
```

Containers connected to the same Docker network communicate using Docker container/service names instead of the server IP.

---

# Docker networking

A shared external Docker bridge network is used:

```text
server
```

Containers that need to communicate with Caddy or other internal services are connected to this network.

Example:

```yaml
networks:
  server:
    external: true
```

The server also has several Compose-specific networks for isolated projects.

---

# Services

## Infrastructure

| Service | Purpose |
|---|---|
| Fedora Linux | Host operating system |
| Docker | Container runtime |
| Docker Compose | Container orchestration |
| Portainer | Docker management |
| Caddy | Reverse proxy |
| Tailscale | Private VPN access |
| Pi-hole | DNS and DNS filtering |

## Monitoring

| Service | Purpose |
|---|---|
| Prometheus | Metrics collection |
| Grafana | Metrics visualization |
| Node Exporter | Host metrics |
| cAdvisor | Container metrics |
| Glances | System monitoring |
| Uptime Kuma | Service availability monitoring |

## Media and storage

| Service | Purpose |
|---|---|
| Jellyfin | Media streaming |
| Immich | Photo and video management |
| Snapotter | Screenshot/image service |
| Obsidian Remote | Remote Obsidian environment |

## Other services

| Service | Purpose |
|---|---|
| Homepage | Central service dashboard |
| Crafty Controller | Minecraft server management |
| Minecraft | Minecraft server |
| Typing SVG | Self-hosted README typing service |

---

# Reverse Proxy

Caddy is the main reverse proxy.

It listens on:

```text
80/tcp
443/tcp
```

The Caddy configuration is stored at:

```text
/home/s623/docker/caddy/Caddyfile
```

### Current routes

```text
jellyfin.home.arpa   → jellyfin:8096
grafana.home.arpa    → grafana:3000
prometheus.home.arpa → prometheus:9090
pihole.home.arpa     → pihole:80
immich.home.arpa     → immich-server:2283
portainer.home.arpa  → portainer:9000
crafty.home.arpa     → crafty:8443
home.home.arpa       → homepage:3000
uptime.home.arpa     → uptime-kuma:3001
snapotter.home.arpa  → snapotter:1349
glances.home.arpa    → glances:61208
typing.home.arpa     → typing-svg:8000
obsidian.home.arpa   → obsidian:8080
```

Caddy communicates with the containers through the shared `server` Docker network.

The Caddy administration API is bound only to:

```text
localhost:2019
```

---

# Publicly published host ports

Only a subset of the container ports are published directly on the host.

### SSH

```text
22/tcp
```

Used for server administration.

### Pi-hole DNS

```text
192.168.0.105:53/tcp
192.168.0.105:53/udp
```

Used as the network DNS server.

### Caddy

```text
0.0.0.0:80/tcp
0.0.0.0:443/tcp
```

Used for HTTP/HTTPS reverse proxy access.

### Crafty

```text
192.168.0.105:8443/tcp
0.0.0.0:25565/tcp
```

`8443` is the Crafty web interface.

`25565` is used for Minecraft server access.

Other container ports such as:

```text
3000
8096
9090
9000
3001
61208
8080
```

are normally **internal Docker ports** and are accessed through Caddy rather than published directly on the host.

---

# Firewall

The server uses `firewalld`.

Active zones include:

```text
FedoraWorkstation
docker
tailscale
```

### Local network

Interfaces:

```text
enp2s0
wlp3s0
```

### Docker

Docker bridge interfaces are assigned to the Docker firewall zone.

### Tailscale

```text
tailscale0
```

---

## Open development port range

The firewall currently allows:

```text
2500-8900/tcp
2500-8900/udp
```

on the main server and Tailscale firewall zones.

This allows development services to use ports inside this range without creating a separate firewall rule for every application.

Opening a firewall port does **not** automatically publish a Docker service.

A service must also:

1. publish the port through Docker, or
2. listen directly on the host.

---

# SSH

SSH is used for administration.

### Local network

```bash
ssh s623@192.168.0.105
```

### Tailscale

```bash
ssh s623@100.81.82.102
```

SSH hardening configuration:

```text
/etc/ssh/sshd_config.d/99-hardening.conf
```

Current configuration:

```text
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
```

SSH therefore uses public-key authentication and does not permit root login.

---

# Storage

The main Docker data directory is:

```text
/home/s623/docker
```

Persistent application data is stored using a combination of:

- bind mounts;
- Docker named volumes;
- dedicated service directories.

Examples:

```text
/home/s623/docker/immich/library
/home/s623/docker/immich/postgres
/home/s623/docker/pihole/etc-pihole
/home/s623/docker/homepage/config
/home/s623/docker/uptime-kuma
/home/s623/docker/crafty
```

Some services use Docker named volumes, for example:

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

---

# External storage

The server mounts network storage from another machine through SMB/CIFS.

### Movies

```text
/mnt/movies
```

Source:

```text
//192.168.0.103/Movies
```

Mounted read-only.

### Music

```text
/mnt/music
```

Source:

```text
//192.168.0.103/Music
```

Mounted read-write.

Jellyfin uses these mounts as media libraries.

---

# Monitoring

The monitoring stack consists of:

```text
Node Exporter
       │
       ▼
  Prometheus
       │
       ├── Node metrics
       └── cAdvisor metrics
              │
              ▼
           Grafana
```

Prometheus collects:

```text
node-exporter:9100
cadvisor:8080
```

Scraping interval:

```text
60 seconds
```

Prometheus data retention:

```text
15 days
```

Configuration:

```text
/home/s623/docker/prometheus/prometheus.yml
```

---

# Minecraft

Minecraft infrastructure is handled through Crafty Controller and a separate Minecraft Compose project.

Crafty provides:

- Minecraft server management;
- web administration;
- server files;
- backups;
- logs.

The Minecraft container uses:

```text
25565/tcp
```

The server is based on:

```text
Fabric
Minecraft 1.21.1
```

Minecraft data is stored separately from the container itself.

---

# Portainer

Portainer is used to manage Docker containers and Compose stacks.

Portainer stores its persistent data in:

```text
/home/s623/docker/portainer/data
```

The Docker socket is mounted into Portainer:

```text
/var/run/docker.sock
```

Portainer-managed Compose definitions are stored internally under:

```text
/home/s623/docker/portainer/data/compose
```

These files represent the current Portainer stack configuration but are considered runtime management data rather than the desired Git repository structure.

---

# Docker Compose projects

The infrastructure currently contains Compose definitions for:

```text
caddy
monitoring
jellyfin
immich
homepage
uptime-kuma
pihole
portainer
crafty
snapotter
docker-socket-proxy
glances
obsidian
minecraft
typing-svg
```

Some services are managed directly through Portainer, while others have local Compose files under `/home/s623/docker`.

---

# Docker Socket Proxy

Glances does not access the Docker socket directly.

Instead:

```text
Glances
   │
   ▼
Docker Socket Proxy
   │
   ▼
Docker socket
```

The Docker Socket Proxy exposes only the required read-oriented API endpoints.

Write-oriented Docker operations such as:

```text
POST
BUILD
EXEC
SERVICES
VOLUMES
NETWORKS
```

are disabled.

This reduces the Docker API permissions available to monitoring services.

---

# Security

The server is intended primarily for trusted local and private VPN access.

Security principles:

- services should not be exposed publicly unless required;
- administrative interfaces should preferably be accessed through Tailscale or Caddy;
- Docker-published ports should be minimized;
- internal databases should remain on Docker networks;
- passwords and API keys should be stored outside Git;
- SSH uses public-key authentication;
- root SSH login is disabled;
- Docker Socket access should be restricted;
- backups should be kept separately from the primary server.

---

# Secrets

Secrets must never be committed to this repository.

Examples:

```text
.env
.env.*
stack.env
*.pem
*.key
*.p12
*.pfx
id_*
```

Compose configurations should use environment variables for sensitive values.

Example:

```yaml
environment:
  DB_PASSWORD: ${IMMICH_DB_PASSWORD}
```

The actual value is stored in Portainer or another local secret-management mechanism.

---

# Backup strategy

The most important data to back up consists of:

```text
Application configuration
Databases
Immich library
Crafty server data
Minecraft data
Obsidian vaults
Persistent Docker volumes
Caddy data/configuration
Pi-hole configuration
Portainer configuration
```

Temporary/cache data can generally be recreated:

```text
Prometheus cache
Jellyfin cache
Immich ML model cache
temporary container files
```

The Git repository stores **configuration and infrastructure definitions**, not application databases or large persistent datasets.

---

# Recovery concept

A new server should be recoverable by:

```text
1. Install Fedora
2. Install Docker
3. Create Docker network `server`
4. Restore required configuration
5. Restore secrets
6. Restore persistent application data
7. Deploy Compose projects
8. Configure Pi-hole DNS
9. Configure Tailscale
10. Configure firewalld
11. Configure Caddy
12. Verify service connectivity
```

The goal of this repository is to make the infrastructure reproducible without storing sensitive or large runtime data in Git.

---

# Useful commands

### Containers

```bash
docker ps
docker ps -a
```

### Compose projects

```bash
docker compose ls
```

### Networks

```bash
docker network ls
docker network inspect server
```

### Volumes

```bash
docker volume ls
```

### Published ports

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

### Listening TCP ports

```bash
sudo ss -ltnp
```

### Listening UDP ports

```bash
sudo ss -lunp
```

### Firewall

```bash
sudo firewall-cmd --get-active-zones
sudo firewall-cmd --list-all-zones
```

### Tailscale

```bash
tailscale status
```

### DNS

```bash
dig @192.168.0.105 portainer.home.arpa
```

### Test local service

```bash
curl http://192.168.0.105:<port>
```

---

# Repository structure

The repository is intended to contain:

```text
home-server-infrastructure/
├── README.md
├── docker/
│   ├── caddy/
│   ├── monitoring/
│   ├── jellyfin/
│   ├── immich/
│   ├── homepage/
│   ├── uptime-kuma/
│   ├── pihole/
│   ├── portainer/
│   ├── crafty/
│   ├── snapotter/
│   ├── docker-socket-proxy/
│   ├── glances/
│   ├── obsidian/
│   └── minecraft/
└── docs/
    └── ...
```

The repository contains sanitized configuration and documentation.

Persistent runtime data remains on the server or in separate backups.