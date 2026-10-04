#!/usr/bin/env bash

set -e

echo "==> Home Server Infrastructure setup"

if command -v dnf >/dev/null; then
    echo "Detected: Fedora"
    sudo dnf install -y docker docker-compose-plugin

elif command -v apt >/dev/null; then
    echo "Detected: Debian/Ubuntu"
    sudo apt update
    sudo apt install -y docker.io docker-compose-plugin

elif command -v pacman >/dev/null; then
    echo "Detected: Arch"
    sudo pacman -Sy --noconfirm docker docker-compose

else
    echo "Unsupported Linux distribution"
    exit 1
fi

sudo systemctl enable --now docker

if ! docker network inspect server >/dev/null 2>&1; then
    docker network create server
fi

echo "==> Docker and network are ready"