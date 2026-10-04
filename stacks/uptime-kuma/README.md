# Uptime Kuma

Uptime Kuma monitors the availability of services running on the home server.

## Role

- service availability monitoring;
- uptime tracking;
- notifications;
- health checks for internal services.

## Access

```text
https://uptime.home.arpa
```

Caddy forwards requests to:

```text
uptime-kuma:3001
```

## Network

```text
server
```

## Storage

Persistent data:

```text
/home/s623/docker/uptime-kuma
```

The directory contains the Uptime Kuma database and configuration.

## TLS

The container uses the local Caddy root certificate:

```text
certs/caddy-root.crt
```

This is provided through:

```text
NODE_EXTRA_CA_CERTS
```

## Backup

Required:

```text
/home/s623/docker/uptime-kuma
```

The database is essential for preserving monitoring configuration and history.

## Deployment

Managed as a Docker Stack through Portainer.
