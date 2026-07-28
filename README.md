# MatchDay ⚽

A professional full-stack football ticket booking platform built with Flask REST API, React and PostgreSQL.

## 🚀 Live Demo
> API Docs: https://matchday-2.onrender.com/apidocs
> Frontend: Coming soon (Vercel deployment)

## 🛠️ Tech Stack

**Backend**
- Python / Flask
- PostgreSQL + SQLAlchemy
- JWT Authentication
- Swagger/OpenAPI Documentation
- Flask-Mail (Password Reset)
- Flask-SocketIO (Real-time notifications)
- Paystack Integration (Nigerian payments)
- Stripe Integration (International payments)
- QR Code Generation
- Docker & Docker Compose

**Frontend**
- React
- Axios
- React Router DOM
- Socket.io Client
- Canvas Confetti
- Black & Gold UI with Glassmorphism
- Background Video
- Real-time Goal Notifications

## ✨ Features

- 🔐 Role-based authentication (Fan & Admin)
- 🏟️ Browse upcoming matches by club
- 🎟️ Book match tickets with section selection (VIP, Premium, Regular)
- 💳 Payment via Paystack (NGN) and Stripe (USD)
- 📧 Email confirmation with QR code ticket
- 🔴 Live match scores from football-data.org API
- ⚽ Real-time goal notifications via WebSockets
- ⭐ Favourite club system
- 🔑 Password reset via email
- 📊 Admin dashboard with sales analytics
- 🐳 Dockerized for easy deployment

## 🗂️ Project Structure




MATCHDAY/
├── app/
│ ├── init.py # App factory
│ ├── config.py # Configuration
│ ├── models.py # Database models
│ ├── auth/ # Authentication routes
│ ├── admin/ # Admin routes
│ ├── clubs/ # Club routes
│ ├── matches/ # Match routes + Live scores
│ ├── tickets/ # Ticket booking + Paystack webhook
│ ├── payments/ # Stripe payment intent
│ └── notifications/ # WebSocket goal notifications
├── frontend/ # React application
├── Dockerfile
├── docker-compose.yml
├── run.py
└── requirements.txt



## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/auth/signup` | Register a fan |
| POST | `/api/auth/login` | Fan login |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Admin
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/admin/signup` | Register admin |
| POST | `/api/admin/login` | Admin login |
| POST | `/api/admin/clubs` | Add a club |
| POST | `/api/admin/stadiums` | Add a stadium |
| POST | `/api/admin/stadiums/<id>/sections` | Add stadium sections |
| POST | `/api/admin/matches` | Create a match |
| GET | `/api/admin/matches` | View all matches |
| GET | `/api/admin/sales` | View ticket sales |

### Matches
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/matches/` | Get upcoming matches |
| GET | `/api/matches/<id>` | Get single match |
| GET | `/api/matches/club/<id>` | Get club matches |
| GET | `/api/matches/live` | Get live scores |
| GET | `/api/matches/today` | Get today's matches |

### Tickets
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/tickets/book` | Book a ticket |
| POST | `/api/tickets/paystack/webhook` | Paystack webhook |
| GET | `/api/tickets/my-tickets` | Get fan tickets |
| GET | `/api/tickets/<id>` | Get single ticket |

### Payments
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/payments/create-intent` | Stripe payment intent |
| POST | `/api/payments/stripe/webhook` | Stripe webhook |

### Notifications
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/notifications/goal` | Record goal + notify fans |
| POST | `/api/notifications/match-update` | Update match status |

## ⚙️ Running Locally

### Backend
```bash
python -m venv matchday_env
.\matchday_env\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### With Docker
```bash
docker-compose up
```

### API Documentation
Visit `http://127.0.0.1:5000/apidocs` after starting the backend.

## 👨‍💻 Author
**Chinonso Emmanuel Ogbonna**
University of Delta (UNIDEL), Faculty of Computing
GitHub: [@chinonsoogbonna54-debug](https://github.com/chinonsoogbonna54-debug)



