#!/bin/bash

# ========================================================================
# 🔧 CUSTOMIZABLE VARIABLES - CHANGE THESE FOR YOUR PROJECT
# ========================================================================
PROJECT_NAME="MENU Scanner App"
APP_NAME="menu-scanner"
SERVER_IP="152.42.219.13"
FRONTEND_PORT="3000"
BACKEND_PORT="8080"
PM2_INTERNAL_PORT="3010"
MAX_UPLOAD_SIZE="50M"
PROXY_TIMEOUT="90s"

# ========================================================================
# 🎨 COLORS
# ========================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

clear

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  🔧 SETUP NGINX FOR ${PROJECT_NAME^^} 🔧                      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}📋 Configuration:${NC}"
echo -e "${CYAN}   Project: ${BOLD}${PROJECT_NAME}${NC}"
echo -e "${CYAN}   App Name: ${BOLD}${APP_NAME}${NC}"
echo -e "${CYAN}   Server IP: ${BOLD}${SERVER_IP}${NC}"
echo -e "${CYAN}   Frontend Port: ${BOLD}${FRONTEND_PORT}${NC}"
echo -e "${CYAN}   Backend Port: ${BOLD}${BACKEND_PORT}${NC}"
echo -e "${CYAN}   PM2 Internal Port: ${BOLD}${PM2_INTERNAL_PORT}${NC}"
echo ""

# ========================================================================
# 🔐 CHECK SUDO ACCESS EARLY
# ========================================================================
if ! sudo -v; then
  echo -e "${RED}❌ Sudo access is required${NC}"
  exit 1
fi

# ========================================================================
# 🧹 REMOVE OLD CONFIGS (sudo required)
# ========================================================================
echo -e "${YELLOW}🔍 Removing old nginx configs...${NC}"
sudo rm -f /etc/nginx/conf.d/${APP_NAME}*.conf

# ========================================================================
# 📝 CREATE NGINX CONFIG (sudo required)
# ========================================================================
sudo tee /etc/nginx/conf.d/${APP_NAME}.conf > /dev/null << NGINXEOF
# ${PROJECT_NAME} - Frontend + API Proxy

upstream ${APP_NAME}_backend {
    server ${SERVER_IP}:${BACKEND_PORT} max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream ${APP_NAME}_frontend {
    server 127.0.0.1:${PM2_INTERNAL_PORT} max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen ${FRONTEND_PORT};
    listen [::]:${FRONTEND_PORT};
    server_name _;
    client_max_body_size ${MAX_UPLOAD_SIZE};
    server_tokens off;

    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-App "${APP_NAME}-${FRONTEND_PORT}" always;

    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_request_buffering off;
    proxy_connect_timeout ${PROXY_TIMEOUT};
    proxy_send_timeout ${PROXY_TIMEOUT};
    proxy_read_timeout ${PROXY_TIMEOUT};

    location /api/ {
        proxy_pass http://${APP_NAME}_backend/;

        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";

        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials true always;

        if (\$request_method = OPTIONS) {
            return 204;
        }
    }

    location ~* \.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|css|js|map)\$ {
        proxy_pass http://${APP_NAME}_frontend;
        expires 1h;
        add_header Cache-Control "public";
    }

    location /_next/ {
        proxy_pass http://${APP_NAME}_frontend;
        expires 5m;
        add_header Cache-Control "public";
    }

    location /health {
        access_log off;
        add_header Content-Type text/plain;
        return 200 "${PROJECT_NAME} - OK\n";
    }

    location / {
        proxy_pass http://${APP_NAME}_frontend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINXEOF

echo -e "${GREEN}✅ Nginx config created${NC}"

# ========================================================================
# 🔍 TEST & RELOAD NGINX (sudo required)
# ========================================================================
echo -e "${CYAN}🔍 Testing nginx configuration...${NC}"
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}❌ Nginx configuration error${NC}"
    exit 1
fi

# ========================================================================
# 🎉 DONE
# ========================================================================
echo ""
echo -e "${GREEN}🎉 Nginx setup completed successfully!${NC}"
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                           🌐 ACCESS INFORMATION                              ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo -e "${CYAN}🌐 Frontend: ${BOLD}http://${SERVER_IP}:${FRONTEND_PORT}${NC}"
echo -e "${CYAN}🔗 API: ${BOLD}http://${SERVER_IP}:${FRONTEND_PORT}/api${NC}"
echo -e "${CYAN}🩺 Health: ${BOLD}http://${SERVER_IP}:${FRONTEND_PORT}/health${NC}"
echo -e "${CYAN}📊 Swagger: ${BOLD}http://${SERVER_IP}:${BACKEND_PORT}/swagger-ui/index.html${NC}"
