# Blogging Backend

Node.js + Express backend for the blogging platform with:
- JWT auth (email/password + Google login)
- email verification
- forgot/reset password via email
- blog CRUD with likes/comments/shares/views
- profile management
- dashboard utilities (water counter + todos)

## Tech Stack

- Node.js (ES modules)
- Express 5
- MongoDB + Mongoose
- JWT + bcrypt
- Nodemailer (Gmail SMTP)
- Google Auth Library
- Cloudinary + Multer Storage
- Arcjet (configured in project)

## Project Structure

```text
blogging_backend/
  config/        # db, cloudinary, arcjet config
  controllers/   # auth, blog, profile, upload handlers
  middlewares/   # auth + arcjet middleware
  models/        # User and Blog schemas
  routes/        # auth/blog/profile routes
  utils/         # email helper utilities
  server.js      # app bootstrap
```

## Environment Variables

Create a `.env` file in `blogging_backend/`:

```env
PORT=5000
MONGO_URI=mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

# SMTP (Gmail) config
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

GOOGLE_CLIENT_ID=your_google_oauth_client_id

ARCJET_KEY=your_arcjet_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Install & Run

```bash
npm install
npm run dev
```

Production start:

```bash
npm start
```

Default local API base: `http://localhost:5000`

## API Routes

Mounted prefixes:
- `/api/auth`
- `/api/blogs`
- `/api/profile`

### Auth (`/api/auth`)

- `POST /register`
- `POST /login`
- `POST /google-login`
- `GET /verify/:token`
- `POST /forgot-password`
- `POST /reset-password/:token`
- `GET /dashboard` (protected)
- `PUT /water` (protected)
- `POST /todos` (protected)
- `PUT /todos/:id` (protected)
- `DELETE /todos/:id` (protected)

### Blogs (`/api/blogs`)

- `GET /all`
- `GET /trending`
- `GET /my` (protected)
- `GET /:id`
- `POST /` (protected)
- `PUT /:id` (protected, author only)
- `DELETE /:id` (protected, author only)
- `PUT /:id/like` (protected)
- `PUT /:id/share` (protected)
- `POST /:id/comment` (protected)
- `PUT /:id/comment/:commentId` (protected, comment author)
- `DELETE /:id/comment/:commentId` (protected, comment author or blog author)

### Profile (`/api/profile`)

- `GET /` (protected)
- `PUT /` (protected)

## Auth Behavior

- JWT required for protected routes via `Authorization: Bearer <token>`.
- Login is blocked until email is verified.
- Verification token is sent on signup (and resent for unverified existing users).
- Password reset token expires after 1 hour.

## Notes

- CORS is currently configured with `origin: "*"` in `server.js`.
- Arcjet is configured but not actively applied to routes by default.
- `uploadController.js` provides Cloudinary upload/delete handlers, but routes are not mounted in `server.js` yet.
