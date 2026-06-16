#!/usr/bin/env sh
set -e

SYSTEM_WORKER_UID=${SYSTEM_WORKER_UID:?error}
SYSTEM_WORKER_GID=${SYSTEM_WORKER_GID:?error}
HOST_LIBVIRT_GID=${HOST_LIBVIRT_GID:?error}

# If libvirt group exists after the start (as it normally should) - change GID to host libvirt group GID
if getent group libvirt >/dev/null 2>&1; then
    groupmod -o -g "$HOST_LIBVIRT_GID" libvirt
else
    addgroup -g "$HOST_LIBVIRT_GID" libvirt
fi

# Create CherryWorker user inside the container
if id CherryWorker >/dev/null 2>&1; then
    deluser CherryWorker
fi

if getent group CherryWorker >/dev/null 2>&1; then
    delgroup CherryWorker
fi

addgroup -g "$SYSTEM_WORKER_GID" CherryWorker

adduser -D -H -u "$SYSTEM_WORKER_UID" -G CherryWorker CherryWorker

usermod -aG libvirt CherryWorker

# Drop root permissions and switch to CherryWorker
exec su-exec CherryWorker "$@"