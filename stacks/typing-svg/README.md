# Typing SVG

Typing SVG is a self-hosted service used to generate README typing animations.

## Role

It provides the locally hosted Typing SVG application.

## Access

```text
https://typing.home.arpa
```

Caddy forwards requests to:

```text
typing-svg:8000
```

## Network

```text
server
```

## Build

The container is built from the local application source using:

```text
Dockerfile
```

The Compose project uses the current source directory as the build context.

## Storage

No persistent runtime data is required.

## Backup

The application source and Docker build files should be kept in Git.

Runtime container data does not require backup.

## Deployment

Managed through Portainer using the Compose project and its build context.
