#!/usr/bin/env bash
###############################
#       env variables
###############################
STACK_ROOTPATH='/opt/cherry-vm-studio'
ENV_FILE="${STACK_ROOTPATH}/env.sh"

if [ ! -r "$ENV_FILE" ]; then
    logger -p 'user.error' "cherry-watchdog.sh could not run because it is unable to find ${ENV_FILE}! Check the files integrity and try again."
    exit 1
else
    logger -p 'user.info' "cherry-watchdog.sh is sourcing environmental variables from ${ENV_FILE}"
    source "$ENV_FILE"
fi

###############################
#       logging logic
###############################
# Logger logic - wrapper for prefix addition and output redirects
log(){
    local priority=$1
    shift
    logger -t "$CVMS_WATCHDOG_LOG_TAG" -p "user.${priority}" "$@"
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
    log error 'Failed to start Cherry VM Studio Watchdog!'
    exit 1
}
trap error_handler ERR

###############################
#    system logic
###############################
attach_container(){
    local container="$1"
    local veth_connector="$2"
    local ip_suffix="$3"

    log info 'Attaching procedure started...'
    if [ ! -f "${DIR_NETNS}/${container}" ]; then
        PID=$(docker inspect -f '{{.State.Pid}}' "$container")
        log info "Creating netns symlink for $container."
        log_runner "$container:" ln -sf /proc/"${PID}"/ns/net "/var/run/netns/${container}"

        # log info "Attaching $container to NS_RASBUS namespace."
        log info "Attaching $container to host namespace."
        log_runner "$container:" ip link set "$veth_connector" netns "$container"
        log_runner "$container:" ip netns exec "$container" ip link set dev "$veth_connector" up

        log info "Addressing $container NS_RASBUS connector."
        log_runner "$container:" ip netns exec "$container" ip addr add "${PREFIX_NETWORK_RAS%.*}.${ip_suffix}/${NETWORK_RAS_NETMASK}" dev "$veth_connector"
    
        # Ensure that the bridge is up
        log_runner "$container:" ip link set dev "$BR_RASBR" up
    else
        log info "Namespace ${container} seems to be already attached. Infrastructure was not modified."
    fi
    

   
}

detach_container(){
    local container="$1"
    local veth_connector="$2"
    
    log info 'Detaching procedure started...'
    if [ -f "${DIR_NETNS}/${container}" ]; then
        log info "Detaching ${veth_connector} from ${container} namespace."
        log_runner "$container:" ip netns exec "$container" ip link set "$veth_connector" netns 1
        log info "Removing ${container} namespace."
        log_runner "$container:" rm --interactive=never -f "/var/run/netns/${container}"    
    else
        log info "Namespace ${container} seems not to be present on the system. Infrastructure was not modified."
    fi
    
}

start_container(){
    local container="$1"

    case "$container" in
        "$CONTAINER_API")
            attach_container "$CONTAINER_API" "$VETH_API_RASBUS" "$SUFFIX_VETH_API_RASBUS" ;;
        "$CONTAINER_GUACD")
        
            if [[ ! $(ip link show "$VETH_GUACD_RASBUS" 2>/dev/null) ]] || [[ ! $( ip link show "$VETH_RASBUS_GUACD" 2>/dev/null) ]]; then
                log info "Creating veth pair."
                log_runner "$container:" ip link add dev "$VETH_GUACD_RASBUS" type veth peer name "$VETH_RASBUS_GUACD"
                log_runner "$container:" ip link set dev "$VETH_RASBUS_GUACD" up
                log_runner "$container:" ip link set "$VETH_RASBUS_GUACD" master "$BR_RASBR"
                log_runner "$container:" ip link set dev "$BR_RASBR" up
            fi

            attach_container "$CONTAINER_GUACD" "$VETH_GUACD_RASBUS" "$SUFFIX_VETH_GUACD_RASBUS" ;;
        *)
            log error "Attempting to initialize unrecognized container: $container."
            exit 1 ;;
    esac
}

stop_container(){
    local container="$1"

    case "$container" in
        "$CONTAINER_API")
            detach_container "$CONTAINER_API" "$VETH_API_RASBUS" ;;
        "$CONTAINER_GUACD")
            detach_container "$CONTAINER_GUACD" "$VETH_GUACD_RASBUS" ;;
        *)
            log error "Attempting to uninitialize unrecognized container: $container."
            exit 1 ;;
    esac
}

###############################
#    system configuration
###############################
set -uo pipefail

if [ ! -f "$CVMS_INSTALLATION_LOCK" ]; then
    log error 'Cannot use systemctl cherry-watchdog without having installed Cherry VM Studio first!'
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

log info 'Initializing Cherry VM Studio Watchdog...'

docker events --format '{{.Status}} {{.Actor.Attributes.name}}' \
              --filter 'type=container' \
              --filter 'event=start' \
              --filter 'event=die' |
while read -r status name; do
    for watched in "${WATCHED_CONTAINERS[@]}"; do
        if [[ $watched == "$name" ]]; then
            case $status in
                start) log_runner "Container $name started. Attaching." start_container "$name" ;;
                die)   log_runner "Container $name died. Detaching." stop_container "$name" ;;
            esac
            break
        fi
    done
done