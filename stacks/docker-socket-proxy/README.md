# Docker Socket Proxy

Docker Socket Proxy provides restricted access to the Docker API.

## Role

It is used as an intermediary between monitoring services and the Docker socket.

Current consumer:

```text
Glances
```

Architecture:

```text
Glances
   │
   ▼
Docker Socket Proxy
   │
   ▼
Docker socket
```

## Network

```text
server
```

## Docker socket

The proxy mounts:

```text
/var/run/docker.sock
```

as read-only.

## Allowed API operations

Enabled:

```text
CONTAINERS
INFO
EVENTS
```

Disabled operations include:

```text
POST
BUILD
COMMIT
EXEC
IMAGES
NETWORKS
SECRETS
SERVICES
VOLUMES
```

## Storage

No persistent application data.

## Backup

No backup is required.

## Security

This container exists to reduce the Docker API permissions exposed to monitoring services.
