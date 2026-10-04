# Pi-hole

Pi-hole is the local DNS server and network-wide DNS filtering service of the home server.

It is responsible for resolving local `.home.arpa` hostnames and forwarding external DNS queries to configured upstream DNS servers.

## Role

Pi-hole provides DNS for the local network and resolves internal service hostnames to the home server.

Example:

```text
portainer.home.arpa → 192.168.0.105
```

The `.home.arpa` domain is used for local services.

## Network

Pi-hole is connected to the Docker network:

```text
server
```

It is also connected to its own Compose network.

The `server` network allows Caddy to access the Pi-hole web interface internally:

```text
pihole:80
```

## DNS

Pi-hole listens for DNS queries on:

```text
192.168.0.105:53/tcp
192.168.0.105:53/udp
```

Configured upstream DNS servers:

```text
1.1.1.1
9.9.9.9
```

The current DNS listening mode is:

```text
ALL
```

This allows Pi-hole to accept DNS queries on all available interfaces and therefore requires appropriate firewall configuration.

## Local DNS

Pi-hole provides local DNS records for the services running on the server.

Current hostnames include:

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

These hostnames resolve to:

```text
192.168.0.105
```

Caddy then uses the requested hostname to forward the request to the corresponding Docker service.

## Web interface

The Pi-hole web interface is not directly published through a dedicated host HTTP port.

It is accessed through Caddy:

```text
https://pihole.home.arpa
```

Caddy forwards the request internally to:

```text
pihole:80
```

## Persistent data

Pi-hole configuration and DNS data are stored in:

```text
/home/s623/docker/pihole/etc-pihole
```

This directory should be included in server backups.

The data includes persistent Pi-hole configuration and database information.

## Secrets

The Pi-hole web interface password is provided through an environment variable:

```text
PIHOLE_PASSWORD
```

The actual value must not be stored in Git.

The repository should contain only the corresponding variable name or an example configuration.

## Deployment

Pi-hole is managed as a Docker Compose stack through Portainer.

The stack requires:

- Docker;
- Docker Compose;
- the external Docker network `server`;
- the server IP `192.168.0.105`;
- the Pi-hole password configured as an environment variable.

The persistent `/etc/pihole` directory must be available before deployment.

## Verification

Check the container:

```bash
docker ps --filter name=pihole
```

Check DNS resolution through Pi-hole:

```bash
dig @192.168.0.105 google.com
```

Check a local DNS record:

```bash
dig @192.168.0.105 portainer.home.arpa
```

Check the web interface:

```text
https://pihole.home.arpa
```

## Backup

Required:

```text
/home/s623/docker/pihole/etc-pihole
```

The Pi-hole environment file containing the password must also be backed up separately but must not be committed to Git.

## Security

Pi-hole directly exposes DNS on port `53`.

Because the DNS listening mode is `ALL`, the service must remain protected by the server firewall and must not become unintentionally accessible from untrusted networks.

Pi-hole should primarily be reachable from the local network and through the private Tailscale network.