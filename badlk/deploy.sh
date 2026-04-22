#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#  BADLK — Script de déploiement automatique
#  Usage : bash deploy.sh
# ═══════════════════════════════════════════════════════════════════

set -e  # Arrêt si une commande échoue

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        BADLK — Déploiement               ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── Étape 1 : Vérifications ─────────────────────────────────────────
echo -e "${YELLOW}[1/5] Vérification des outils...${NC}"

command -v git >/dev/null 2>&1 || { echo -e "${RED}❌ git non installé. Installe-le sur https://git-scm.com${NC}"; exit 1; }
echo -e "${GREEN}✅ git OK${NC}"

command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js non installé. Installe-le sur https://nodejs.org${NC}"; exit 1; }
echo -e "${GREEN}✅ Node.js $(node -v) OK${NC}"

# ── Étape 2 : Infos GitHub ──────────────────────────────────────────
echo ""
echo -e "${YELLOW}[2/5] Configuration GitHub...${NC}"
echo ""
echo -e "  👉 Va sur ${BLUE}https://github.com/new${NC}"
echo -e "  👉 Crée un repo nommé ${GREEN}badlk${NC} (privé ou public)"
echo -e "  👉 NE coche PAS 'Initialize with README'"
echo ""
read -p "  Ton nom d'utilisateur GitHub : " GITHUB_USER
if [ -z "$GITHUB_USER" ]; then
  echo -e "${RED}❌ Nom d'utilisateur vide. Abandon.${NC}"; exit 1
fi
REPO_URL="https://github.com/${GITHUB_USER}/badlk.git"
echo -e "${GREEN}✅ URL : ${REPO_URL}${NC}"

# ── Étape 3 : Git init & push ───────────────────────────────────────
echo ""
echo -e "${YELLOW}[3/5] Initialisation Git et push...${NC}"

# On travaille depuis le dossier du script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

git init -q
git add .
git commit -q -m "🚀 BADLK v2 — initial commit"

# Renomme la branche en main si nécessaire
git branch -M main 2>/dev/null || true

git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo ""
echo -e "  📤 Push vers GitHub (entre ton mot de passe ou Personal Access Token si demandé)..."
echo -e "  ${YELLOW}💡 Conseil : utilise un PAT (Settings → Developer settings → Tokens)${NC}"
echo ""

git push -u origin main

echo -e "${GREEN}✅ Code poussé sur GitHub !${NC}"

# ── Étape 4 : Railway ───────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[4/5] Configuration Railway...${NC}"
echo ""
echo -e "  ${BLUE}═══ INSTRUCTIONS RAILWAY ════════════════════════════════${NC}"
echo ""
echo -e "  1. Va sur ${BLUE}https://railway.app${NC} et connecte-toi (ou crée un compte)"
echo ""
echo -e "  2. Clique sur ${GREEN}New Project${NC} → ${GREEN}Deploy from GitHub repo${NC}"
echo ""
echo -e "  3. Autorise Railway à accéder à GitHub si demandé"
echo ""
echo -e "  4. Sélectionne le repo : ${GREEN}${GITHUB_USER}/badlk${NC}"
echo ""
echo -e "  5. Railway va détecter Node.js automatiquement."
echo -e "     ${YELLOW}IMPORTANT :${NC} Dans Settings → ${GREEN}Root Directory${NC} → mets : ${GREEN}backend${NC}"
echo ""
echo -e "  6. Dans ${GREEN}Variables${NC}, clique 'New Variable' et ajoute :"
echo ""
echo -e "     ${GREEN}JWT_SECRET${NC}    =  $(openssl rand -hex 32 2>/dev/null || echo 'remplace_par_une_cle_secrete_longue_et_aleatoire')"
echo -e "     ${GREEN}DATABASE_URL${NC}  =  sqlite:./badlk.db"
echo -e "     ${GREEN}PORT${NC}          =  4000"
echo ""
echo -e "  7. Clique ${GREEN}Deploy${NC} — Railway build et lance le serveur ✨"
echo ""
echo -e "  8. Dans ${GREEN}Settings → Domains${NC} → Generate Domain"
echo -e "     → Ton site sera live sur ${BLUE}https://badlk-xxx.up.railway.app${NC}"
echo ""
echo -e "  ${BLUE}═══════════════════════════════════════════════════════${NC}"

# ── Étape 5 : Résumé ────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[5/5] Résumé...${NC}"
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Code sur GitHub : github.com/${GITHUB_USER}/badlk  ${NC}"
echo -e "${GREEN}║  🚀 Il ne reste que Railway (étape 4 ci-dessus)      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  En cas de problème : ${BLUE}https://docs.railway.app${NC}"
echo ""
