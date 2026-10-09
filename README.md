# Wanderlust

A travel-planning app where people can plan trips, share public travel experiences, and learn from other travelers' recommendations.

## Features

- Plan trips with dates, budget, notes, and itineraries
- Search public travel posts by place
- Share trip photos and practical advice
- Like posts and save posts or destinations to Favorites
- Manage profiles, invitations, and travel memories

## Project Structure

- `Client/frontend` - React frontend
- `Server` - Express API

## Requirements

- Node.js and npm
- PostgreSQL database
- Cloudinary account for image uploads

## Local Setup

Install dependencies:

```sh
cd Server
npm install
cd ../Client/frontend
npm install
```

### Password reset email

Configure these environment variables for the API server to send one-time password reset links:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=Wanderlust <no-reply@example.com>
CLIENT_URL=https://your-frontend.example.com
```

Use the SMTP credentials provided by your email service, and keep them in the server's deployment environment or an untracked local `.env` file. Do not commit real credentials. In production, `CLIENT_URL` must use HTTPS; if multiple client origins are configured, the first one is used in reset links.
