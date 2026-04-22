# BADLK 🇨🇲
**Plateforme de petites annonces — Cameroun**  
Paiement Mobile Money intégré (MTN MoMo & Orange Money)

---

## 🚀 Démarrage rapide

### Option A — Script automatique (recommandé)
```bash
bash deploy.sh
```
Le script vérifie les outils, pousse sur GitHub et guide le déploiement Railway.

### Option B — Docker (local)
```bash
docker-compose up --build
# → http://localhost:4000
```

### Option C — Sans Docker (local)
```bash
cd backend
npm install
node server.js
# → http://localhost:4000
```

---

## 📡 API Endpoints
```
POST   /api/auth/register          Inscription
POST   /api/auth/login             Connexion

GET    /api/ads?q=&category=       Liste / recherche
POST   /api/ads                    Créer annonce (auth)
GET    /api/ads/:id                Détail annonce
POST   /api/ads/:id/report         Signaler annonce
DELETE /api/ads/:id                Supprimer (auth + owner)

POST   /api/payments/mobile        Paiement simulé
POST   /api/payments/mtn           MTN MoMo sandbox
POST   /api/payments/orange        Orange Money sandbox
POST   /api/payments/webhook       Callback opérateur
```

---

## 🔑 Variables d'environnement
| Variable | Défaut | Description |
|----------|--------|-------------|
| `PORT` | `4000` | Port du serveur |
| `JWT_SECRET` | *(dev only)* | **Changer en production** |
| `DATABASE_URL` | `sqlite:./badlk.db` | URL SQLite ou PostgreSQL |
| `MTN_API_KEY` | `sandbox_key` | Clé API MTN MoMo |
| `ORANGE_API_KEY` | `sandbox_key` | Clé API Orange Money |

---

## 🏗️ Production
- Remplacer SQLite par PostgreSQL (`DATABASE_URL=postgres://…`)
- Changer `JWT_SECRET` par une clé aléatoire longue
- Renseigner les vraies clés MTN et Orange
- Ajouter HTTPS (nginx + Let's Encrypt ou Railway génère le certificat automatiquement)

---

## 🗂️ Arborescence
```
badlk/
├─ backend/
│  ├─ server.js
│  ├─ config.js
│  ├─ db.js
│  ├─ migrations.sql
│  ├─ package.json
│  ├─ Dockerfile
│  ├─ railway.json          ← Config Railway
│  ├─ Procfile              ← Commande de démarrage
│  ├─ routes/
│  │  ├─ auth.js
│  │  ├─ ads.js
│  │  ├─ payments.js
│  │  ├─ payments-mtn.js
│  │  ├─ payments-orange.js
│  │  └─ payments-webhook.js
│  └─ middleware/
│     └─ auth.js
├─ frontend/
│  ├─ index.html
│  ├─ styles.css
│  ├─ app.js
│  └─ terms.html
├─ deploy.sh                ← Script déploiement automatique
├─ docker-compose.yml
├─ .gitignore
└─ README.md
```
