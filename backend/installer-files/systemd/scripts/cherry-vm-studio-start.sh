#!/usr/bin/env bash
###############################
#       env variables
###############################
STACK_ROOTPATH='/opt/cherry-vm-studio'
ENV_FILE="${STACK_ROOTPATH}/env.sh"

# Initial source with manual logging - custom logger and the rest of the script is unable to run without this prerequisite
if [ ! -r "$ENV_FILE" ]; then
    logger -p 'user.error' "cherry-vm-studio-start.sh could not run because it is unable to find ${ENV_FILE}! Check the files integrity and try again."
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
    log error 'Failed to start Cherry VM Studio stack!'
    # log info 'Performing cleanup:' "${DIR_CVMS_SYSTEMD_SCRIPTS}/cherry-vm-studio-stop.sh"
    exit 1
}
trap error_handler ERR

###############################
#     NS_RASBUS namespace
###############################
# create_netns_rasbus(){
#     log info 'Creating RASBUS network namespace.'
#     log_runner 'NETNS_RASBUS' ip netns add "$NS_RASBUS"
#     # set lo interface up in order to bind the ns to the process
#     log_runner 'NETNS_RASBUS' ip netns exec "$NS_RASBUS" ip link set dev lo up
# }

create_veth_pairs(){
    # Create the veth pairs, move one of their ends to the NS_RASBUS and bring them up
    log info 'Creating veth pairs'
    for pair in "${VETH_PAIRS[@]}"; do
        read -r veth1 veth2 <<< "$pair"
        log info "Creating ${pair} veth pair."
        log_runner "$pair" ip link add "${!veth1}" type veth peer name "${!veth2}"
        log_runner "$pair" ip link set dev "${!veth1}" up
        # log_runner "$pair" ip link set "${!veth2}" netns "${NS_RASBUS}"
        # log_runner "$pair" ip netns exec "${NS_RASBUS}" ip link set dev "${!veth2}" up
        log_runner "$pair" ip link set dev "${!veth2}" up
    done
}

create_bridge_rasbr(){
    #network bridge for inter cherry-rasBus communication - bridges containers and cherry-vmBr
    log info 'Creating cherry-rasBus bridge'
    # log_runner 'BR_RASBR' ip netns exec "$NS_RASBUS" ip link add "$BR_RASBR" type bridge
    # log_runner 'BR_RASBR' ip netns exec "$NS_RASBUS" ip link set dev "$BR_RASBR" up
    log_runner 'BR_RASBR' ip link add "$BR_RASBR" type bridge
    log_runner 'BR_RASBR' ip link set dev "$BR_RASBR" up
}

attach_veths_rasbus(){
    log info 'Attaching VETHs inside NS_RASBUS NETNS to the BR_RASBR'
    #attach VETHs inside the NS_RASBUS namespace to the BR_RASBR bridge
    # log_runner 'NS_RASBUS' ip netns exec "$NS_RASBUS" ip link set dev "$VETH_RASBUS_API" master "$BR_RASBR"
    # log_runner 'NS_RASBUS' ip netns exec "$NS_RASBUS" ip link set dev "$VETH_RASBUS_GUACD" master "$BR_RASBR"
    log_runner 'NS_RASBUS' ip link set dev "$VETH_RASBUS_API" master "$BR_RASBR"
    log_runner 'NS_RASBUS' ip link set dev "$VETH_RASBUS_GUACD" master "$BR_RASBR"
    #VETH pair for VM guests external connectivity
    # log_runner 'NS_RASBUS' ip netns exec "$NS_RASBUS" ip link set dev "$VETH_RASBUS_EXT" master "$BR_RASBR"
    log_runner 'NS_RASBUS' ip link set dev "$VETH_RASBUS_EXT" master "$BR_RASBR"

    # SET RASBR-GUACD UP
}

###############################
#   Host network namespace
###############################
create_bridge_vm(){
    log info 'Creating bridge for libvirt VM guests - Internet access'
    #network bridge for libvirt VM guests - Internet access
    log_runner 'BR_VMBR' ip link add "$BR_VMBR" type bridge
    log_runner 'BR_VMBR' ip link set dev "$BR_VMBR" up
    #attach VETH_VMBR_RASBUS end to the BR_VMBR on the host network namespace
    log_runner 'BR_VMBR' ip link set dev "$VETH_VMBR_RASBUS" master "$BR_VMBR"
}

###############################
#        IP addresses
###############################
address_ns_host(){
    log info 'Addressing infrastructure inside the host namespace'
    #external connectivity VETH end on the host namespace
    log_runner 'VETH HOST' ip addr add "${PREFIX_NETWORK_RAS%.*}.${SUFFIX_VETH_EXT_RASBUS}/${NETWORK_RAS_NETMASK}" dev "$VETH_EXT_RASBUS"
    log_runner 'BR_RASBR' ip addr add "${PREFIX_NETWORK_RAS%.*}.${SUFFIX_BR_RASBR}/${NETWORK_RAS_NETMASK}" dev "$BR_RASBR" 
}

address_ns_rasbus(){
    #BR_RASBR inside the NS_RASBUS namespace
    log info 'Addressing infrastructure inside NS_RASBUS namespace'
    # log_runner 'NS_RASBUS' ip netns exec "$NS_RASBUS" ip addr add "${PREFIX_NETWORK_RAS%.*}.${SUFFIX_BR_RASBR}/${NETWORK_RAS_NETMASK}" dev "${BR_RASBR}" 
}

configure_firewall(){
    # log info 'Configuring kernel options for NS_RASBUS namespace'
    # log_runner 'NS_RASBUS' "$(ip netns exec "$NS_RASBUS" /bin/bash && sysctl -w net.ipv4.ip_forward=1)"
    # log info 'Creating firewall rules inside NS_RASBUS namespace'
    log info 'Configuring kernel network options'
    log_runner 'HOST' sysctl -w net.ipv4.ip_forward=1
}

###############################
#    system configuration
###############################
set -euo pipefail

if [ ! -f "$CVMS_INSTALLATION_LOCK" ]; then
    log error 'Cannot use systemctl start cherry-vm-studio without having installed Cherry VM Studio first!'
    exit 1
fi

if [ -f "$CVMS_SERVICE_LOCK" ]; then
    log error 'Cherry VM Studio stack is already running!'
    exit 1
fi

if [ ! -r "$SETTINGS_FILE" ]; then
    log error 'Cannot read settings.yaml file.'
    exit 1
else   
    log info 'Reading PREFIX_NETWORK_RAS settings.'
    if yq eval ".networks.${NETWORK_RAS_NAME}.network" "$SETTINGS_FILE"; then
        PREFIX_NETWORK_RAS=$(yq eval ".networks.${NETWORK_RAS_NAME}.network" "$SETTINGS_FILE")
    else
        log error 'Could not read PREFIX_NETWORK_RAS from settings file!'
    fi
fi

log info 'Initializing Cherry VM Studio Stack...'

log info 'Creating service lock.'
log_runner 'CVMS_SERVICE_LOCK' touch "$CVMS_SERVICE_LOCK"

log_runner 'Starting containers' docker compose -p cherry-vm-studio -f "${DIR_DOCKER_HOST}/docker-compose.yaml" --env-file "${DIR_DOCKER_HOST}/.env" up -d

# # create_netns_rasbus
create_veth_pairs
create_bridge_rasbr
attach_veths_rasbus
create_bridge_vm
address_ns_host
# # address_ns_rasbus
configure_firewall

log info 'Succesfully initialized Cherry VM Studio Stack.'
