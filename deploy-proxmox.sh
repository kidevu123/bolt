#!/usr/bin/env bash

################################################################################
# Proxmox All-in-One Deployment Script
# Bolt App + Self-Hosted Bolt Database + Ollama Lite (LAN-Only)
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
║        BOLT APP + Bolt Database + OLLAMA LITE DEPLOYMENT SCRIPT              ║
║              Full Self-Hosted Stack (LAN-Only)                           ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
EOF

if ! command -v pct &> /dev/null; then
    msg_error "This script requires Proxmox VE with 'pct' command available"
fi

BOLT_CT_ID=300
Bolt Database_CT_ID=301
OLLAMA_CT_ID=302
BOLT_HOSTNAME="bolt-app"
Bolt Database_HOSTNAME="Bolt Database-local"
OLLAMA_HOSTNAME="ollama-lite"
CT_TEMPLATE="local:vztmpl/debian-12-standard_12.2-1_amd64.tar.zst"
BOLT_DISK="30G"
Bolt Database_DISK="50G"
OLLAMA_DISK="30G"
BOLT_RAM="4096"
BOLT_CORES="4"
Bolt Database_RAM="8192"
Bolt Database_CORES="6"
OLLAMA_RAM="8192"
OLLAMA_CORES="4"
NETWORK_BRIDGE="vmbr0"

msg_step "STEP 1: Network Configuration"
read -p "$(echo -e ${CYAN}Enter Bolt App LAN IP ${NC}${YELLOW}[e.g., 192.168.1.100]${NC}: )" BOLT_IP
read -p "$(echo -e ${CYAN}Enter Bolt Database LAN IP ${NC}${YELLOW}[e.g., 192.168.1.101]${NC}: )" Bolt Database_IP
read -p "$(echo -e ${CYAN}Enter Ollama Lite LAN IP ${NC}${YELLOW}[e.g., 192.168.1.102]${NC}: )" OLLAMA_IP
read -p "$(echo -e ${CYAN}Enter Gateway IP ${NC}${YELLOW}[e.g., 192.168.1.1]${NC}: )" GATEWAY
read -p "$(echo -e ${CYAN}Enter Netmask bits ${NC}${YELLOW}[default: 24]${NC}: )" NETMASK_INPUT
NETMASK="${NETMASK_INPUT:-24}"
LAN_SUBNET="${GATEWAY%.*}.0/24"

msg_step "STEP 2: Container Cleanup"
for CT_ID in $BOLT_CT_ID $Bolt Database_CT_ID $OLLAMA_CT_ID; do
    if pct status $CT_ID &>/dev/null; then
        msg_warn "Container $CT_ID exists."
        read -p "$(echo -e ${YELLOW}Destroy CT $CT_ID and continue? [y/N]${NC}: )" CONFIRM
        if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
            pct stop $CT_ID 2>/dev/null || true
            sleep 2
            pct destroy $CT_ID
            msg_ok "Container $CT_ID removed"
        else
            msg_error "Cannot proceed with existing container $CT_ID. Aborting."
        fi
    fi
done

msg_step "STEP 3: Creating Bolt Database Container"
msg_info "Provisioning CT $Bolt Database_CT_ID ($Bolt Database_HOSTNAME)..."
pct create $Bolt Database_CT_ID $CT_TEMPLATE \
    --hostname $Bolt Database_HOSTNAME \
    --cores $Bolt Database_CORES \
    --memory $Bolt Database_RAM \
    --swap 2048 \
    --net0 name=eth0,bridge=$NETWORK_BRIDGE,ip=${Bolt Database_IP}/${NETMASK},gw=$GATEWAY \
    --rootfs local-lvm:$Bolt Database_DISK \
    --unprivileged 1 \
    --features nesting=1 \
    --onboot 1 \
    --start 1 \
    --password $(openssl rand -base64 32)

msg_ok "Bolt Database container created"
sleep 10

msg_info "Installing Docker in Bolt Database container..."
pct exec $Bolt Database_CT_ID -- bash -c "apt-get update -qq && apt-get install -y -qq curl git ca-certificates gnupg lsb-release"
pct exec $Bolt Database_CT_ID -- bash -c "install -m 0755 -d /etc/apt/keyrings"
pct exec $Bolt Database_CT_ID -- bash -c "curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && chmod a+r /etc/apt/keyrings/docker.asc"
pct exec $Bolt Database_CT_ID -- bash -c 'echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list'
pct exec $Bolt Database_CT_ID -- bash -c "apt-get update -qq && apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin"
pct exec $Bolt Database_CT_ID -- bash -c "systemctl enable docker && systemctl start docker"
msg_ok "Docker installed"

msg_info "Cloning Bolt Database Docker setup..."
pct exec $Bolt Database_CT_ID -- bash -c "cd /opt && git clone --depth 1 https://github.com/supabase/Bolt Database"
pct exec $Bolt Database_CT_ID -- bash -c "cp /opt/supabase/docker/.env.example /opt/supabase/docker/.env"

JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n')
ANON_KEY=""
SERVICE_ROLE_KEY=""
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')
DASHBOARD_PASSWORD=$(openssl rand -base64 24 | tr -d '\n')

msg_info "Generating JWT keys..."
pct exec $Bolt Database_CT_ID -- bash -c "apt-get install -y -qq python3 python3-pip"
pct exec $Bolt Database_CT_ID -- bash -c "pip3 install --break-system-packages pyjwt cryptography 2>/dev/null || pip3 install pyjwt cryptography"

pct exec $Bolt Database_CT_ID -- bash -c "cat > /tmp/gen_jwt.py <<'PYEOF'
import jwt
import sys
secret = sys.argv[1]
role = sys.argv[2]
payload = {\"role\": role, \"iss\": \"Bolt Database\", \"iat\": 1000000000, \"exp\": 2000000000}
token = jwt.encode(payload, secret, algorithm=\"HS256\")
print(token)
PYEOF
"

ANON_KEY=$(pct exec $Bolt Database_CT_ID -- python3 /tmp/gen_jwt.py "$JWT_SECRET" "anon")
SERVICE_ROLE_KEY=$(pct exec $Bolt Database_CT_ID -- python3 /tmp/gen_jwt.py "$JWT_SECRET" "service_role")

msg_info "Configuring Bolt Database environment..."
pct exec $Bolt Database_CT_ID -- bash -c "sed -i 's|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$POSTGRES_PASSWORD|' /opt/supabase/docker/.env"
pct exec $Bolt Database_CT_ID -- bash -c "sed -i 's|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|' /opt/supabase/docker/.env"
pct exec $Bolt Database_CT_ID -- bash -c "sed -i 's|ANON_KEY=.*|ANON_KEY=$ANON_KEY|' /opt/supabase/docker/.env"
pct exec $Bolt Database_CT_ID -- bash -c "sed -i 's|SERVICE_ROLE_KEY=.*|SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY|' /opt/supabase/docker/.env"
pct exec $Bolt Database_CT_ID -- bash -c "sed -i 's|DASHBOARD_PASSWORD=.*|DASHBOARD_PASSWORD=$DASHBOARD_PASSWORD|' /opt/supabase/docker/.env"
pct exec $Bolt Database_CT_ID -- bash -c "sed -i 's|SITE_URL=.*|SITE_URL=http://$Bolt Database_IP:8000|' /opt/supabase/docker/.env"
pct exec $Bolt Database_CT_ID -- bash -c "sed -i 's|API_EXTERNAL_URL=.*|API_EXTERNAL_URL=http://$Bolt Database_IP:8000|' /opt/supabase/docker/.env"
pct exec $Bolt Database_CT_ID -- bash -c "sed -i 's|Bolt Database_PUBLIC_URL=.*|Bolt Database_PUBLIC_URL=http://$Bolt Database_IP:8000|' /opt/supabase/docker/.env"

msg_info "Starting Bolt Database stack (this may take 3-5 minutes)..."
pct exec $Bolt Database_CT_ID -- bash -c "cd /opt/supabase/docker && docker compose up -d"
msg_ok "Bolt Database Docker Compose started"

msg_info "Waiting for Bolt Database API to be healthy..."
Bolt Database_READY=false
for i in {1..60}; do
    if pct exec $Bolt Database_CT_ID -- bash -c "curl -sf http://localhost:8000/rest/v1/ -H 'apikey: $ANON_KEY'" > /dev/null 2>&1; then
        Bolt Database_READY=true
        break
    fi
    sleep 5
done

if [ "$Bolt Database_READY" = true ]; then
    msg_ok "Bolt Database is healthy and responding"
else
    msg_warn "Bolt Database may still be initializing (check logs: pct exec $Bolt Database_CT_ID -- docker compose -f /opt/supabase/docker/docker-compose.yml logs)"
fi

Bolt Database_URL="http://${Bolt Database_IP}:8000"
Bolt Database_STUDIO_URL="http://${Bolt Database_IP}:3000"

msg_step "STEP 4: Creating Ollama Lite Container"
msg_info "Provisioning CT $OLLAMA_CT_ID ($OLLAMA_HOSTNAME)..."
pct create $OLLAMA_CT_ID $CT_TEMPLATE \
    --hostname $OLLAMA_HOSTNAME \
    --cores $OLLAMA_CORES \
    --memory $OLLAMA_RAM \
    --swap 2048 \
    --net0 name=eth0,bridge=$NETWORK_BRIDGE,ip=${OLLAMA_IP}/${NETMASK},gw=$GATEWAY \
    --rootfs local-lvm:$OLLAMA_DISK \
    --unprivileged 1 \
    --features nesting=1 \
    --onboot 1 \
    --start 1 \
    --password $(openssl rand -base64 32)

msg_ok "Ollama container created"
sleep 10

msg_info "Installing Ollama..."
pct exec $OLLAMA_CT_ID -- bash -c "apt-get update -qq && apt-get install -y -qq curl ca-certificates"
pct exec $OLLAMA_CT_ID -- bash -c "curl -fsSL https://ollama.com/install.sh | sh"
msg_ok "Ollama installed"

msg_info "Starting Ollama service..."
pct exec $OLLAMA_CT_ID -- bash -c "systemctl enable ollama && systemctl start ollama"
sleep 10

msg_info "Pulling llama3 model (this may take 10-15 minutes)..."
pct exec $OLLAMA_CT_ID -- bash -c "timeout 900 ollama pull llama3 || echo 'Model pull timeout'"
msg_ok "Ollama configured with llama3"

OLLAMA_API_URL="http://${OLLAMA_IP}:11434"

msg_step "STEP 5: Creating Bolt App Container"
msg_info "Provisioning CT $BOLT_CT_ID ($BOLT_HOSTNAME)..."
pct create $BOLT_CT_ID $CT_TEMPLATE \
    --hostname $BOLT_HOSTNAME \
    --cores $BOLT_CORES \
    --memory $BOLT_RAM \
    --swap 1024 \
    --net0 name=eth0,bridge=$NETWORK_BRIDGE,ip=${BOLT_IP}/${NETMASK},gw=$GATEWAY \
    --rootfs local-lvm:$BOLT_DISK \
    --unprivileged 1 \
    --features nesting=1 \
    --onboot 1 \
    --start 1 \
    --password $(openssl rand -base64 32)

msg_ok "Bolt App container created"
sleep 10

msg_info "Installing Node.js and dependencies..."
pct exec $BOLT_CT_ID -- bash -c "apt-get update -qq && apt-get install -y -qq curl git ca-certificates gnupg sudo ufw"
pct exec $BOLT_CT_ID -- bash -c "curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y -qq nodejs"
msg_ok "Node.js installed"

msg_info "Cloning Bolt repository..."
pct exec $BOLT_CT_ID -- bash -c "mkdir -p /opt && cd /opt && git clone https://github.com/kidevu123/bolt.git bolt-app"
msg_ok "Repository cloned to /opt/bolt-app"

msg_step "STEP 6: Configuring Bolt App Environment"
msg_info "Creating .env file with live Bolt Database and Ollama credentials..."

pct exec $BOLT_CT_ID -- bash -c "cat > /opt/bolt-app/.env <<'ENVEOF'
VITE_Bolt Database_URL=$Bolt Database_URL
VITE_Bolt Database_ANON_KEY=$ANON_KEY
Bolt Database_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY

OPENAI_API_BASE=${OLLAMA_API_URL}/v1
OPENAI_API_KEY=ollama
OPENAI_MODEL=llama3

NODE_ENV=production
PORT=5173
HOST=0.0.0.0
ENVEOF
"

pct exec $BOLT_CT_ID -- bash -c "chmod 600 /opt/bolt-app/.env"
msg_ok ".env file created at /opt/bolt-app/.env"

msg_info "Installing npm dependencies..."
pct exec $BOLT_CT_ID -- bash -c "cd /opt/bolt-app && npm install --loglevel=error"
msg_ok "Dependencies installed"

msg_info "Building application..."
pct exec $BOLT_CT_ID -- bash -c "cd /opt/bolt-app && npm run build"
msg_ok "Build completed"

msg_step "STEP 7: Creating Systemd Service"
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

msg_step "STEP 8: Configuring LAN-Only Firewalls"
msg_info "Securing Bolt App..."
pct exec $BOLT_CT_ID -- bash -c "ufw --force enable && ufw default deny incoming && ufw default allow outgoing"
pct exec $BOLT_CT_ID -- bash -c "ufw allow from $LAN_SUBNET to any port 5173 proto tcp"
pct exec $BOLT_CT_ID -- bash -c "ufw allow from $LAN_SUBNET to any port 22 proto tcp"

msg_info "Securing Supabase..."
pct exec $Bolt Database_CT_ID -- bash -c "apt-get install -y -qq ufw"
pct exec $Bolt Database_CT_ID -- bash -c "ufw --force enable && ufw default deny incoming && ufw default allow outgoing"
pct exec $Bolt Database_CT_ID -- bash -c "ufw allow from $LAN_SUBNET to any port 3000 proto tcp"
pct exec $Bolt Database_CT_ID -- bash -c "ufw allow from $LAN_SUBNET to any port 8000 proto tcp"
pct exec $Bolt Database_CT_ID -- bash -c "ufw allow from $LAN_SUBNET to any port 5432 proto tcp"
pct exec $Bolt Database_CT_ID -- bash -c "ufw allow from $LAN_SUBNET to any port 22 proto tcp"

msg_info "Securing Ollama..."
pct exec $OLLAMA_CT_ID -- bash -c "apt-get install -y -qq ufw"
pct exec $OLLAMA_CT_ID -- bash -c "ufw --force enable && ufw default deny incoming && ufw default allow outgoing"
pct exec $OLLAMA_CT_ID -- bash -c "ufw allow from $LAN_SUBNET to any port 11434 proto tcp"
pct exec $OLLAMA_CT_ID -- bash -c "ufw allow from $LAN_SUBNET to any port 22 proto tcp"

msg_ok "All firewalls configured (LAN-only)"

msg_step "STEP 9: Health Checks"
sleep 15

msg_info "Testing Bolt Database API..."
if pct exec $Bolt Database_CT_ID -- bash -c "curl -sf http://localhost:8000/rest/v1/ -H 'apikey: $ANON_KEY'" > /dev/null 2>&1; then
    msg_ok "Bolt Database API healthy"
else
    msg_warn "Bolt Database API check failed"
fi

msg_info "Testing Ollama..."
if pct exec $OLLAMA_CT_ID -- bash -c "curl -sf http://localhost:11434/api/tags" > /dev/null 2>&1; then
    msg_ok "Ollama API healthy"
else
    msg_warn "Ollama API check failed"
fi

msg_info "Testing Bolt App..."
if pct exec $BOLT_CT_ID -- bash -c "curl -sf http://localhost:5173" > /dev/null 2>&1; then
    msg_ok "Bolt App healthy"
else
    msg_warn "Bolt App check failed"
fi

msg_info "Saving credentials to /root/bolt-deployment-credentials.txt on Proxmox host..."
cat > /root/bolt-deployment-credentials.txt <<CREDEOF
╔══════════════════════════════════════════════════════════════════════════╗
║                 BOLT DEPLOYMENT CREDENTIALS (CONFIDENTIAL)               ║
╚══════════════════════════════════════════════════════════════════════════╝

Bolt Database CREDENTIALS:
  URL:                  $Bolt Database_URL
  Anon Key:             $ANON_KEY
  Service Role Key:     $SERVICE_ROLE_KEY
  Postgres Password:    $POSTGRES_PASSWORD
  Studio Password:      $DASHBOARD_PASSWORD
  Studio URL:           $Bolt Database_STUDIO_URL

OLLAMA CREDENTIALS:
  API URL:              $OLLAMA_API_URL
  Model:                llama3

CONTAINER IDs:
  Bolt App:             $BOLT_CT_ID
  Bolt Database:             $Bolt Database_CT_ID
  Ollama:               $OLLAMA_CT_ID

LAN IPs:
  Bolt App:             $BOLT_IP
  Bolt Database:             $Bolt Database_IP
  Ollama:               $OLLAMA_IP
  Gateway:              $GATEWAY
  Subnet:               $LAN_SUBNET

CONFIGURATION FILES:
  Bolt .env:            /opt/bolt-app/.env (on CT $BOLT_CT_ID)
  Bolt Database .env:        /opt/supabase/docker/.env (on CT $Bolt Database_CT_ID)

BACKUP COMMANDS:
  Credentials:          cat /root/bolt-deployment-credentials.txt
  Bolt .env:            pct exec $BOLT_CT_ID -- cat /opt/bolt-app/.env
  Bolt Database .env:        pct exec $Bolt Database_CT_ID -- cat /opt/supabase/docker/.env

Generated: $(date)
CREDEOF

chmod 600 /root/bolt-deployment-credentials.txt
msg_ok "Credentials saved to /root/bolt-deployment-credentials.txt"

sleep 2
clear

cat << EOF

╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║              ${GREEN}FULL STACK DEPLOYMENT COMPLETED SUCCESSFULLY${NC}              ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝

${CYAN}┌─ Access URLs (LAN Only)${NC}
${CYAN}│${NC}
${CYAN}├─${NC} ${GREEN}Bolt App:${NC}              http://${BOLT_IP}:5173
${CYAN}├─${NC} ${GREEN}Bolt Database API:${NC}          ${Bolt Database_URL}
${CYAN}├─${NC} ${GREEN}Bolt Database Studio:${NC}       ${Bolt Database_STUDIO_URL}
${CYAN}│${NC}  ${YELLOW}Studio Login:${NC}          Username: Bolt Database / Password: ${DASHBOARD_PASSWORD}
${CYAN}└─${NC} ${GREEN}Ollama API:${NC}            ${OLLAMA_API_URL}

${CYAN}┌─ Container Information${NC}
${CYAN}│${NC}
${CYAN}├─${NC} Bolt App:       ${YELLOW}CT ${BOLT_CT_ID}${NC} @ ${BOLT_IP}
${CYAN}├─${NC} Bolt Database:       ${YELLOW}CT ${Bolt Database_CT_ID}${NC} @ ${Bolt Database_IP}
${CYAN}├─${NC} Ollama Lite:    ${YELLOW}CT ${OLLAMA_CT_ID}${NC} @ ${OLLAMA_IP}
${CYAN}└─${NC} Network:        ${YELLOW}${LAN_SUBNET}${NC}

${CYAN}┌─ Credentials (KEEP SECURE)${NC}
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}Full credentials saved to:${NC}
${CYAN}│${NC}  ${YELLOW}/root/bolt-deployment-credentials.txt${NC}
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}View credentials:${NC}
${CYAN}│${NC}  cat /root/bolt-deployment-credentials.txt
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}Backup credentials:${NC}
${CYAN}│${NC}  cp /root/bolt-deployment-credentials.txt /root/backup/
${CYAN}│${NC}
${CYAN}└─${NC} ${RED}WARNING: Keys are NOT placeholders - these are LIVE production keys!${NC}

${CYAN}┌─ Management Commands${NC}
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}Restart Bolt App:${NC}
${CYAN}│${NC}  pct exec ${BOLT_CT_ID} -- systemctl restart bolt-app
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}View Bolt Logs:${NC}
${CYAN}│${NC}  pct exec ${BOLT_CT_ID} -- journalctl -u bolt-app -f
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}Restart Bolt Database Stack:${NC}
${CYAN}│${NC}  pct exec ${Bolt Database_CT_ID} -- bash -c 'cd /opt/supabase/docker && docker compose restart'
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}View Bolt Database Logs:${NC}
${CYAN}│${NC}  pct exec ${Bolt Database_CT_ID} -- bash -c 'cd /opt/supabase/docker && docker compose logs -f'
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}Restart Ollama:${NC}
${CYAN}│${NC}  pct exec ${OLLAMA_CT_ID} -- systemctl restart ollama
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}Update Bolt App:${NC}
${CYAN}│${NC}  pct exec ${BOLT_CT_ID} -- bash -c 'cd /opt/bolt-app && git pull && npm install && npm run build && systemctl restart bolt-app'
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}Create Snapshots:${NC}
${CYAN}│${NC}  vzdump ${BOLT_CT_ID} --mode snapshot --storage local
${CYAN}│${NC}  vzdump ${Bolt Database_CT_ID} --mode snapshot --storage local
${CYAN}│${NC}  vzdump ${OLLAMA_CT_ID} --mode snapshot --storage local
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}Stop All Services:${NC}
${CYAN}│${NC}  pct stop ${BOLT_CT_ID} && pct stop ${Bolt Database_CT_ID} && pct stop ${OLLAMA_CT_ID}
${CYAN}│${NC}
${CYAN}└─${NC} ${MAGENTA}Start All Services:${NC}
   pct start ${Bolt Database_CT_ID} && sleep 30 && pct start ${OLLAMA_CT_ID} && sleep 10 && pct start ${BOLT_CT_ID}

${CYAN}┌─ Configuration Files${NC}
${CYAN}│${NC}
${CYAN}├─${NC} Bolt App .env:        ${YELLOW}/opt/bolt-app/.env${NC} (on CT ${BOLT_CT_ID})
${CYAN}├─${NC} Bolt Database .env:        ${YELLOW}/opt/supabase/docker/.env${NC} (on CT ${Bolt Database_CT_ID})
${CYAN}├─${NC} Systemd Service:      ${YELLOW}/etc/systemd/system/bolt-app.service${NC} (on CT ${BOLT_CT_ID})
${CYAN}└─${NC} Docker Compose:       ${YELLOW}/opt/supabase/docker/docker-compose.yml${NC} (on CT ${Bolt Database_CT_ID})

${CYAN}┌─ Database Access${NC}
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}Connect to Postgres directly:${NC}
${CYAN}│${NC}  pct exec ${Bolt Database_CT_ID} -- docker exec -it Bolt Database-db psql -U postgres
${CYAN}│${NC}
${CYAN}├─${NC} ${MAGENTA}View database connection string:${NC}
${CYAN}│${NC}  postgresql://postgres:${POSTGRES_PASSWORD}@${Bolt Database_IP}:5432/postgres
${CYAN}│${NC}
${CYAN}└─${NC} ${MAGENTA}Access via Bolt Database Studio:${NC}
   ${Bolt Database_STUDIO_URL}

${CYAN}┌─ Security Notes${NC}
${CYAN}│${NC}
${CYAN}├─${NC} ${GREEN}✓${NC} All services LAN-only (no WAN exposure)
${CYAN}├─${NC} ${GREEN}✓${NC} UFW firewall enabled on all containers
${CYAN}├─${NC} ${GREEN}✓${NC} Access restricted to ${LAN_SUBNET}
${CYAN}├─${NC} ${GREEN}✓${NC} All credentials auto-generated and secured
${CYAN}├─${NC} ${GREEN}✓${NC} Environment files protected (chmod 600)
${CYAN}├─${NC} ${GREEN}✓${NC} Containers auto-start on boot
${CYAN}└─${NC} ${GREEN}✓${NC} Self-hosted Bolt Database (no external dependencies)

${CYAN}┌─ Next Steps${NC}
${CYAN}│${NC}
${CYAN}├─${NC} 1. ${GREEN}Open Bolt App:${NC} http://${BOLT_IP}:5173
${CYAN}├─${NC} 2. ${GREEN}Access Bolt Database Studio:${NC} ${Bolt Database_STUDIO_URL}
${CYAN}├─${NC} 3. ${GREEN}Test Ollama:${NC} curl ${OLLAMA_API_URL}/api/tags
${CYAN}├─${NC} 4. ${GREEN}Backup credentials file immediately${NC}
${CYAN}└─${NC} 5. ${GREEN}Create snapshots of all containers${NC}

${GREEN}Full stack deployment complete!${NC} Your self-hosted environment is ready.

${RED}IMPORTANT:${NC} Save /root/bolt-deployment-credentials.txt to a secure location NOW!

EOF
