#!/usr/bin/env bash
git pull
docker compose -p cherry-vm-studio -f /opt/cherry-vm-studio/docker/docker-compose.yaml down api
./build.sh
docker compose -p cherry-vm-studio -f /opt/cherry-vm-studio/docker/docker-compose.yaml up -d api
docker logs cherry-api -f
