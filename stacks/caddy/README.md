Caddy is the reverse proxy of the home server.

It provides access to internal Docker services through local `.home.arpa` hostnames.

## Role

Caddy receives HTTP/HTTPS requests and forwards them to services running inside the Docker `server` network.

Example:

```text
grafana.home.arpa
        ↓
      Caddy
        ↓
   grafana:3000

Deployment
The stack is managed through Portainer.
The Compose configuration is stored in:
compose.yaml

The Caddy configuration is stored in:
Caddyfile

The Docker network must exist:
server

Ports
Host port	Protocol	Purpose
80	TCP	HTTP
443	TCP	HTTPS


Caddy's administration API is available only locally:
localhost:2019

Reverse proxy routes
Hostname	Docker service	Port
jellyfin.home.arpa	jellyfin	8096
grafana.home.arpa	grafana	3000
prometheus.home.arpa	prometheus	9090
pihole.home.arpa	pihole	80
immich.home.arpa	immich-server	2283
portainer.home.arpa	portainer	9000
crafty.home.arpa	crafty	8443
home.home.arpa	homepage	3000
uptime.home.arpa	uptime-kuma	3001
snapotter.home.arpa	snapotter	1349
glances.home.arpa	glances	61208
typing.home.arpa	typing-svg	8000
obsidian.home.arpa	obsidian	8080


Network
Caddy is connected to the external Docker network:
server

All services that Caddy proxies to must also be connected to this network.
Persistent data
Caddy uses two Docker named volumes:
caddy_data
caddy_config

They contain persistent Caddy runtime data.
They should not be stored in Git.
Configuration
The Caddy configuration is maintained in:
Caddyfile

The configuration uses Caddy's reverse_proxy directive to forward requests to Docker services.
The Crafty upstream uses HTTPS with:
tls_insecure_skip_verify

because Crafty exposes its web interface through HTTPS internally.
Verification
Check the stack through Portainer.
Check the running container:
docker ps --filter name=caddy

Validate the Caddy configuration:
docker exec caddy caddy validate --config /etc/caddy/Caddyfile

View logs:
docker logs caddy