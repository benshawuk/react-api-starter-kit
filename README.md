# Laravel React API Starter Kit

A Laravel 12 starter kit that uses the familiar Laravel starter kit frontend pages but with a **backend API** and **React Router** (without Inertia).
Suitable for client side heavy SPAs.

## Key Differences

- **API Backend** - Pure Laravel API endpoints (no InertiaJS).
- **React Router** - Client-side routing with React Router v7
- **Sanctum Session Authentication** - Laravel Sanctum session-based authentication using HTTP-only (or https) cookies
- **Familiar UI** - Same Laravel starter kit pages using React + TypeScript

## Tech Stack

- **Backend**: Laravel 12 + Sanctum
- **Frontend**: React 19 + TypeScript + React Router v7
- **Styling**: Tailwind CSS v4 + Shadcn/ui
- **Build**: Vite

## Installation

### Backend Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
# Configure database and other settings in .env (see Environment Variables section)
php artisan migrate
php artisan serve
```

### Frontend Setup

```bash
npm install
npm run dev
```

## Environment Variables

### Required Configuration

Copy the provided `.env.example` and configure these essential variables:

```env
# App basics
APP_NAME="Your App Name"
APP_KEY=                    # Generate with: php artisan key:generate
APP_URL=http://localhost:8000

# Database (SQLite default, or configure MySQL/PostgreSQL)
DB_CONNECTION=sqlite

# Session Configuration (CRITICAL for SPA auth)
SESSION_DRIVER=database     # Must be 'database' for SPA
SESSION_DOMAIN=null         # Must be null for localhost development
SESSION_SECURE_COOKIE=false # Set to true in production with HTTPS
SESSION_SAME_SITE=lax       # Required for cross-origin requests

# Sanctum Configuration (CRITICAL for SPA auth)
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1,localhost:3000,localhost:8000,127.0.0.1:8000

# Mail (for password reset functionality)
MAIL_MAILER=log             # Use 'log' for development, configure SMTP for production
```

### Important Notes

- **Session settings are critical**: Incorrect session configuration will cause 419 CSRF errors
- **SANCTUM_STATEFUL_DOMAINS**: Must include all domains your frontend runs on
- **SESSION_DOMAIN=null**: Required for localhost development
- **Database**: Defaults to SQLite for easy setup, but supports MySQL/PostgreSQL

## Architecture

- Laravel serves **API endpoints** (`/api/*`) and **authentication routes** (`/login`, `/register`, etc.)
- React handles **all UI rendering**
- **Session-based authentication** with secure cookies (HTTP-only flag prevents JavaScript access, no localStorage)
- **CSRF protection** using Laravel Sanctum
- **No server-side rendering** or Inertia.js
- Routes configurable in: resources/js/router/app-router.tsx

## Authentication Pages

All the familiar Laravel starter kit pages:

- Login / Register
- Email Verification
- Password Reset
- Password Confirmation
- Dashboard

## API Endpoints

### Authentication (Web Routes)

- `POST /login`
- `POST /register`
- `POST /logout`
- `POST /forgot-password`
- `POST /reset-password`
- `GET /sanctum/csrf-cookie` (CSRF token)

### Protected API Routes

- `GET /api/user`
- `GET /api/dashboard`
- `GET /api/profile`
- `PATCH /api/profile`
- `DELETE /api/profile`
- `PUT /api/password`

---

**Perfect for developers who want Laravel's starter kit authentication flow but with a React frontend and API architecture, without using Inertia**
