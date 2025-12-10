# 🌱 EcoTrack IoT - Tableau de Bord Éco-Responsable

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Django](https://img.shields.io/badge/django-5.2.7-green.svg)
![Python](https://img.shields.io/badge/python-3.10+-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

> **Plateforme de monitoring IoT en temps réel** pour surveiller et optimiser l'impact environnemental de vos dispositifs connectés.

---

## 📋 Table des Matières

- [À Propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Technolog

ies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Contribution](#contribution)
- [License](#license)

---

## 🎯 À Propos

**EcoTrack IoT** est une plateforme web moderne qui permet de:
- 📊 Surveiller en temps réel les métriques de vos appareils IoT
- 🌍 Calculer et visualiser l'impact environnemental (CO₂, consommation énergétique)
- 📈 Analyser les tendances avec des graphiques interactifs
- 🔔 Recevoir des notifications intelligentes sur les anomalies
- 💡 Obtenir des recommandations pour optimiser votre  consommation

### Développé pour la Nuit de l'Info 2024

---

## ✨ Fonctionnalités

### 🔒 Authentification & Sécurité
- Login sécurisé avec rate limiting (5 tentatives/minute)
- Gestion de session avec timeout automatique (30 min)
- Logging des tentatives de connexion
- Protection CSRF et XSS

### 📊 Dashboards Interactifs
- **Dashboard Principal**: Vue d'ensemble des métriques clés
- **Matériel**: Monitoring CPU, RAM, batterie, âge des dispositifs
- **Énergie**: Puissance, CO₂, surchauffe, appareils actifs
- **Réseau**: Bande passante, requêtes, dépendance cloud
- **Scores**: Scores écologiques, obsolescence, dépendance BigTech

### 🔄 Temps Réel
- WebSocket pour mises à jour en direct
- Graphiques Chart.js dynamiques
- Notifications push intelligentes
- Système de seuils configurables

### 🤖 IA & Recommandations
- Chatbot intelligent pour assistance
- Recommandations personnalisées
- Analyse des tendances

### 🎨 Interface Moderne
- Design glassmorphism premium
- Animations fluides et micro-interactions
- Responsive (mobile, tablet, desktop)
- Dark mode par défaut

---

## 🛠️ Technologies

### Backend
- **Django 5.2.7** - Framework web Python
- **Django Channels** - WebSocket support
- **Daphne** - ASGI server
- **SQLite** - Base de données (dev)

### Frontend
- **HTML5/CSS3/JavaScript** (Vanilla)
- **Bootstrap 5.3.3** - Framework CSS
- **Chart.js** - Graphiques interactifs
- **Font Awesome 6.5** - Icônes

### Sécurité & Outils
- **python-decouple** - Gestion environnement
- **django-ratelimit** - Rate limiting
- **django-debug-toolbar** - Debugging (dev)
- **pytest** - Tests

---

## 📦 Installation

### Prérequis
```bash
Python 3.10+
pip
virtualenv (recommandé)
```

### 1. Cloner le Projet
```bash
git clone <repo-url>
cd nuit_info
```

### 2. Créer l'Environnement Virtuel
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Installer les Dépendances
```bash
pip install -r requirements.txt
```

### 4. Configurer l'Environnement
```bash
# Copier le template d'environnement
copy .env.example .env   # Windows
cp .env.example .env     # Linux/Mac

# Éditer .env et configurer vos variables
```

### 5. Migrations de Base de Données
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Créer un Super Utilisateur
```bash
python manage.py createsuperuser
```

### 7. Lancer le Serveur
```bash
python manage.py runserver
```

🎉 **L'application est accessible sur** http://127.0.0.1:8000/api/login/

---

## ⚙️ Configuration

### Variables d'Environnement (.env)

```env
# Django Core
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database  
DB_NAME=db.sqlite3

# Security
SESSION_COOKIE_AGE=1800
CSRF_COOKIE_SECURE=False
SESSION_COOKIE_SECURE=False

# Logging
LOG_LEVEL=DEBUG
```

### Configuration de Production

Pour la production, modifiez `.env`:
```env
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CSRF_COOKIE_SECURE=True
SESSION_COOKIE_SECURE=True
LOG_LEVEL=WARNING
```

---

## 🚀 Utilisation

### 1. Connexion
- Accéder à `/api/login/`
- Utiliser vos identifiants créés

### 2. Navigation
- **Dashboard**: Vue d'ensemble
- **Matériel**: Monitoring hardware
- **Énergie**: Consommation et CO₂
- **Réseau**: Trafic réseau
- **Scores**: Impact écologique
- **Quiz**: Testez vos connaissances

### 3. Envoyer des Données IoT
```bash
POST /api/iot-data/
Content-Type: application/json

{
  "hardware_sensor_id": "ESP32_001",
  "hardware_timestamp": 1701234567,
  "cpu_usage": 45,
  "ram_usage": 60,
  ...
}
```

---

## 🏗️ Architecture

```
nuit_info/
├── iot/                    # Application principale
│   ├── views/              # Vues (auth, pages, API)
│   ├── models.py           # Modèles de données
│   ├── consumers.py        # WebSocket consumers
│   ├── data_utils.py       # Utilitaires de données
│   ├── static/             # Fichiers statiques
│   │   ├── css/            # Styles
│   │   └── js/             # Scripts
│   └── templates/          # Templates HTML
│
├── nuit_info/              # Configuration projet
│   ├── settings.py         # Paramètres Django
│   ├── urls.py             # Routage principal
│   └── asgi.py             # Configuration ASGI
│
├── .env                    # Variables d'environnement
├── requirements.txt        # Dépendances Python
└── manage.py               # CLI Django
```

### Flux de Données

```
IoT Device → POST /api/iot-data/ → Django View → Database
                                              ↓
                                         WebSocket
                                              ↓
                                    All Connected Clients
```

---

## 📡 API Documentation

### Endpoints Principaux

#### Authentification
```http
POST /api/login/
POST /api/logout/
```

#### Données IoT
```http
POST /api/iot-data/              # Ingestion données
GET  /api/latest-data/           # Dernière donnée
GET  /api/dashboard-data/        # Données dashboard
GET  /api/hardware-data/         # Données hardware
GET  /api/energy-data/           # Données énergie
GET  /api/network-data/          # Données réseau
GET  /api/scores-data/           # Scores écologiques
```

#### WebSocket
```
ws://127.0.0.1:8000/ws/dashboard/
ws://127.0.0.1:8000/ws/hardware/
ws://127.0.0.1:8000/ws/energy/
ws://127.0.0.1:8000/ws/network/
ws://127.0.0.1:8000/ws/scores/
```

---

## 🧪 Tests

### Lancer les Tests
```bash
# Tous les tests
pytest

# Avec coverage
coverage run -m pytest
coverage report
coverage html
```

### Tests Disponibles
- Tests unitaires des modèles
- Tests des vues et API
- Tests des consumers WebSocket
- Tests d'intégration

---

## 🌍 Déploiement

### Production avec Daphne

```bash
# 1. Collecter les fichiers statiques
python manage.py collectstatic --noinput

# 2. Lancer Daphne
daphne -b 0.0.0.0 -p 8000 nuit_info.asgi:application
```

### Avec Docker (optionnel)
```dockerfile
# Dockerfile à créer
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["daphne", "-b", "0.0.0.0", "nuit_info.asgi:application"]
```

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📝 License

Ce projet est sous license MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👥 Auteurs

**Équipe EcoTrack IoT**
- Développé pour la Nuit de l'Info 2024
- Contact: [votre-email@example.com]

---

## 🙏 Remerciements

- La Nuit de l'Info pour l'inspiration
- La communauté Django
- Tous les contributeurs open-source

---

## 📞 Support

Pour toute question ou problème:
- 📧 Email: support@ecotrack.io
- 🐛 Issues: [GitHub Issues]
- 📖 Documentation: [Wiki]

---

**Fait avec ❤️ et ♻️ pour un monde plus durable**
