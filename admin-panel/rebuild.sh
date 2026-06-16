#!/usr/bin/env bash
git pull
docker compose -p cherry-vm-studio-dev -f /opt/cherry-vm-studio/docker/docker-compose-dev.yaml down admin-panel
./build.sh
docker compose -p cherry-vm-studio-dev -f /opt/cherry-vm-studio/docker/docker-compose-dev.yaml up -d admin-panel
