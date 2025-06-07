# Laravel React API Starter Kit

A Laravel 12 starter kit that uses the familiar Laravel starter kit frontend pages but with a **backend API** and **React Router** (without Inertia).
Suitable for client side heavy SPAs.

## Key Differences

- **API Backend** - Pure Laravel API endpoints (no InertiaJS).
- **React Router** - Client-side routing with React Router v7
- **Token Authentication** - Laravel Sanctum tokens instead of sessions
- **Familiar UI** - Same Laravel starter kit pages, rebuilt in React + TypeScript

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
# Configure database in .env
php artisan migrate
php artisan serve
```

### Frontend Setup

```bash
npm install
npm run dev
```

## Architecture

- Laravel serves **API endpoints only** (`/api/*`)
- React handles **all UI rendering**
- **Token-based authentication** (stored in localStorage)
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

- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/user`
- `POST /api/email/verification-notification`
- `POST /api/forgot-password`
- `POST /api/reset-password`

---

**Perfect for developers who want Laravel's starter kit authentication flow but with a React frontend and API architecture, without using Inertia**
