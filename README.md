# Home Server Infrastructure

Documentation and configuration notes for my home server.

## Overview

The server runs Fedora Linux and hosts multiple services using Docker Compose.

### Main access methods

| Method | Address |
|---|---|
| Local network | `192.168.0.105` |
| Tailscale | `100.81.82.102` |
| SSH | `22/tcp` |
| Reverse proxy | Caddy |
| Local DNS | Pi-hole |
| Container management | Portainer |

---

## Network

The server has two main ways to access services.

### Local network

```text
192.168.0.105:<port>
```

### Tailscale

```text
100.81.82.102:<port>
```

Tailscale allows remote access to the server without exposing services directly to the public internet.

---

## Local DNS and Caddy

Pi-hole provides local DNS records.

Example:

```text
portainer.home.arpa → 192.168.0.105
```

The `.home.arpa` domain is used for local home-network services.

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
```

### Request flow

```text
Browser
   │
   ▼
Pi-hole DNS
   │
   └── service.home.arpa → 192.168.0.105
                              │
                              ▼
                         Caddy :443
                              │
                              ▼
                   Reverse proxy by hostname
                              │
                              ▼
                       Docker container
```

Pi-hole resolves the hostname to the server IP.

Caddy then checks the requested hostname and forwards the request to the corresponding Docker container and port.

Example:

```caddyfile
portainer.home.arpa {
    reverse_proxy portainer:9000
}
```

This means that requests to `portainer.home.arpa` are forwarded to the Portainer container on port `9000`.

---

## Main services

| Service | Purpose |
|---|---|
| Fedora Linux | Operating system |
| Docker | Container runtime |
| Docker Compose | Container orchestration |
| Portainer | Docker management UI |
| Caddy | Reverse proxy |
| Pi-hole | Local DNS and network-wide DNS filtering |
| Tailscale | Remote private network access |
| Jellyfin | Media server |
| Immich | Photo and video management |
| Grafana | Metrics and telemetry visualization |
| Prometheus | Metrics collection |
| Uptime Kuma | Service monitoring |
| Crafty Controller | Minecraft server management |
| Homepage | Service dashboard |

---

## Docker Compose projects

Current Compose projects:

```text
caddy
crafty
homepage
immich
jellyfin
kuma
monitoring
pihole
portainer
```

List running containers:

```bash
docker ps
```

List Compose projects:

```bash
docker compose ls
```

---

## Docker ports

Docker Compose port format:

```text
HOST_PORT:CONTAINER_PORT
```

Example:

```yaml
ports:
  - "8080:8080"
```

This maps port `8080` on the host to port `8080` inside the container.

The service can then be accessed through:

```text
http://192.168.0.105:8080
http://100.81.82.102:8080
```

provided that:

- the container is running;
- the port is published by Docker;
- the firewall allows the connection;
- the service is listening on the expected port.

### Example

```yaml
services:
  backend:
    ports:
      - "8080:8080"

  pgadmin:
    ports:
      - "5050:80"
```

Access:

```text
Backend: http://192.168.0.105:8080
Backend: http://100.81.82.102:8080

pgAdmin: http://192.168.0.105:5050
pgAdmin: http://100.81.82.102:5050
```

---

## Development port range

The firewall allows the following development port range:

```text
2500-8900/tcp
2500-8900/udp
```

This makes it possible to run different projects without adding a new firewall rule for every individual port.

For example:

```text
8080  → backend
5050  → pgAdmin
5173  → frontend
7000  → another service
8000  → another application
```

Opening a firewall port does not automatically expose a service. A service must also publish that port through Docker Compose or listen directly on the host.

---

## Firewall

The server uses `firewalld`.

### Active zones

```text
FedoraWorkstation
  interfaces:
    wlp3s0
    enp2s0

docker
  interfaces:
    Docker bridge interfaces

tailscale
  interface:
    tailscale0
```

### Firewall zones

- `FedoraWorkstation` — local network interfaces.
- `docker` — Docker bridge interfaces.
- `tailscale` — Tailscale interface.

### Show active zones

```bash
sudo firewall-cmd --get-active-zones
```

### Show firewall configuration

```bash
sudo firewall-cmd --zone=FedoraWorkstation --list-all
sudo firewall-cmd --zone=tailscale --list-all
```

### Reload firewall

```bash
sudo firewall-cmd --reload
```

### Development TCP ports

```bash
sudo firewall-cmd --permanent \
  --zone=FedoraWorkstation \
  --add-port=2500-8900/tcp

sudo firewall-cmd --permanent \
  --zone=tailscale \
  --add-port=2500-8900/tcp
```

### Development UDP ports

```bash
sudo firewall-cmd --permanent \
  --zone=FedoraWorkstation \
  --add-port=2500-8900/udp

sudo firewall-cmd --permanent \
  --zone=tailscale \
  --add-port=2500-8900/udp
```

### Apply changes

```bash
sudo firewall-cmd --reload
```

### Check allowed ports

```bash
sudo firewall-cmd --zone=FedoraWorkstation --list-ports
sudo firewall-cmd --zone=tailscale --list-ports
```

### Security notes

- The development port range is intended for LAN and Tailscale access.
- No router port forwarding should be configured for this range.
- Docker-published ports must be reviewed before exposing new services.
- Internal services such as PostgreSQL and Redis should not be published unless remote access is required.
- Firewall rules do not replace application-level authentication.
- Docker manages its own networking and NAT rules, so published Docker ports should be checked separately.

---

## SSH

SSH is used for remote server administration.

### Access through LAN

```bash
ssh s623@192.168.0.105
```

### Access through Tailscale

```bash
ssh s623@100.81.82.102
```

### SSH hardening

The SSH hardening configuration is stored in:

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

This means:

- password authentication is disabled;
- keyboard-interactive authentication is disabled;
- public-key authentication is enabled;
- root login through SSH is disabled.

### Validate SSH configuration

```bash
sudo sshd -t
```

### Reload SSH

```bash
sudo systemctl reload sshd
```

### Check SSH port

```bash
sudo ss -ltnp | grep ':22'
```

### Security notes

SSH access requires a configured public key.

Before changing SSH configuration, verify that a second SSH session works correctly. Do not close the only working session until the new configuration has been tested.

---

## Useful Docker commands

### List containers

```bash
docker ps
```

Show all containers, including stopped ones:

```bash
docker ps -a
```

### List Compose projects

```bash
docker compose ls
```

### Show project status

```bash
docker compose ps
```

### Start a project

```bash
docker compose up -d
```

### Stop a project

```bash
docker compose down
```

### Restart a project

```bash
docker compose up -d
```

### View logs

```bash
docker compose logs -f
```

View logs for one service:

```bash
docker compose logs -f backend
```

### Restart one service

```bash
docker compose restart backend
```

### Inspect a container

```bash
docker inspect <container_name>
```

### Show published ports

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

### Show Docker networks

```bash
docker network ls
```

### Inspect a Docker network

```bash
docker network inspect <network_name>
```

---

## Local full-stack development project

The local full-stack project contains:

- PostgreSQL;
- backend;
- Grafana LGTM stack;
- pgAdmin;
- optional frontend.

### Services and ports

| Service | Host port | Container port |
|---|---:|---:|
| PostgreSQL | 5432 | 5432 |
| Backend | 8080 | 8080 |
| Grafana/LGTM | 3000 | 3000 |
| OTLP gRPC | 4317 | 4317 |
| OTLP HTTP | 4318 | 4318 |
| pgAdmin | 5050 | 80 |

### Example Compose configuration

```yaml
services:
  postgres:
    image: postgres:18.4-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: app
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d app"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./app
    ports:
      - "8080:8080"
    environment:
      PORT: "8080"
      DATABASE_URL: postgres://app:app@postgres:5432/app?sslmode=disable
      FRONTEND_URL: ${FRONTEND_URL:-http://localhost:5173}
      TELEMETRY_ENABLED: ${TELEMETRY_ENABLED:-true}
      OTEL_EXPORTER_OTLP_ENDPOINT: ${OTEL_EXPORTER_OTLP_ENDPOINT:-http://lgtm:4317}
    depends_on:
      postgres:
        condition: service_healthy
      lgtm:
        condition: service_started

  lgtm:
    image: grafana/otel-lgtm:latest
    ports:
      - "3000:3000"
      - "4317:4317"
      - "4318:4318"
    volumes:
      - lgtm_data:/data

  pgadmin:
    image: dpage/pgadmin4:9.17
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_DEFAULT_EMAIL:-admin@gmail.com}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_DEFAULT_PASSWORD:-admin}
      PGADMIN_CONFIG_SERVER_MODE: "False"
      PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED: "False"
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
  lgtm_data:
```

### Direct access

```text
Backend:
http://192.168.0.105:8080
http://100.81.82.102:8080

pgAdmin:
http://192.168.0.105:5050
http://100.81.82.102:5050

Grafana:
http://192.168.0.105:3000
http://100.81.82.102:3000
```

### Docker-internal access

Containers in the same Compose network should use the service name instead of the host IP.

Example:

```text
postgres:5432
```

The backend connects to PostgreSQL using:

```text
postgres://app:app@postgres:5432/app?sslmode=disable
```

Publishing PostgreSQL with:

```yaml
ports:
  - "5432:5432"
```

is only necessary if PostgreSQL must be accessed directly from another machine.

If only the backend and pgAdmin need database access, PostgreSQL can remain internal:

```yaml
postgres:
  # No ports section required
```

---

## Caddy

Caddy listens on:

```text
80/tcp
443/tcp
```

Caddy routes requests based on the hostname.

Example:

```caddyfile
grafana.home.arpa {
    reverse_proxy grafana:3000
}
```

### Current local routes

```caddyfile
jellyfin.home.arpa {
    reverse_proxy jellyfin:8096
}

grafana.home.arpa {
    reverse_proxy grafana:3000
}

prometheus.home.arpa {
    reverse_proxy prometheus:9090
}

pihole.home.arpa {
    reverse_proxy pihole:80
}

immich.home.arpa {
    reverse_proxy immich-server:2283
}

portainer.home.arpa {
    reverse_proxy portainer:9000
}

crafty.home.arpa {
    reverse_proxy https://crafty:8443 {
        transport http {
            tls_insecure_skip_verify
        }

        header_up Host {host}
        header_up X-Forwarded-Proto {scheme}
        header_up X-Forwarded-For {remote}
    }
}

home.home.arpa {
    reverse_proxy homepage:3000
}

uptime.home.arpa {
    reverse_proxy uptime-kuma:3001
}
```

Caddy and the target containers must be connected to the same Docker network.

---

## Security checklist

Before publishing a new service:

- [ ] Is the service actually required to be reachable remotely?
- [ ] Does it need LAN access, Tailscale access, or both?
- [ ] Does the service require authentication?
- [ ] Does the container publish a port through Docker?
- [ ] Is the port inside the allowed development range?
- [ ] Does the service expose sensitive data?
- [ ] Are passwords and tokens stored outside Git?
- [ ] Is router port forwarding disabled?
- [ ] Is the service updated regularly?
- [ ] Can the service be accessed through Caddy instead of exposing a direct port?

### Never commit

```text
.env
.env.*
secrets/
*.pem
*.key
*.p12
*.pfx
id_*
service-account*.json
firebase-service-account*.json
```

Private keys, API tokens, passwords, service-account files, database data and runtime files must not be stored in this repository.

---

## Useful network commands

Show network interfaces:

```bash
ip -br addr
```

Show listening TCP ports:

```bash
sudo ss -ltnp
```

Show listening UDP ports:

```bash
sudo ss -lunp
```

Check a specific port:

```bash
sudo ss -ltnp | grep ':8080'
```

Test a local HTTP service:

```bash
curl http://127.0.0.1:8080
```

Test through LAN IP:

```bash
curl http://192.168.0.105:8080
```

Test through Tailscale IP:

```bash
curl http://100.81.82.102:8080
```

Resolve a local hostname:

```bash
getent hosts portainer.home.arpa
```

Query Pi-hole DNS directly:

```bash
dig @192.168.0.105 portainer.home.arpa
```

---

## Repository rules

This repository contains documentation and sanitized configuration examples.

It must not contain:

- private SSH keys;
- passwords;
- API tokens;
- database credentials;
- Firebase service-account files;
- Tailscale authentication keys;
- Docker volume data;
- production secrets;
- personal data.

Configuration files should use environment variables for secrets.

Example:

```yaml
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
```
