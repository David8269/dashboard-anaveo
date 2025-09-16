#!/bin/bash
set -e

# === CONFIG ===
DOMAIN="anaveo.on3cx.fr"
PROJECT_DIR="/home/ubuntu/anaveo-project"      
BUILD_DIR="/var/www/anaveo"
NODE_SERVER="$PROJECT_DIR/anaveo-server.js"    
NGINX_CONF="/etc/nginx/sites-available/anaveo.conf"
EMAIL="ton-email@example.com"                  
BRANCH="main"
SERVICE_NAME="anaveo-ws"
MAX_BACKUPS=5
LOG_FILE="$PROJECT_DIR/deploy.log"
WS_PORT=3000
WS_CHECK_MAX=5
WS_CHECK_INTERVAL=2

echo "=== Déploiement ANAVEO $(date) ===" | tee -a $LOG_FILE

rollback() {
    echo "=== ERREUR détectée, rollback en cours ===" | tee -a $LOG_FILE
    if [ -d "$BACKUP_DIR" ]; then
        sudo rm -rf "$BUILD_DIR"
        sudo mv "$BACKUP_DIR" "$BUILD_DIR"
        echo "Rollback effectué vers la build précédente" | tee -a $LOG_FILE
        sudo systemctl restart nginx
        pm2 restart "$SERVICE_NAME" || echo "PM2 restart échoué" | tee -a $LOG_FILE
    fi
    exit 1
}
trap 'rollback' ERR

# --- 1. Installer Node.js, Nginx, Certbot si besoin ---
sudo apt update
sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx

# --- 2. Backup de l'ancienne build ---
if [ -d "$BUILD_DIR" ]; then
    BACKUP_DIR="$PROJECT_DIR/build_backup_$(date +%Y%m%d_%H%M%S)"
    echo "Sauvegarde de l'ancienne build dans $BACKUP_DIR" | tee -a $LOG_FILE
    sudo mv "$BUILD_DIR" "$BACKUP_DIR"
fi

# Nettoyage anciennes sauvegardes
ls -1dt $PROJECT_DIR/build_backup_* | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -rf

# --- 3. Build React ---
cd "$PROJECT_DIR"
git fetch origin
git reset --hard origin/$BRANCH
npm install | tee -a $LOG_FILE
npm run build | tee -a $LOG_FILE

# --- 4. Déploiement Node.js WebSocket via PM2 ---
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

if pm2 list | grep -q "$SERVICE_NAME"; then
    pm2 restart "$SERVICE_NAME" | tee -a $LOG_FILE
else
    pm2 start "$NODE_SERVER" --name "$SERVICE_NAME" | tee -a $LOG_FILE
fi
pm2 save

# --- 5. Vérifier que WebSocket est actif ---
echo "Vérification du WebSocket sur localhost:$WS_PORT..."
for i in $(seq 1 $WS_CHECK_MAX); do
    if nc -z localhost $WS_PORT; then
        echo "WebSocket OK" | tee -a $LOG_FILE
        WS_OK=1
        break
    else
        echo "Tentative $i/$WS_CHECK_MAX: WebSocket non disponible, attente $WS_CHECK_INTERVAL s..." | tee -a $LOG_FILE
        sleep $WS_CHECK_INTERVAL
    fi
done

if [ "$WS_OK" != "1" ]; then
    echo "WebSocket n'est pas disponible, abort deployment" | tee -a $LOG_FILE
    exit 1
fi

# --- 6. Copier build dans /var/www/anaveo ---
sudo mkdir -p "$BUILD_DIR"
sudo cp -r build/* "$BUILD_DIR/"

# --- 7. Créer config Nginx ---
sudo tee "$NGINX_CONF" > /dev/null <<EOL
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN www.$DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root $BUILD_DIR;
    index index.html index.htm;

    location / {
        try_files \$uri /index.html;
    }

    location /cdr/ {
        proxy_pass http://localhost:$WS_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/anaveo.conf
sudo nginx -t
sudo systemctl restart nginx

# --- 8. Certificat HTTPS ---
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m $EMAIL

echo "=== Déploiement terminé ==="
echo "React disponible sur https://$DOMAIN"
echo "WebSocket Node.js actif sur wss://$DOMAIN/cdr"
