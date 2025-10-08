# ======================================
# Déploiement ANAVEO Windows -> Ubuntu
# ======================================

# --- CONFIG ---
$LocalProject   = "C:\Users\d.michel\OneDrive - ANAVEO\Documents\Dashboard CDS\V8 - cdr et api\home\ubuntu\anaveo-project"
$RemoteUser     = "ubuntu"
$RemoteHost     = "4.211.183.208"
$RemoteProject  = "/home/ubuntu/anaveo-project"
$DeployScript   = "deploy_anaveo.sh"
$LogFile        = Join-Path $LocalProject "deploy_windows.log"

# --- Fonctions utilitaires ---
function Log($Message, [ConsoleColor]$Color = "White") {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp] $Message"
    Write-Host $line -ForegroundColor $Color
    Add-Content -Path $LogFile -Value $line
}

# Nettoyage log précédent
Clear-Content -Path $LogFile -ErrorAction SilentlyContinue

Log "====================================" Cyan
Log "🚀 Début du déploiement ANAVEO" Green
Log "====================================" Cyan

# --- Build React ---
Log "🔹 Build React en production..." Yellow
Set-Location $LocalProject

npm install *>> $LogFile
if ($LASTEXITCODE -ne 0) {
    Log "[ERROR] npm install a échoué" Red
    Pause
    exit 1
}

npm run build *>> $LogFile
if ($LASTEXITCODE -ne 0) {
    Log "[ERROR] npm run build a échoué" Red
    Pause
    exit 1
}
Log "✅ Build terminé" Green

# --- Copie vers serveur ---
Log "🔹 Copie des fichiers build sur le serveur..." Yellow
scp -r "$LocalProject\build\*" "$RemoteUser@$RemoteHost:$RemoteProject/build/" *>> $LogFile
if ($LASTEXITCODE -ne 0) {
    Log "[ERROR] Copie des fichiers échouée" Red
    Pause
    exit 1
}
Log "✅ Copie terminée" Green

# --- Exécution script distant ---
Log "🔹 Exécution du script de déploiement sur le serveur..." Yellow
ssh "$RemoteUser@$RemoteHost" "bash $RemoteProject/$DeployScript" *>> $LogFile
if ($LASTEXITCODE -ne 0) {
    Log "[ERROR] Déploiement sur serveur échoué" Red
    Pause
    exit 1
}
Log "✅ Déploiement terminé" Green

Log "====================================" Cyan
Log "✅ Déploiement complet" Green
Log "🌍 React disponible sur https://anaveo.on3cx.fr" Cyan
Log "🔌 WebSocket Node.js actif sur wss://anaveo.on3cx.fr/cdr" Cyan

Pause
