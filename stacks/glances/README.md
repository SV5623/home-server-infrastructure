# Glances

Glances is used for system monitoring.

## Role

It provides system and Docker monitoring information.

## Access

```text
https://glances.home.arpa
```

Caddy forwards requests to:

```text
glances:61208
```

## Network

```text
server
```

## Docker access

Glances does not access the Docker socket directly.

It uses:

```text
tcp://docker-socket-proxy:2375
```

through Docker Socket Proxy.

## Host access

The container runs with:

```text
pid: host
```

to provide host-level process information.

## Storage

No persistent application storage is used.

## Backup

No backup is required.

## Deployment

Managed as a Docker Stack through Portainer.
