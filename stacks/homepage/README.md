# Homepage

Homepage is the central dashboard for services running on the home server.

## Role

It provides a single web interface for accessing and monitoring the services hosted on the server.

## Access

```text
https://home.home.arpa
```

Caddy forwards requests to:

```text
homepage:3000
```

## Network

```text
server
```

## Configuration

Homepage configuration is stored in:

```text
/home/s623/docker/homepage/config
```

Current configuration files include:

```text
services.yaml
settings.yaml
widgets.yaml
docker.yaml
bookmarks.yaml
proxmox.yaml
kubernetes.yaml
custom.css
custom.js
backgrounds.json
```

Runtime logs are not part of the repository.

## Storage

The configuration directory is bind-mounted into the container.

Images are stored under:

```text
config/images
```

## Backup

Back up the Homepage configuration directory.

Runtime logs do not need to be backed up.

## Deployment

Managed as a Docker Stack through Portainer.
