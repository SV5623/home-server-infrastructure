# Monitoring

The monitoring stack collects and visualizes metrics from the host and Docker containers.

## Components

- Prometheus
- Grafana
- Node Exporter
- cAdvisor

## Architecture

```text
Node Exporter ──┐
                ├──> Prometheus ──> Grafana
cAdvisor ───────┘
```

## Access

```text
https://prometheus.home.arpa
https://grafana.home.arpa
```

Caddy forwards to:

```text
prometheus:9090
grafana:3000
```

## Metrics

Prometheus collects:

```text
node-exporter:9100
cadvisor:8080
```

Scrape interval:

```text
60s
```

Retention:

```text
15 days
```

## Configuration

```text
/home/s623/docker/prometheus/prometheus.yml
```

The configuration is mounted into Prometheus as read-only.

## Storage

Docker named volumes:

```text
monitoring_prometheus-data
monitoring_grafana-data
```

## Backup

Grafana data should be backed up.

Prometheus data can be treated as replaceable depending on backup requirements.

## Deployment

Managed as a Docker Stack through Portainer.
