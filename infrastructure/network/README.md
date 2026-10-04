# Docker network

The home server uses a shared external Docker network named:

```text
server
```

This network is required for Caddy, Pi-hole and the services that are exposed through the reverse proxy.

## Purpose

The `server` network allows containers to communicate using Docker service names instead of publishing all ports directly on the host.

Example:

```text
Caddy -> grafana:3000
Caddy -> pihole:80
Caddy -> immich-server:2283
```

## Requirements

- the network must exist before deploying stack services;
- it is external to each stack;
- the network must not be recreated separately by every Compose file;
- it is shared across the home server infrastructure.

## Current host configuration

The server uses:

```text
/home/s623/docker
```

and the Docker network:

```text
server
```

This is the shared internal network used by the Portainer-managed stacks.
