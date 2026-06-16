#!/usr/bin/env bash
###############################
#       env variables
###############################
STACK_ROOTPATH='/opt/cherry-vm-studio'
ENV_FILE="${STACK_ROOTPATH}/env.sh"

# Initial source with manual logging - custom logger and the rest of the script is unable to run without this prerequisite
if [ ! -r "$ENV_FILE" ]; then
    logger -p 'user.error' "cherry-vm-studio-stop.sh could not run because it is unable to find ${ENV_FILE}! Check the files integrity and try again."
    exit 1
else
    logger -p 'user.info' "cherry-vm-studio-start.sh is sourcing environmental variables from ${ENV_FILE}"
    source "$ENV_FILE"
fi

###############################
#       logging logic
###############################
# Logger logic - wrapper for prefix addition and output redirects
log(){
    local priority=$1
    shift
    logger -t "$CVMS_SERVICE_LOG_TAG" -p "user.${priority}" "$@"
}

log_prefix() {
    local priority="$1"
    local prefix="$2"
    shift 2
    while IFS= read -r line || [[ -n "$line" ]]; do
        log "$priority" "${prefix}: ${line}"
    done
}

log_runner(){
    local prefix="$1"
    shift
    {
        "$@" 2> >(log_prefix error "${prefix}" ) | log_prefix info "${prefix}"
    }
}

error_handler(){
    log error 'Failed to stop all elements of the Cherry VM Studio stack!'
}
trap error_handler ERR

###############################
#   network infrastructure
###############################
cleanup_ns_rasbus(){
    #Set all of the devices inside the NS_RASBUS namespace down
    # log info 'Setting all of the devices inside NS_RASBUS network namespace down.'
    # log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link set dev "$VETH_RASBUS_API" down
    # log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link set dev "$VETH_RASBUS_GUACD" down
    # log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link set dev "$VETH_RASBUS_EXT" down
    # log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link set dev "$VETH_RASBUS_VMBR" down
    # log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link set dev "$BR_RASBR" down
    # log info 'Set all of the devices inside NS_RASBUS network namespace down.'

    log info 'Setting all of the network devices down.'
    log_runner 'NS_RASBUS:' ip link set dev "$VETH_RASBUS_API" down
    log_runner 'NS_RASBUS:' ip link set dev "$VETH_RASBUS_GUACD" down
    log_runner 'NS_RASBUS:' ip link set dev "$VETH_RASBUS_EXT" down
    log_runner 'NS_RASBUS:' ip link set dev "$VETH_RASBUS_VMBR" down
    log_runner 'NS_RASBUS:' ip link set dev "$BR_RASBR" down
}

cleanup_host_os(){
    log info 'Setting all of the devices inside host network namespace down.'
    #Set all of the devices inside the host network namespace down
    log_runner 'BR_VMBR:' ip link set dev "$BR_VMBR" down

    # #Delete all of the devices inside the NS_RASBUS namespace - attached ends of the VETH pairs
    # log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link del dev "$VETH_RASBUS_GUACD"
    # log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link del dev "$VETH_RASBUS_API"
    # log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link del dev "$VETH_RASBUS_EXT"
    # log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link del dev "$VETH_RASBUS_VMBR"
    # #Bridge inside NS_RASBUS
    # log_runner 'NS_RASBUS:' ip netns exec "$NS_RASBUS" ip link del dev "$BR_RASBR"

    log_runner 'NS_RASBUS:' ip link del dev "$VETH_RASBUS_GUACD"
    log_runner 'NS_RASBUS:' ip link del dev "$VETH_RASBUS_API"
    log_runner 'NS_RASBUS:' ip link del dev "$VETH_RASBUS_EXT"
    log_runner 'NS_RASBUS:' ip link del dev "$VETH_RASBUS_VMBR"
    log_runner 'NS_RASBUS:' ip link del dev "$BR_RASBR"

    #Delete all of the devices inside the host network namespace
    log_runner 'BR_VMBR:' ip link del dev "$BR_VMBR"

    #Delete NS_RASBUS network namespace
    # log_runner 'NS_RASBUS:' ip netns del "$NS_RASBUS"

    log info 'Set all of the devices inside host network namespace down.'
}

###############################
#    system configuration
###############################
set -uo pipefail

if [ ! -f "$CVMS_INSTALLATION_LOCK" ]; then
    log error 'Cannot use systemctl stop cherry-vm-studio without having installed Cherry VM Studio first!'
    exit 1
fi

# Check if the infrastructure is running
if [ ! -f "$CVMS_SERVICE_LOCK" ]; then
    log error 'Cherry VM Studio stack is not running!'
    exit 1
fi

log info 'Stopping Cherry VM Studio Stack...'

log_runner 'Stopping all containers.' docker compose -p cherry-vm-studio -f "${DIR_DOCKER_HOST}/docker-compose.yaml" down

cleanup_ns_rasbus
cleanup_host_os

log info 'Removing service lock.'
log_runner 'CVMS_SERVICE_LOCK' rm -f "$CVMS_SERVICE_LOCK"

log info 'Succesfully stopped Cherry VM Studio Stack.'
