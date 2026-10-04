# Crafty Controller

Crafty Controller is used to manage Minecraft servers.

## Role

- Minecraft server management;
- web administration;
- server files;
- logs;
- backups;
- server lifecycle management.

## Access

Web interface:

```text
https://crafty.home.arpa
```

Caddy forwards requests to:

```text
crafty:8443
```

Minecraft server:

```text
25565/tcp
```

## Network

```text
server
```

Published ports:

```text
192.168.0.105:8443/tcp
0.0.0.0:25565/tcp
```

## Storage

```text
/home/s623/docker/crafty/backups
/home/s623/docker/crafty/logs
/home/s623/docker/crafty/servers
/home/s623/docker/crafty/config
/home/s623/docker/crafty/import
```

## Backup

Important:

- server data;
- configuration;
- Crafty backups.

Logs are useful but can be considered replaceable depending on backup requirements.

## Deployment

The active Crafty service is managed through Portainer.

The repository should contain only one canonical Compose definition for Crafty.
