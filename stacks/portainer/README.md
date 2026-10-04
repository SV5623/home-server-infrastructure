# Portainer

Portainer is the main Docker management interface.

## Role

Portainer is used to:

- manage containers;
- manage Docker Compose stacks;
- inspect services;
- view logs;
- manage deployments.

## Access

```text
https://portainer.home.arpa
```

Caddy forwards requests to:

```text
portainer:9000
```

## Network

```text
server
```

## Storage

Persistent data:

```text
/home/s623/docker/portainer/data
```

Portainer stores its application data and managed stack definitions here.

## Docker access

Portainer has access to:

```text
/var/run/docker.sock
```

This provides administrative control over the Docker daemon.

## Security

Access to Portainer should be restricted to trusted users and trusted networks.

The Docker socket must be treated as highly privileged.

## Backup

Required:

```text
/home/s623/docker/portainer/data
```

## Deployment

Portainer itself is deployed as a Docker Stack.

The remaining stacks are managed through Portainer.
