#!/usr/bin/env bash
git pull
docker compose -p cherry-vm-studio -f /opt/cherry-vm-studio/docker/docker-compose.yaml down admin-panel
./build.sh
docker compose -p cherry-vm-studio -f /opt/cherry-vm-studio/docker/docker-compose.yaml up -d admin-panel
