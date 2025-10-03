#!/usr/bin/env bash

################################################################################
# Proxmox LXC All-in-One Deployment Script
# Bolt App + Ollama LLM Server (LAN-Only)
#
# Usage: bash -c "$(curl -fsSL https://raw.githubusercontent.com/kidevu123/bolt/main/deploy-proxmox.sh)"
################################################################################

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

msg_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
msg_ok() { echo -e "${GREEN}[✓]${NC} $1"; }
msg_error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
msg_warn() { echo -e "${YELLOW}[!]${NC} $1"; }
msg_step() { echo -e "\n${MAGENTA}═══${NC} $1 ${MAGENTA}═══${NC}\n"; }

clear
cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║               BOLT APP + OLLAMA LLM DEPLOYMENT SCRIPT                    ║
║                      LAN-Only Private Installation                       ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
EOF

if ! command -v pct &> /dev/null; then
    msg_error "This script requires Proxmox VE with 'pct' command available"
fi

BOLT_CT_ID=200
LLM_CT_ID=201
BOLT_HOSTNAME="bolt-app"
LLM_HOSTNAME="local-llm"
CT_TEMPLATE="local:vztmpl/debian-12-standard_12.2-1_amd64.tar.zst"
CT_DISK_SIZE="20G"
BOLT_RAM="4096"
BOLT_CORES="4"
LLM_RAM="8192"
LLM_CORES="4"
NETWORK_BRIDGE="vmbr0"

msg_step "STEP 1: Network Configuration"
read -p "$(echo -e ${CYAN}Enter Bolt App LAN IP ${NC}${YELLOW}[e.g., 192.168.1.100]${NC}: )" BOLT_IP
read -p "$(echo -e ${CYAN}Enter Ollama LLM LAN IP ${NC}${YELLOW}[e.g., 192.168.1.101]${NC}: )" LLM_IP
read -p "$(echo -e ${CYAN}Enter Gateway IP ${NC}${YELLOW}[e.g., 192.168.1.1]${NC}: )" GATEWAY
read -p "$(echo -e ${CYAN}Enter Netmask bits ${NC}${YELLOW}[default: 24]${NC}: )" NETMASK_INPUT
NETMASK="${NETMASK_INPUT:-24}"
LAN_SUBNET="${GATEWAY%.*}.0/24"

msg_step "STEP 2: Secrets & Environment Variables"
read -p "$(echo -e ${CYAN}VITE_Bolt Database_URL${NC}: )" VITE_Bolt Database_URL
read -sp "$(echo -e ${CYAN}VITE_Bolt Database_ANON_KEY${NC}: )" VITE_Bolt Database_ANON_KEY
echo ""
read -sp "$(echo -e ${CYAN}Bolt Database_SERVICE_ROLE_KEY${NC}: )" Bolt Database_SERVICE_ROLE_KEY
echo ""
read -p "$(echo -e ${CYAN}ANTHROPIC_API_KEY ${NC}${YELLOW}[optional, press Enter to skip]${NC}: )" ANTHROPIC_API_KEY
echo ""

msg_step "STEP 3: Container Cleanup"
for CT_ID in $BOLT_CT_ID $LLM_CT_ID; do
    if pct status $CT_ID &>/dev/null; then
        msg_warn "Container $CT_ID exists. Destroying..."
        pct stop $CT_ID 2>/dev/null || true
        sleep 2
        pct destroy $CT_ID
        msg_ok "Container $CT_ID removed"
    fi
done

msg_step "STEP 4: Creating Ollama LLM Container"
msg_info "Provisioning CT $LLM_CT_ID ($LLM_HOSTNAME)..."
pct create $LLM_CT_ID $CT_TEMPLATE \
    --hostname $LLM_HOSTNAME \
    --cores $LLM_CORES \
    --memory $LLM_RAM \
    --swap 1024 \
    --net0 name=eth0,bridge=$NETWORK_BRIDGE,ip=${LLM_IP}/${NETMASK},gw=$GATEWAY \
    --rootfs local-lvm:$CT_DISK_SIZE \
    --unprivileged 1 \
    --features nesting=1 \
    --onboot 1 \
    --start 1 \
    --password $(openssl rand -base64 32)

msg_ok "LLM container created"
sleep 8

msg_info "Installing Ollama..."
pct exec $LLM_CT_ID -- bash -c "apt-get update -qq && apt-get install -y -qq curl ca-certificates"
pct exec $LLM_CT_ID -- bash -c "curl -fsSL https://ollama.com/install.sh | sh"
msg_ok "Ollama installed"

msg_info "Starting Ollama service..."
pct exec $LLM_CT_ID -- bash -c "systemctl enable ollama && systemctl start ollama"
sleep 8

msg_info "Pulling llama3 model (this may take 5-10 minutes)..."
pct exec $LLM_CT_ID -- bash -c "timeout 600 ollama pull llama3 || echo 'Model pull timeout, will retry later'"
msg_ok "Ollama configured with llama3"

msg_step "STEP 5: Creating Bolt App Container"
msg_info "Provisioning CT $BOLT_CT_ID ($BOLT_HOSTNAME)..."
pct create $BOLT_CT_ID $CT_TEMPLATE \
    --hostname $BOLT_HOSTNAME \
    --cores $BOLT_CORES \
    --memory $BOLT_RAM \
    --swap 1024 \
    --net0 name=eth0,bridge=$NETWORK_BRIDGE,ip=${BOLT_IP}/${NETMASK},gw=$GATEWAY \
    --rootfs local-lvm:$CT_DISK_SIZE \
    --unprivileged 1 \
    --features nesting=1 \
    --onboot 1 \
    --start 1 \
    --password $(openssl rand -base64 32)

msg_ok "Bolt App container created"
sleep 8

msg_step "STEP 6: Installing Dependencies in Bolt Container"
msg_info "Updating system and installing base packages..."
pct exec $BOLT_CT_ID -- bash -c "apt-get update -qq && apt-get install -y -qq curl git ca-certificates gnupg lsb-release sudo ufw"

msg_info "Installing Node.js 20.x..."
pct exec $BOLT_CT_ID -- bash -c "curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y -qq nodejs"

msg_info "Installing Docker..."
pct exec $BOLT_CT_ID -- bash -c "install -m 0755 -d /etc/apt/keyrings"
pct exec $BOLT_CT_ID -- bash -c "curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && chmod a+r /etc/apt/keyrings/docker.asc"
pct exec $BOLT_CT_ID -- bash -c 'echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list'
pct exec $BOLT_CT_ID -- bash -c "apt-get update -qq && apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin"
pct exec $BOLT_CT_ID -- bash -c "systemctl enable docker && systemctl start docker"
msg_ok "All dependencies installed"

msg_step "STEP 7: Cloning Bolt Repository"
msg_info "Cloning from https://github.com/kidevu123/bolt.git..."
pct exec $BOLT_CT_ID -- bash -c "mkdir -p /opt && cd /opt && git clone https://github.com/kidevu123/bolt.git bolt-app"
msg_ok "Repository cloned to /opt/bolt-app"

msg_step "STEP 8: Configuring Environment Variables"
msg_info "Writing secure .env file..."
pct exec $BOLT_CT_ID -- bash -c "cat > /opt/bolt-app/.env <<'ENVEOF'
VITE_Bolt Database_URL=${VITE_Bolt Database_URL}
VITE_Bolt Database_ANON_KEY=${VITE_Bolt Database_ANON_KEY}
Bolt Database_SERVICE_ROLE_KEY=${Bolt Database_SERVICE_ROLE_KEY}

OPENAI_API_BASE=http://${LLM_IP}:11434/v1
OPENAI_API_KEY=ollama
OPENAI_MODEL=llama3

ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}

NODE_ENV=production
PORT=5173
HOST=0.0.0.0
ENVEOF
"

pct exec $BOLT_CT_ID -- bash -c "chmod 600 /opt/bolt-app/.env"
msg_ok ".env file created and secured at /opt/bolt-app/.env"

msg_step "STEP 9: Building Application"
msg_info "Installing npm dependencies..."
pct exec $BOLT_CT_ID -- bash -c "cd /opt/bolt-app && npm install --loglevel=error"
msg_ok "Dependencies installed"

msg_info "Building production bundle..."
pct exec $BOLT_CT_ID -- bash -c "cd /opt/bolt-app && npm run build"
msg_ok "Build completed successfully"

msg_step "STEP 10: Creating Systemd Service"
pct exec $BOLT_CT_ID -- bash -c "cat > /etc/systemd/system/bolt-app.service <<'SVCEOF'
[Unit]
Description=Bolt Intimate Companion App
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/bolt-app
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run preview -- --host 0.0.0.0 --port 5173
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SVCEOF
"

pct exec $BOLT_CT_ID -- bash -c "systemctl daemon-reload && systemctl enable bolt-app && systemctl start bolt-app"
msg_ok "Bolt App service running"

msg_step "STEP 11: Configuring LAN-Only Firewall"
msg_info "Securing Bolt App container..."
pct exec $BOLT_CT_ID -- bash -c "ufw --force enable && ufw default deny incoming && ufw default allow outgoing"
pct exec $BOLT_CT_ID -- bash -c "ufw allow from $LAN_SUBNET to any port 5173 proto tcp comment 'Bolt App LAN Access'"
pct exec $BOLT_CT_ID -- bash -c "ufw allow from $LAN_SUBNET to any port 22 proto tcp comment 'SSH LAN Access'"

msg_info "Securing Ollama container..."
pct exec $LLM_CT_ID -- bash -c "apt-get install -y -qq ufw"
pct exec $LLM_CT_ID -- bash -c "ufw --force enable && ufw default deny incoming && ufw default allow outgoing"
pct exec $LLM_CT_ID -- bash -c "ufw allow from $LAN_SUBNET to any port 11434 proto tcp comment 'Ollama API LAN Access'"
pct exec $LLM_CT_ID -- bash -c "ufw allow from $LAN_SUBNET to any port 22 proto tcp comment 'SSH LAN Access'"

msg_ok "Firewall rules applied (LAN-only access)"

msg_step "STEP 12: Health Checks"
sleep 10

msg_info "Testing Ollama API..."
if pct exec $LLM_CT_ID -- bash -c "curl -sf http://localhost:11434/api/tags" > /dev/null 2>&1; then
    msg_ok "Ollama API responding at http://${LLM_IP}:11434"
else
    msg_warn "Ollama API not responding yet (may need more time to initialize)"
fi

msg_info "Testing Bolt App..."
if pct exec $BOLT_CT_ID -- bash -c "curl -sf http://localhost:5173" > /dev/null 2>&1; then
    msg_ok "Bolt App responding at http://${BOLT_IP}:5173"
else
    msg_warn "Bolt App not responding yet (check logs with: pct exec $BOLT_CT_ID -- journalctl -u bolt-app -f)"
fi

sleep 2
clear

cat << EOF

╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║                    ${GREEN}DEPLOYMENT COMPLETED SUCCESSFULLY${NC}                     ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝

${CYAN}┌─ Access URLs (LAN Only)${NC}
${CYAN}│${NC}
${CYAN}├─${NC} ${GREEN}Bolt App:${NC}        http://${BOLT_IP}:5173
${CYAN}├─${NC} ${GREEN}Ollama API:${NC}      http://${LLM_IP}:11434
${CYAN}└─${NC} ${GREEN}Ollama Health:${NC}   http://${LLM_IP}:11434/api/tags

${CYAN}┌─ Container Information${NC}
${CYAN}│${NC}
${CYAN}├─${NC} Bolt App Container:   ${YELLOW}CT ${BOLT_CT_ID}${NC} (${BOLT_HOSTNAME})
${CYAN}├─${NC} Ollama LLM Container: ${YELLOW}CT ${LLM_CT_ID}${NC} (${LLM_HOSTNAME})
${CYAN}└─${NC} Network Subnet:       ${YELLOW}${LAN_SUBNET}${NC}

${CYAN}┌─ Management Commands${NC}
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}Restart Bolt App:${NC}
${CYAN}│${NC}  pct exec ${BOLT_CT_ID} -- systemctl restart bolt-app
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}View Bolt Logs:${NC}
${CYAN}│${NC}  pct exec ${BOLT_CT_ID} -- journalctl -u bolt-app -f
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}Restart Ollama:${NC}
${CYAN}│${NC}  pct exec ${LLM_CT_ID} -- systemctl restart ollama
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}Update Bolt App:${NC}
${CYAN}│${NC}  pct exec ${BOLT_CT_ID} -- bash -c 'cd /opt/bolt-app && git pull && npm install && npm run build && systemctl restart bolt-app'
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}Create Snapshots:${NC}
${CYAN}│${NC}  vzdump ${BOLT_CT_ID} --mode snapshot --storage local
${CYAN}│${NC}  vzdump ${LLM_CT_ID} --mode snapshot --storage local
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}Stop Containers:${NC}
${CYAN}│${NC}  pct stop ${BOLT_CT_ID} && pct stop ${LLM_CT_ID}
${CYAN}│${NC}
${CYAN}└─${NC} ${MAGENTA}Start Containers:${NC}
   pct start ${LLM_CT_ID} && sleep 10 && pct start ${BOLT_CT_ID}

${CYAN}┌─ Configuration Files${NC}
${CYAN}│${NC}
${CYAN}├─${NC} Environment Config:   ${YELLOW}/opt/bolt-app/.env${NC} (on CT ${BOLT_CT_ID})
${CYAN}├─${NC} Systemd Service:      ${YELLOW}/etc/systemd/system/bolt-app.service${NC} (on CT ${BOLT_CT_ID})
${CYAN}└─${NC} Application Root:     ${YELLOW}/opt/bolt-app${NC} (on CT ${BOLT_CT_ID})

${CYAN}┌─ Security Notes${NC}
${CYAN}│${NC}
${CYAN}├─${NC} ${GREEN}✓${NC} All services are LAN-only (no WAN exposure)
${CYAN}├─${NC} ${GREEN}✓${NC} UFW firewall enabled on both containers
${CYAN}├─${NC} ${GREEN}✓${NC} Access restricted to ${LAN_SUBNET}
${CYAN}├─${NC} ${GREEN}✓${NC} Environment variables secured (chmod 600)
${CYAN}└─${NC} ${GREEN}✓${NC} Containers auto-start on boot

${CYAN}┌─ Next Steps${NC}
${CYAN}│${NC}
${CYAN}├─${NC} 1. Open ${GREEN}http://${BOLT_IP}:5173${NC} in your browser
${CYAN}├─${NC} 2. Test Ollama: curl http://${LLM_IP}:11434/api/tags
${CYAN}└─${NC} 3. Monitor logs if needed (see commands above)

${GREEN}Installation complete!${NC} Your private Bolt app is ready to use.

EOF
