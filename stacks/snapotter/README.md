# SnapOtter

SnapOtter is a self-hosted file-processing service.

## Role

It provides tools for processing files such as:

- images;
- video;
- audio;
- PDF;
- documents.

It can be used through a web interface and API.

## Access

```text
https://snapotter.home.arpa
```

Caddy forwards requests to:

```text
snapotter:1349
```

Port:

```text
1349/tcp
```

## Network

```text
server
```

## Storage

Persistent application data is stored in the Docker named volume:

```text
snapotter_snapotter-data
```

## Backup

The persistent SnapOtter data should be backed up.

Temporary processing data can be treated as replaceable.

## Deployment

Managed as a Docker Stack through Portainer.
