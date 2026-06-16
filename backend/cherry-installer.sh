#!/usr/bin/env bash
###############################
#      root rights check
###############################
RED_BASH='\033[0;31m'
NC_BASH='\033[0m'
# Test to ensure that script is executed with root priviliges
if [[ $EUID -ne 0 ]]; then
    printf '%b[!] Insufficient priviliges! Please run the script with root rights.%b\n' "$RED_BASH" "$NC_BASH"
    exit 1
fi

###############################
#       env variables
###############################
INSTALLER_ROOTPATH='./installer-files'
ENV_FILE="${INSTALLER_ROOTPATH}/env.sh"

# Source all env variables
if [ ! -r "$ENV_FILE" ]; then
    printf '[!] Cannot read env.sh file. Check files integrity and try again.\n'
    exit 1
else
    source "$ENV_FILE"
fi
###############################
#       prerequisites
###############################
# Temp file for storing error output from executed commands. Used to pipe errors into error msgboxes after confirming dialog presence.
# Otherwise it just stores the errors without fetching them.
ERR_LOG=$(mktemp)

# Fetch hostname of the host OS that the Cherry VM Studio stack will run on. Crucial for cert generation, DNS resolution
HOSTNAME=$(cat /proc/sys/kernel/hostname)

# Determine Linux distro to adjust settings accordingly
if [ ! -r /etc/os-release ]; then
    printf '[!] Cannot read /etc/os-release file. Check files integrity and try again.\n'
    exit 1
else
    source '/etc/os-release'
fi

# PackageKit is problematic when using underlying package manager.
# While pkcon may be quicker to use, sometimes it's absent on server distros. Therefore manual detection is implemented.
packagekit_off(){
    if systemctl -q is-active packagekit; then
        PKCON_WAS_ACTIVE=true;
        printf '[i] Disabling PackageKit to prevent errors. It will be restored after installation.\n'
        if ! systemctl -q stop packagekit || ! systemctl -q disable packagekit; then
            printf '[!] Failed to disable PackageKit. Check the error and try again.\n'
            exit 1
        fi
        printf '[i] PackageKit stopped and disabled succesfully.\n'
    else
        PKCON_WAS_ACTIVE=false;
    fi
    
}
# Disable PackageKit even before checking the distro and installing dialog
packagekit_off

packagekit_restore(){
    if [[ "$PKCON_WAS_ACTIVE" == true ]]; then
        printf '[i] Re-enabling PackageKit.\n'
        if ! systemctl -q enable packagekit || ! systemctl -q start packagekit; then
            printf '[!] Failed to re-enable PackageKit. Check the error and try again.\n'
            exit 1
        fi
        printf '[i] PackageKit re-enabled and started succesfully.\n'
    fi
}

# Check whether the dialog necessary to run windowed installation is present. If not - install later on. 
check_dialog(){
    if ( ! command -v dialog &>/dev/null ); then
        printf '[!] Dialog not detected. Installing dependency to support TUI based windowed script.\n'
        return 0
    fi
}

install_wrapper(){
    local -n packages=$1
    local -n install=$2
    printf 'Starting...\n'
    for package in "${packages[@]}"; do
        printf 'Installing %s: ' "$package"
        $install "$package" >/dev/null 2>>"$ERR_LOG"
        printf 'OK\n'
    done
    printf 'All packages installed succesfully!\n'
}

#Identify distro and package manager
if [[ "$ID" == "ubuntu" || "$ID" == "debian" || "$ID_LIKE" =~ "debian" ]]; then
    PKG_MANAGER="apt-get"
    PKG_INSTALL="$PKG_MANAGER install -y"
    PKG_UPDATE="$PKG_MANAGER update"

    if ! $PKG_UPDATE >/dev/null; then
        printf '[!] Failed to update packages. Check the error and try again.\n' >&2
        exit 1
    fi

    install_packages(){
        PACKAGES=("qemu-kvm" "libvirt-daemon-system" "libvirt-clients" "bridge-utils")
        install_wrapper PACKAGES PKG_INSTALL
    }

elif [[ "$ID" == "centos" || "$ID" == "rhel" || "$ID" == "fedora" || "$ID_LIKE" =~ "rhel" || "$ID_LIKE" =~ "fedora" ]]; then
    if ( command -v dnf &>/dev/null ); then
        PKG_MANAGER="dnf"
    elif (command -v yum &>/dev/null); then
        PKG_MANAGER="yum" # "yum" for older RHEL/CentOS
    fi

    PKG_INSTALL="$PKG_MANAGER install -y"

    install_packages(){
        PACKAGES=("qemu-kvm" "qemu-img" "libvirt-daemon" "libvirt-daemon-driver-qemu" "libvirt-daemon-kvm" "libvirt-client" "bridge-utils")  
        install_wrapper PACKAGES PKG_INSTALL
    }
    
elif [[ "$ID" == "arch" || "$ID_LIKE" =~ "arch" ]]; then
    PKG_MANAGER="pacman"
    PKG_INSTALL="$PKG_MANAGER -S --noconfirm"

    install_packages(){
        PACKAGES=("qemu" "libvirt" "bridge-utils")
        install_wrapper PACKAGES PKG_INSTALL
    }
    
elif [[ "$ID" == "opensuse-tumbleweed" || "$ID" == "opensuse-leap" || "$ID_LIKE" =~ "suse" ]]; then
    PKG_MANAGER="zypper"
    PKG_UPDATE="$PKG_MANAGER -n refresh"
    PKG_INSTALL="$PKG_MANAGER -n install -t package"
    PTTRN_INSTALL="$PKG_MANAGER -n install -t pattern"

    # UNCOMMENT BEFORE RELEASE
    # printf '[!] Updating packages...\n'
    # if ! $PKG_UPDATE >/dev/null; then
    #     printf '[!] Failed to update packages. Check the error and try again.\n' >&2
    #     exit 1
    # fi

    install_packages(){
        #PACKAGES=("docker" "docker-compose" "libxslt-tools" "bridge-utils" "kvm_server" "kvm_tools" "yq")
        #install_wrapper PACKAGES PKG_INSTALL

        # Obsolete - delete after confirming that universal installation works
        PACKAGES=("docker" "docker-compose" "libxslt-tools" "bridge-utils" "yq" "ipcalc")
        PATTERNS=("kvm_server" "kvm_tools")
        install_wrapper PACKAGES PKG_INSTALL
        install_wrapper PATTERNS PTTRN_INSTALL
    }
    
elif [[ "$ID" == "alpine" ]]; then
    PKG_MANAGER="apk"
    PKG_INSTALL="$PKG_MANAGER add"

    install_packages(){ 
        PACKAGES=("qemu" "qemu-img" "qemu-system-x86_64" "libvirt-daemon" "libvirt-client" "bridge-utils")
        install_wrapper PACKAGES PKG_INSTALL
    }

else
    printf '[!] Unsupported distribution: %s\n' "$PRETTY_NAME"
    exit 1
fi

# Install dialog
if ! check_dialog; then
    if ! "${PKG_INSTALL}" dialog >/dev/null; then
        printf '[!] Failed to install dialog. Check the error and try again.\n' >&2
        exit 1
    fi
fi

###############################
#   system configuration
###############################
# URI for virsh operations performed on the system session of qemu by CherryWorker. Export the variable for use in subshells.
readonly LIBVIRT_DEFAULT_URI='qemu:///system'; export LIBVIRT_DEFAULT_URI # Possibly obsolete here

# General system configuration
check_wicked(){
    if ! systemctl -q is-active wicked; then
        {
            printf 'Your system seems to be using network management tool other than wicked (eg. NetworkManager).\n'
            printf 'Cherry VM Studio currently does not support network management tools other than wicked.\n\n'
            printf 'Wicked cannot be enabled automatically so as not to disrupt current network configuration.\n'
            printf 'In order to install Cherry VM Studio switch to wicked and run the installation again.'
        } >> "$ERR_LOG"
        return 1
    fi
}

prepare_filesystem(){
    printf 'Creating installation lock.\n'
    {
        mkdir -p "$DIR_LOCK"
        touch "$CVMS_INSTALLATION_LOCK" 
    } >/dev/null 2>>"$ERR_LOG"

    printf 'Creating directories and copying files.\n'
    {
        mkdir -p "$STACK_ROOTPATH" # static and config files
        mkdir -p "$TEMP_ROOTPATH" # locks, any kind of dynamically changing files

        cp "$ENV_FILE_INST" "$STACK_ROOTPATH" # copy env.sh file
        chmod +x "$ENV_FILE"

        mkdir -p "$DIR_DOCKER_HOST" # docker config directory
        cp -r "${DIR_DOCKER_INST}/." "$DIR_DOCKER_HOST" # copy all the container subdirectories from the installer-files
        rm -r "${DIR_DOCKER_HOST}/traefik" # Should probably be changed in the future - the traefik config directory is in the same place as other docker files in the installer-files but is placed in /var/opt instead of /opt on the host

        mkdir -p "$DIR_DOCKER_SECRETS"
        mkdir -p "$DIR_DOCKER_HOST_DB"

        mkdir -p "$DIR_DOCKER_HOST_TRAEFIK_CONFIG"
        cp -r "${DIR_DOCKER_INST_TRAEFIK_CONFIG}/." "$DIR_DOCKER_HOST_TRAEFIK_CONFIG"

        # This part is not relevant right now as no VM creation logic is implemented yet
        # mkdir -p "$DIR_LIBVIRT_HOST" # libvirt config directory
        # cp -r "${DIR_LIBVIRT_INST}/." "$DIR_LIBVIRT_HOST"
        # mkdir -p "$DIR_IMAGE_FILES"
        # mkdir -p "$DIR_VM_INSTANCES"

        mkdir -p "$DIR_CVMS_SYSTEMD_SCRIPTS"
        cp -r "${DIR_SYSTEMD_SCRIPTS_INST}/." "$DIR_CVMS_SYSTEMD_SCRIPTS"
        find "${DIR_CVMS_SYSTEMD_SCRIPTS}" -type f -exec chmod +x {} \;

        chown -R "$SYSTEM_WORKER_USERNAME":"$SYSTEM_WORKER_GROUPNAME" "$TEMP_ROOTPATH"

    } >/dev/null 2>>"$ERR_LOG"
}

create_system_user(){
    # Home directory is created manually so as to get rid of all the config files created by default by useradd command.
    # It must exist because of Docker daemon storing some runtime files in the home directory of the user running the containers.
    printf 'Creating CherryWorker private system group.\n'
    groupadd -r "$SYSTEM_WORKER_GROUPNAME" >/dev/null 2>>"$ERR_LOG"
    printf 'Creating CherryWorker home directory.\n'
    mkdir -p "$SYSTEM_WORKER_HOME_DIR" >/dev/null 2>>"$ERR_LOG"
    printf 'Creating CherryWorker system user.\n'
    useradd -r -M -g CherryWorker -d "$SYSTEM_WORKER_HOME_DIR" -s '/usr/bin/false' -c 'Cherry VM Studio system user.' CherryWorker >/dev/null 2>>"$ERR_LOG"
    printf 'Changing CherryWorker home directory ownership.\n'
    chown "$SYSTEM_WORKER_USERNAME":"$SYSTEM_WORKER_GROUPNAME" "$SYSTEM_WORKER_HOME_DIR" >/dev/null 2>>"$ERR_LOG"
    printf 'Adding CherryWorker to system groups.\n'
    usermod -a -G docker,libvirt,kvm CherryWorker >/dev/null 2>>"$ERR_LOG"
}

configure_polkit(){
    printf 'Enabling polkit to run on startup.\n'
    systemctl -q enable polkit.service >/dev/null 2>>"$ERR_LOG"
    printf 'Starting polkit.\n'
    systemctl -q start polkit.service >/dev/null 2>>"$ERR_LOG"
    printf 'Creating polkit rules for CherryWorker user.\n'
    {
        mkdir -p "$DIR_POLKIT_ACTIONS"
        cp -r "${DIR_POLKIT_ACTIONS_INST}/." "$DIR_POLKIT_ACTIONS"
        mkdir -p "$DIR_POLKIT_RULES"
        cp -r "${DIR_POLKIT_RULES_INST}/." "$DIR_POLKIT_RULES"
    } >/dev/null 2>>"$ERR_LOG"
}

# Random IP subnet generation
rand_between() { 
    printf '%i' "$((RANDOM % ($2 - $1 + 1) + $1))"; 
}

ip2dec() {
    local IFS=.
    local a b c d

    # Read all 4 octets; missing octets become 0
    read -r a b c d <<< "$1"

    # Validate numeric fields (prevent syntax error)
    a=${a:-0}; b=${b:-0}; c=${c:-0}; d=${d:-0}

    # Convert to decimal
    printf "%u\n" $(( (a * 16777216) + (b * 65536) + (c * 256) + d ))
}

dec2ip() {
    local num=$1
    printf "%u.%u.%u.%u\n" \
        $(( (num >> 24) & 255 )) \
        $(( (num >> 16) & 255 )) \
        $(( (num >> 8)  & 255 )) \
        $((  num        & 255 ))
}

generate_subnet() {
    local IP_SUBNET_RANGE=$1

    case "$IP_SUBNET_RANGE" in
        10)
        printf '%s' "10.$(rand_between 0 255).$(rand_between 0 255).0"
        ;;
        172)
        printf '%s' "172.$(rand_between 16 31).$(rand_between 0 255).0"
        ;;
        192)
        printf '%s' "192.168.$(rand_between 0 255).0"
        ;;
        *)
        printf '%s' "Invalid IP subnet range: $IP_RANGE" 2>>"$ERR_LOG"
        exit 1
        ;;
    esac
}

generate_network(){
    # Usage:
    # NET_RANGE = 10/172/192 - private IPv4 subnet ranges
    # NET_MASK - int value of network mask
    # NET_NAME - network name
    local NET_RANGE=$1
    local NET_MASK=$2
    local NET_NAME=$3
    
    while :; do
        NET_IP="$(generate_subnet "$NET_RANGE")"
        # Check whether any route or interface already uses this network
        if ! ip route | grep -q "$NET_IP"; then
            break
        fi
    done

    if [ ! -f "$SETTINGS_FILE" ]; then
        if ! mkdir -p "$STACK_ROOTPATH" || ! touch "$SETTINGS_FILE"; then
            printf 'Failed to create system settings directory at %s' "$SETTINGS_FILE" >> "$ERR_LOG"
            exit 1
        fi
    fi

    # Check if "networks" section exists in settings file
    if ! grep -s -q '^networks:' "$SETTINGS_FILE"; then
        printf '%s' "networks: {}" >> "$SETTINGS_FILE"
    fi

    # Calculate DHCP range
    IPC_OUTPUT="$(ipcalc "$NET_IP/$NET_MASK")"

    NETWORK_ADDR="$(echo "$IPC_OUTPUT" | awk '/Network/ {print $2}' | cut -d'/' -f1)"
    BROADCAST_ADDR="$(echo "$IPC_OUTPUT" | awk '/Broadcast/ {print $2}')"

    NET_DEC=$(ip2dec "$NETWORK_ADDR")
    BROAD_DEC=$(ip2dec "$BROADCAST_ADDR")

    FIRST_USABLE=$((NET_DEC + 1))
    LAST_USABLE=$((BROAD_DEC - 1))

    # Reserve 5 IPs → DHCP starts at +5
    DHCP_START_DEC=$((FIRST_USABLE + 5))
    DHCP_END_DEC=$LAST_USABLE

    DHCP_START=$(dec2ip "$DHCP_START_DEC")
    DHCP_END=$(dec2ip "$DHCP_END_DEC")


    # Check if NET_NAME already exists under networks
    if ! yq eval ".networks.$NET_NAME" "$SETTINGS_FILE" | grep -vq "null"; then
        yq eval -i ".networks.$NET_NAME = {
            \"network\": \"$NET_IP\",
            \"netmask\": $NET_MASK,
            \"dhcp_start\": \"$DHCP_START\",
            \"dhcp_end\": \"$DHCP_END\"
        }" "$SETTINGS_FILE"
        chown "$SYSTEM_USER_USERNAME":"$SYSTEM_USER_GROUPNAME" "$SETTINGS_FILE"
    fi
}

create_networks(){
    printf 'Randomising network subnets for virtual network infrastructure.\n'
    {
        generate_network "$NETWORK_RAS_RANGE" "$NETWORK_RAS_NETMASK" "$NETWORK_RAS_NAME"
        generate_network "$NETWORK_VM_RANGE" "$NETWORK_VM_NETMASK" "$NETWORK_VM_NAME"
    } >/dev/null 2>>"$ERR_LOG"
    
}

# Daemons configuration
configure_daemon_docker(){

    local domain_name="$1"

    printf 'Enabling docker daemon to run on startup.\n'
    systemctl -q enable docker.service >/dev/null 2>>"$ERR_LOG"
    printf 'Starting docker daemon.\n '
    systemctl -q start docker.service >/dev/null 2>>"$ERR_LOG" 
    # printf 'Switching Docker daemon to swarm mode.\n'
    # if [ "$(docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null)" == 'inactive' ]; then
    #     docker swarm init >/dev/null 2>>"$ERR_LOG"
    # elif [ "$(docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null)" == 'active' ]; then
    #     printf 'Docker daemon already in swarm mode.\n'
    # else
    #     printf 'Docker daemon cannot be switched into a Swarm mode because of an error:%s' "docker info --format '{{.Swarm.LocalNodeState}}'" >>"$ERR_LOG"
    #     return 1
    # fi

    printf 'Creating containers, secrets, and .env files.\n'
    {
        SYSTEM_WORKER_UID=$(id -u -r "$SYSTEM_WORKER_USERNAME")
        SYSTEM_WORKER_GID=$(id -g -r "$SYSTEM_WORKER_USERNAME")
        HOST_LIBVIRT_GID=$(getent group libvirt | cut -d: -f3)

        # Opting out of using docker swarm
        # JWT_SECRET=$(openssl rand -hex 32)
        # printf 'JWT_SECRET=%s' "$JWT_SECRET" | docker secret create jwt_secret - >/dev/null

        JWT_SECRET=$(openssl rand -hex 32)

        printf 'JWT_SECRET=%s' "$JWT_SECRET" > "${DIR_DOCKER_SECRETS}/jwt_secret.txt"
        chmod 600 "${DIR_DOCKER_SECRETS}/jwt_secret.txt"


        {
            printf 'SYSTEM_WORKER_UID=%s\n' "$SYSTEM_WORKER_UID"
            printf 'SYSTEM_WORKER_GID=%s\n' "$SYSTEM_WORKER_GID"
            printf 'HOST_LIBVIRT_GROUP_GID=%s\n' "$HOST_LIBVIRT_GID"

            printf 'DOMAIN_NAME=%s\n' "$domain_name"

            printf 'GUACD_HOSTNAME=%s\n' "$CONTAINER_GUACD"
            printf 'POSTGRESQL_HOSTNAME=%s\n' "$CONTAINER_DB"
            printf 'POSTGRESQL_DATABASE=%s\n' "$POSTGRESQL_DATABASE"
            printf 'POSTGRESQL_USER=%s\n' "$POSTGRESQL_USER"
            printf 'POSTGRESQL_PASSWORD=%s\n' "$POSTGRESQL_PASSWORD"

            printf 'DIR_DB=%s\n' "$DIR_DOCKER_HOST_DB"
            printf 'DIR_TRAEFIK=%s\n' "$DIR_DOCKER_HOST_TRAEFIK_CONFIG"

            printf 'POOL_LIBVIRT_ISO_IMAGES=%\n' "$POOL_LIBVIRT_ISO_IMAGES"

            printf 'NETWORK_RAS_NAME=%s\n' "$NETWORK_RAS_NAME" 

        } >> "${DIR_DOCKER_HOST}/.env" 2>>"$ERR_LOG"

    } 2>>"$ERR_LOG"

    printf 'Creating initial SQL file for Apache Guacamole DB.\n'
    docker run -q --rm guacamole/guacamole /opt/guacamole/bin/initdb.sh --postgresql > "${DIR_DOCKER_HOST_INITDB}/01-initdb.sql" 2>>"$ERR_LOG"

    chown -R "$SYSTEM_WORKER_USERNAME":"$SYSTEM_WORKER_GROUPNAME" "$DIR_DOCKER_HOST"
}

configure_daemon_libvirt(){
    printf 'Enabling libvirt monolithic daemon to run on startup.\n'
    systemctl -q enable libvirtd.service >/dev/null 2>>"$ERR_LOG"
    printf 'Enabling libvirt admin UNIX domain socket to run on startup.\n'
    systemctl -q enable libvirtd-admin.socket >/dev/null 2>>"$ERR_LOG"
    printf 'Starting libvirt monolithic daemon.\n'
    systemctl -q start libvirtd.service >/dev/null 2>>"$ERR_LOG"
    printf 'Starting libvirt UNIX socket.\n'
    systemctl -q start libvirtd-admin.socket >/dev/null 2>>"$ERR_LOG"
    printf 'Creating default storage pools.\n'
    {
        virsh pool-define-as "$POOL_LIBVIRT_DISK_IMAGES_NAME" dir --target "$POOL_LIBVIRT_DISK_IMAGES"
        virsh pool-build "$POOL_LIBVIRT_DISK_IMAGES_NAME"
        virsh pool-start "$POOL_LIBVIRT_DISK_IMAGES_NAME"
        virsh pool-autostart "$POOL_LIBVIRT_DISK_IMAGES_NAME"
        chown -R "$SYSTEM_WORKER_USERNAME":"$SYSTEM_WORKER_GROUPNAME" "$POOL_LIBVIRT_DISK_IMAGES_NAME"

        virsh pool-define-as "$POOL_LIBVIRT_ISO_IMAGES_NAME" dir --target "$POOL_LIBVIRT_ISO_IMAGES"
        virsh pool-build "$POOL_LIBVIRT_ISO_IMAGES_NAME"
        virsh pool-start "$POOL_LIBVIRT_ISO_IMAGES_NAME"
        virsh pool-autostart "$POOL_LIBVIRT_ISO_IMAGES_NAME"
        chown -R "$SYSTEM_WORKER_USERNAME":"$SYSTEM_WORKER_GROUPNAME" "$POOL_LIBVIRT_ISO_IMAGES"

        virsh pool-define-as "$POOL_LIBVIRT_NFS_NAME" dir --target "$POOL_LIBVIRT_NFS"
        virsh pool-build "$POOL_LIBVIRT_NFS_NAME"
        virsh pool-start "$POOL_LIBVIRT_NFS_NAME"
        virsh pool-autostart "$POOL_LIBVIRT_NFS_NAME"
        chown -R "$SYSTEM_WORKER_USERNAME":"$SYSTEM_WORKER_GROUPNAME" "$POOL_LIBVIRT_NFS"
    } >/dev/null 2>>"$ERR_LOG"
    printf 'Creating networks and bridges.\n'
    {
        local prefix_network_ras
        local netmask_network_ras
        local dhcp_start_network_ras
        local dhcp_end_network_ras

        prefix_network_ras=$(yq eval ".networks.${NETWORK_RAS_NAME}.network" "$SETTINGS_FILE")
        netmask_network_ras=$(yq eval ".networks.${NETWORK_RAS_NAME}.netmask" "$SETTINGS_FILE")
        dhcp_start_network_ras=$(yq eval ".networks.${NETWORK_RAS_NAME}.dhcp_start" "$SETTINGS_FILE")
        dhcp_end_network_ras=$(yq eval ".networks.${NETWORK_RAS_NAME}.dhcp_end" "$SETTINGS_FILE")

        local network_ras="
            <network>
                <name>$NETWORK_RAS_NAME</name>
                <bridge name='${BR_RASBR}' stp='off' delay='0'/>
                <ip address='${prefix_network_ras%.*}.1' prefix='$netmask_network_ras'>
                    <dhcp>
                        <range start='$dhcp_start_network_ras' end='$dhcp_end_network_ras'/>
                    </dhcp>
                </ip>
            </network>
        "
        virsh net-define --file <(echo "$network_ras")
        virsh net-start "$NETWORK_RAS_NAME"
        virsh net-autostart "$NETWORK_RAS_NAME"

        local prefix_network_vm
        local netmask_network_vm
        local dhcp_start_network_vm
        local dhcp_end_network_vm

        prefix_network_vm=$(yq eval ".networks.${NETWORK_VM_NAME}.network" "$SETTINGS_FILE")
        netmask_network_vm=$(yq eval ".networks.${NETWORK_VM_NAME}.netmask" "$SETTINGS_FILE")
        dhcp_start_network_vm=$(yq eval ".networks.${NETWORK_VM_NAME}.dhcp_start" "$SETTINGS_FILE")
        dhcp_end_network_vm=$(yq eval ".networks.${NETWORK_VM_NAME}.dhcp_end" "$SETTINGS_FILE")

        local network_vm="
            <network>
                <name>$NETWORK_VM_NAME</name>
                <bridge name='${BR_VMBR}' stp='off' delay='0'/>
                <forward mode='nat'/>
                <ip address='${prefix_network_vm%.*}.1' prefix='$netmask_network_vm'>
                    <dhcp>
                        <range start='$dhcp_start_network_vm' end='$dhcp_end_network_vm'/>
                    </dhcp>
                </ip>
            </network>
        "

        virsh net-define --file <(echo "$network_vm")
        virsh net-start "$NETWORK_VM_NAME"
        virsh net-autostart "$NETWORK_VM_NAME"

    }

     if systemctl -q is-active firewalld; then
        printf 'Modifying libvirt firewalld zone.\n'
        {
            firewall-cmd --add-service=vnc-server --zone=libvirt --permanent
            firewall-cmd --add-service=rdp --zone=libvirt --permanent
            firewall-cmd --reload
        } >/dev/null 2>>"$ERR_LOG"
    fi
}

create_docker_networks(){
    printf 'Creating internal Docker network.\n'

    docker network create \
    -o "com.docker.network.bridge.enable_icc"="true" \
    -o "com.docker.network.bridge.name"="$NETWORK_DOCKER_INTERNAL_NAME" \
    --driver=bridge \
    --internal "$NETWORK_DOCKER_INTERNAL_NAME" >/dev/null 2>>"$ERR_LOG"

    {
        NETWORK_DOCKER_INTERNAL_SUBNET=$(docker network inspect -f '{{ (index .IPAM.Config 0).Subnet }}' "$NETWORK_DOCKER_INTERNAL_NAME")
        NETWORK_DOCKER_INTERNAL_GATEWAY=$(docker network inspect -f '{{ (index .IPAM.Config 0).Gateway }}' "$NETWORK_DOCKER_INTERNAL_NAME")
    } >/dev/null 2>>"$ERR_LOG"
    
    printf 'Adding internal Docker network to .env file\n'
    {
        printf 'NETWORK_DOCKER_INTERNAL_SUBNET=%s\n' "$NETWORK_DOCKER_INTERNAL_SUBNET"
    } >> "${DIR_DOCKER_HOST}/.env" 2>>"$ERR_LOG"
    

    if systemctl -q is-active firewalld; then
        printf 'Adding internal Docker network to docker firewalld zone.\n'
        {
            firewall-cmd --add-interface="$NETWORK_DOCKER_INTERNAL_NAME" --zone=docker --permanent
            firewall-cmd --reload
        } >/dev/null 2>>"$ERR_LOG"
    fi

    printf 'Adding internal Docker network firewall rules.\n'
    {
        iptables -w -I DOCKER-USER -s "$NETWORK_DOCKER_INTERNAL_SUBNET" -d "$NETWORK_DOCKER_INTERNAL_GATEWAY" -j DROP
        iptables -w -I OUTPUT -o "$NETWORK_DOCKER_INTERNAL_NAME" -j DROP
        iptables -w -I OUTPUT -d "$NETWORK_DOCKER_INTERNAL_GATEWAY" -j DROP
        iptables -w -I FORWARD -i "$NETWORK_DOCKER_INTERNAL_NAME" ! -s "$NETWORK_DOCKER_INTERNAL_SUBNET" -d "$NETWORK_DOCKER_INTERNAL_SUBNET" -j DROP
    } >/dev/null 2>>"$ERR_LOG"

    iptables-save >/dev/null 2>>"$ERR_LOG"
}

create_systemd_services(){
    printf 'Creating custom systemd services.\n'
    {
        cp -r "${DIR_SYSTEMD_SERVICES_INST}/." "$DIR_SYSTEMD_SERVICES"
        systemctl -q --now daemon-reload
    } >/dev/null 2>>"$ERR_LOG"
}

initialize_cherry_vm_studio(){
    printf 'Enabling Cherry VM Studio to run on startup.\n'
    systemctl -q enable cherry-vm-studio.service >/dev/null 2>>"$ERR_LOG"
    printf 'Starting Cherry VM Studio stack.\n'
    systemctl -q start cherry-vm-studio.service >/dev/null 2>>"$ERR_LOG"
}
###############################
# windowed installation part
###############################
# Color definitons for dialog windows
RED='\Z1'
NC='\Z0'
# Exit on error
set -euo pipefail
#Trap EXIT signal to clean messy dialog boxes on exit
dialog_cleanup(){
    packagekit_restore
    tput rmcup
    tput cnorm
    # clear 
    reset # Hangs the terminal for a while, but manages to clear the junk that clear leaves in certain types of terminals
    rm -rf "${ERR_LOG}"
} 
trap dialog_cleanup EXIT
# Trap ERR signal to handle exceptions and exit gracefully
error_handler(){
    dialog --colors --backtitle "Cherry VM Studio" --title "Error Details" --exit-label "Exit" --textbox "$ERR_LOG" 0 0
    exit 1
}
trap error_handler ERR
# Trap SIGINT signal to handle forced exits gracefully
sigint_handler(){
    dialog --backtitle "Cherry VM Studio" --msgbox "Forced to exit!\n\nInstallation was not completed.\nRun the removal script to clean the artefacts and install again." 0 0
    exit 1
}
trap sigint_handler SIGINT
# Prepare for dialog display
clear
tput civis #Hide cursor
tput smcup #Switch to alternate screen buffer

if ! dialog --colors --backtitle "Cherry VM Studio" --title "Installation" --yesno "\nWelcome to the Cherry VM Studio installer.\nYou're about to be guided through the main stack installation.\n\n${RED}It is highly recommended to consult the documentation prior to running the installation!${NC}\n\nWould you like to begin?" 12 100; then
    exit 1
fi

if [[ -f "$CVMS_INSTALLATION_LOCK" ]]; then
    printf "Cherry VM Studio seems to have been already installed.\nYou cannot begin another installation while Cherry VM Studio is present on the system." >>"$ERR_LOG"
    return 1
fi

# Ensure that the network stack on the host machine is managed by wicked instead of NetworkManager (mostly important on desktop systems)
check_wicked

# Ask for a valid (sub)domain name
while :; do
    # Show previously hidden cursor to be visible inside the inputbox
    tput cnorm

    DOMAIN_NAME=$(dialog --colors --backtitle "Cherry VM Studio" --title "Domain name" --stdout --no-cancel --inputbox "Enter valid (sub)domain name for the Cherry VM Studio stack.\n\nValid input should look like:\n- test.com\n- sub.test.com\n- sub.[...].test.com\n" 0 0)

    if [[ ! "$DOMAIN_NAME" =~ ^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$ ]]; then
        dialog --colors --backtitle "Cherry VM Studio" --title "Domain name" --msgbox "Invalid domain name!\n\nPlease try again." 8 50
    else
        # Hide the cursor once again
        tput civis
        dialog --colors --backtitle "Cherry VM Studio" --title "Domain name" --msgbox "Domain name accepted: $DOMAIN_NAME" 7 50
        break
    fi

done
# Check for its existence - lookup DNS records
while :; do
    dialog --colors --backtitle "Cherry VM Studio" --title "DNS Configuration" --msgbox "For the provided domain name Cherry VM Studio requires an appropriate wildcard DNS record to be created:\n*.$DOMAIN_NAME IN A <server_ip>\n${RED}This step must be performed manually!${NC}" 0 0

    if ! nslookup "$DOMAIN_NAME" >/dev/null 2>>"$ERR_LOG"; then
        dialog --colors --backtitle "Cherry VM Studio" --title "DNS Configuration" --msgbox "DNS record not found!\n\nPlease try again." 8 50
    else
        break
    fi 
done

# install_packages | dialog --colors --backtitle "Cherry VM Studio" --title "Packages installation" --progressbox 20 100;

prepare_filesystem | dialog --colors --backtitle "Cherry VM Studio" --title "Filesystem preparation" --progressbox 20 100;

create_system_user | dialog --colors --backtitle "Cherry VM Studio" --title "System configuration" --progressbox 20 100;

# configure_polkit | dialog --colors --backtitle "Cherry VM Studio" --title "Polkit configuration" --progressbox 20 100;

create_networks | dialog --colors --backtitle "Cherry VM Studio" --title "Randomising internal network addresses" --progressbox 20 100;

configure_daemon_docker "$DOMAIN_NAME" | dialog --colors --backtitle "Cherry VM Studio" --title "Docker daemon configuration" --progressbox 20 100;

configure_daemon_libvirt | dialog --colors --backtitle "Cherry VM Studio" --title "Libvirt daemon configuration" --progressbox 20 100;

create_docker_networks | dialog --colors --backtitle "Cherry VM Studio" --title "Docker networks creation" --progressbox 20 100;

create_systemd_services | dialog --colors --backtitle "Cherry VM Studio" --title "Systemd services creation" --progressbox 20 100;

: ' # DO NOT UNCOMMENT BEFORE TESTING ALL OF THE SYSTEMD SERVCIES
initialize_cherry_vm_studio | dialog --colors --backtitle "Cherry VM Studio" --title "Cherry VM Studio final initialization" --progressbox 20 100;
'

dialog --colors --backtitle "Cherry VM Studio" --title "Installation complete" --msgbox "Cherry VM Studio was succesfully installed on your system.\nCherry Admin Panel can be accessed at https://${DOMAIN_NAME}.\nShould you encounter any technical issues, feel free to report them to the developers on GitHub." 20 100;
