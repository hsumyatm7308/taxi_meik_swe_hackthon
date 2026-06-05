# Taxi Meik Swe

This platform is a taxi-driver-only car rental marketplace designed for the Myanmar market. It connects car owners who have unused, taxi-ready cars with drivers who want to earn income by driving a taxi but do not own one. The company acts as a trusted intermediary, handling identity verification, deposits, payments, inspections, and dispute management.

## Project Structure

- **backend**: Express Node.js application managing the REST API services, Database models via Prisma ORM, and Authentication via Better Auth.
- **frontend**: Vite + React Single Page Application utilizing Tailwind CSS and React Router.

## Recent Features & Core Updates

### 1. Client-Side API Caching Layer
- **GET Request Caching**: Implemented automatic 30-second query caching inside the HTTP client to make page navigation and tab switches instant.
- **Stale Protection**: Configured automatic cache invalidation on any write mutations (`POST`, `PUT`, `DELETE`).
- **Flicker-Free Transitions**: Integrated synchronous cache checks on mount in the Admin Dashboard, Bookings, Users, and Payments lists to prevent loading skeleton flashes when data is already locally cached.

### 2. Admin Profile Settings
- **Backend Route**: Implemented `PUT /api/user/profile` to securely update user names and hash passwords with `better-auth/crypto`.
- **Settings Page**: Built a profile settings UI at `/admin/profile` with password match validation, uppercase/lowercase/special character validation, and profile photo upload.
- **Dashboard Backlink**: Added easy navigation buttons to return to the admin panel from the settings screen.

### 3. User Details & Verification Views
- Exposes full address, city, township, and NRC number details for owners and drivers inside the Admin Users list.
- Redesigned user verification details cards to display complete identity specifications.
