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
readonly INSTALLER_ROOTPATH='./installer-files'
readonly ENV_FILE="${INSTALLER_ROOTPATH}/env.sh"

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

###############################
#   system configuration
###############################
# Parts regarding libvirt cleanup do not work yet - not implemented.\
# Rethink if can be moved into cherr-vm-studio service.
remove_vm_networks(){
    printf 'Removing a default NAT network for VMs.\n'
    {
        virsh net-undefine --network isolated-nat # Replace network name with a variable
        virsh net-destroy --network isolated-nat
    } >/dev/null 2>>"$ERR_LOG"

}

remove_vm_firewall(){
    printf 'Removing network filter to restrict inter VM communication.\n'
    virsh nwfilter-undefine isolated-nat-filter >/dev/null 2>>"$ERR_LOG"
}

remove_cvms_stack(){
    printf 'Stopping and removing all of the Cherry VM Studio stack components.'
    systemctl stop cherry-vm-studio.service >/dev/null 2>>"$ERR_LOG"
    printf 'Disabling Cherry VM Studio service.'
    systemctl disable cherry-vm-studio.service >/dev/null 2>>"$ERR_LOG"
}

# Withot stateful rollback of the system state it should not be used
configure_daemon_libvirt(){
    printf 'Disabling libvirt monolithic daemon from running on startup.\n'
    systemctl -q disable libvirtd.service >/dev/null 2>>"$ERR_LOG"
    printf 'Stopping libvirt monolithic daemon.'
    systemctl -q stop libvirtd.service >/dev/null 2>>"$ERR_LOG"
}
# Withot stateful rollback of the system state it should not be used
configure_daemon_docker(){
    printf 'Disabling docker daemon from running on startup.\n'
    systemctl -q disable docker.service >/dev/null 2>>"$ERR_LOG"
    printf 'Stopping docker daemon.\n'
    systemctl -q stop docker.service >/dev/null 2>>"$ERR_LOG" 
}

remove_docker_networks(){
    
    {
        NETWORK_DOCKER_INTERNAL_SUBNET=$(docker network inspect -f '{{ (index .IPAM.Config 0).Subnet }}' "$NETWORK_DOCKER_INTERNAL_NAME")
        NETWORK_DOCKER_INTERNAL_GATEWAY=$(docker network inspect -f '{{ (index .IPAM.Config 0).Gateway }}' "$NETWORK_DOCKER_INTERNAL_NAME")
    } >/dev/null 2>>"$ERR_LOG"

    if systemctl -q is-active firewalld; then
        printf 'Removing internal Docker network from firewalld zone.\n'
        {
            firewall-cmd --remove-interface="$NETWORK_DOCKER_INTERNAL_NAME" --zone=docker --permanent
            firewall-cmd --reload
        } >/dev/null 2>>"$ERR_LOG"
    fi

    printf 'Removing internal Docker network from firewall rules.\n'
    {
        iptables -w -D DOCKER-USER -s "$NETWORK_DOCKER_INTERNAL_SUBNET" -d "$NETWORK_DOCKER_INTERNAL_GATEWAY" -j DROP
        iptables -w -D OUTPUT -o "$NETWORK_DOCKER_INTERNAL_NAME" -j DROP
        iptables -w -D OUTPUT -d "$NETWORK_DOCKER_INTERNAL_GATEWAY" -j DROP
        iptables -w -D FORWARD -i "$NETWORK_DOCKER_INTERNAL_NAME" ! -s "$NETWORK_DOCKER_INTERNAL_SUBNET" -d "$NETWORK_DOCKER_INTERNAL_SUBNET" -j DROP
    } >/dev/null 2>>"$ERR_LOG"

    iptables-save >/dev/null 2>>"$ERR_LOG"

    printf 'Removing internal Docker network.\n'
    docker network rm "$NETWORK_DOCKER_INTERNAL_NAME" >/dev/null 2>>"$ERR_LOG"
}

remove_user(){
    printf 'Removing CherryWorker system user.\n'
    {
        userdel -f -r "$SYSTEM_WORKER_USERNAME"
        groupdel -f "$SYSTEM_WORKER_USERNAME"
    } >/dev/null 2>>"$ERR_LOG"
}

filesystem_cleanup(){
    printf 'Removing directories and files.\n'
    {
        rm --interactive=never -r -f "$TEMP_ROOTPATH" # locks, any kind of dynamically changing files

        # Polkit rules and actions
        rm --interactive=never -r -f "${DIR_POLKIT_ACTIONS}/com.cvms.container.policy"
        rm --interactive=never -r -f "${DIR_POLKIT_ACTIONS}/com.cvms.stack.policy"
        rm --interactive=never -r -f "${DIR_POLKIT_RULES}/49-cherryworker-container.rules"
        rm --interactive=never -r -f "${DIR_POLKIT_RULES}/49-cherryworker-watchdog.rules"
        rm --interactive=never -r -f "${DIR_POLKIT_RULES}/50-cherryworker-stack.rules"

        # Systemd services
        rm --interactive=never -r -f "${DIR_SYSTEMD_SERVICES}/cherry-containers.service"
        rm --interactive=never -r -f "${DIR_SYSTEMD_SERVICES}/cherry-containers@.service"
        rm --interactive=never -r -f "${DIR_SYSTEMD_SERVICES}/cherry-vm-studio.service"
        rm --interactive=never -r -f "${DIR_SYSTEMD_SERVICES}/cherry-watchdog.service"

        systemctl -q --now daemon-reload

        # rm --interactive=never -r -f "$DIR_IMAGE_FILES" # This part is not relevant right now as no VM creation logic is implemented yet
        # rm --interactive=never -r -f "$DIR_VM_INSTANCES"

        rm --interactive=never -r -f "$STACK_ROOTPATH" # static and config files

    } >/dev/null 2>>"$ERR_LOG"

    printf 'Removing installation lock.\n'
    {
        rm --interactive=never -r -f "$CVMS_INSTALLATION_LOCK"
        # rmdir "$DIR_LOCK"
    } >/dev/null 2>>"$ERR_LOG"
}
###############################
# windowed uninstallation part
###############################
# Color definitons for dialog windows
RED='\Z1'
NC='\Z0'
# Exit on error
set -uo pipefail
#Trap EXIT signal to clean messy dialog boxes on exit
dialog_cleanup(){
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
}
trap error_handler ERR
# Trap SIGINT signal to handle forced exits gracefully
sigint_handler(){
    dialog --backtitle "Cherry VM Studio" --msgbox "Forced to exit!\n\nUninstallation was not completed.\nRun the removal script to clean the artefacts and install again." 0 0
    exit 1
}
trap sigint_handler SIGINT
# Prepare for dialog display
clear
tput civis #Hide cursor
tput smcup #Switch to alternate screen buffer

if ! dialog --colors --backtitle "Cherry VM Studio" --title "Uninstallation" --yesno "\nWelcome to the Cherry VM Studio uninstaller.\nYou're about to be guided through the main stack uninstallation.\nWould you like to begin?" 12 100; then
    exit 1
fi

if [[ ! -f "$CVMS_INSTALLATION_LOCK" ]]; then
    printf "Cherry VM Studio doesn't seem to be installed.\nYou cannot start uninstallation without having installed Cherry VM Studio first." >>"$ERR_LOG"
    error_handler
fi

# remove_cvms_stack | dialog --colors --backtitle "Cherry VM Studio" --title "Stopping Cherry VM Studio stack" --programbox 20 100;

remove_docker_networks | dialog --colors --backtitle "Cherry VM Studio" --title "Removing docker networks" --programbox 20 100;

remove_user | dialog --colors --backtitle "Cherry VM Studio" --title "Removing system user" --programbox 20 100;

filesystem_cleanup | dialog --colors --backtitle "Cherry VM Studio" --title "Cleaning up filesystem" --programbox 20 100;

dialog --colors --backtitle "Cherry VM Studio" --title "Uninstallation complete" --msgbox "Cherry VM Studio was succesfully uninstalled from your system.\nYou may now manually delete the remaining installation files." 20 100;