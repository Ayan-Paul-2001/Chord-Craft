<div align="center">
  <img src="./public/chord-craft-icon.svg" alt="Chord & Craft — Harmonic Guitar Academy Logo" width="88" height="88" />
  <h1>Chord &amp; Craft — Harmonic Guitar Academy</h1>
  <p>
    <strong>Full-stack conservatory &amp; guitar learning platform</strong> built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Firebase Auth, MongoDB, and Cloudinary.
  </p>
  <p>
    <a href="#-demo-login-credentials">Demo Login</a> •
    <a href="#-features">Features</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-environment-variables">Environment Variables</a> •
    <a href="#-project-structure">Project Structure</a>
  </p>
</div>

---

## 🔑 Demo Login Credentials

Sign in at **`/login`** using the default demo accounts below (when using the default seeded configuration):

### Administrator Demo Account

| Field | Value |
| --- | --- |
| **Portal URL** | [`http://localhost:3000/login`](http://localhost:3000/login) → redirects to `/admin/dashboard` |
| **Email** | `admin@chordandcraft.com` |
| **Password** | `admin123` |
| **Role** | Administrator (`Julian Mercer`) |

> [!NOTE]
> If you configure `ADMIN_EMAIL` / `ADMIN_DEFAULT_EMAIL` and `ADMIN_DEFAULT_PASSWORD` in `.env.local`, those values override the default fallback password (`admin123`). Administrator accounts strictly sign in with email & password and cannot use Student Google Sign-In.

### Seeded Demo Student Accounts *(Optional)*

| Role / State | Email | Password | Skill Level & Enrolled Courses |
| --- | --- | --- | --- |
| **Active Student** | `tariq.hasan@gmail.com` | `password123` | Intermediate — Acoustic Fingerstyle & Electric Lead |
| **Active Student** | `nusrat.jahan@yahoo.com` | `password123` | Beginner — Acoustic Fingerstyle Mastery |
| **Active Student** | `tanvir.ahmed@outlook.com` | `password123` | Advanced — Electric Lead & Neoclassical Sweep |
| **Pending Verification** | `abrar.chowdhury@gmail.com` | `password123` | Beginner — Waiting in bKash Payment Lobby |

---

## ✨ Features

### Public Site
- **CMS-Driven Landing Page** — Hero showcase, philosophy, mentor spotlight, learning roadmap, featured lessons, curated **Courses** preview, merchandise showcase, student reviews, and CTA sections.
- **Dedicated Courses Catalog (`/courses`, `/courses/[id]`)** — Filterable guitar programs by expertise level (`Beginner`, `Intermediate`, `Advanced`, `All Levels`) with syllabus highlights and one-click enrollment.
- **Lesson Catalog (`/lessons/[id]`)** — Public lesson details with HD YouTube embeds, printable PDF TABs, and studio backing audio.
- **Merchandise Store (`/merchandise`, `/cart`, `/checkout`)** — Product browsing, cart management, promo coupons, and bKash checkout (with `/bkash-faq`).
- **Legal Pages** — Privacy Policy and Terms of Service.

### Authentication & Onboarding
- **Email/Password & Continue with Google** — Firebase Authentication synced with MongoDB and HttpOnly session cookies.
- **Level-Matched Enrollment (`/signup`)** — Choose expertise level (`Beginner`, `Intermediate`, `Advanced`) and select a matching course from a dynamic dropdown.
- **Waiting & bKash Payment Lobby (`/payment-lobby`)** — New students (including **Continue with Google** users) complete/confirm their profile details, choose their expertise level & course, submit bKash payment proof (Sender Mobile + TrxID + optional coupon), and wait for Admin verification with live 5-second auto-polling.
- **Strict Portal Access Gate** — Pending and unverified accounts cannot enter `/student/*` until Admin verifies their enrollment payment.
- **Password Reset** — Forgot / reset password flow via Gmail SMTP (Nodemailer).

### Student Portal (`/student/*`)
- **Dashboard & Profile** — Overview of enrolled courses, skill tier, progress, and an **Enrolled Courses** workspace.
- **Course-Separated Lectures & Common Previews (`/student/lessons`)** — Filter lectures by each enrolled course plus **Common Preview Classes** open to all students.
- **Progress, Attendance & Store** — Lesson completion tracking, attendance logs, student reviews, merchandise cart, checkout, and order history.

### Admin Portal (`/admin/*`)
- **Analytics Dashboard (`/admin/dashboard`)** — Revenue, enrollment, student, and course analytics (Recharts).
- **Course & Tuition Verification Studio (`/admin/courses`)** — Create, edit, feature on homepage preview, or disable courses; review and approve/reject student bKash course tuition submissions.
- **Student & Approval Management (`/admin/students`, `/admin/approvals`)** — Manage student profiles, skill tiers, enrolled courses, and pending registrations.
- **Lessons, Attendance, Merchandise, Orders & Billing** — Assign lessons to specific courses or `Common (All Students)`, track attendance, manage store inventory/orders, coupons, and bKash settings.
- **CMS, Announcements & Review Moderation** — Customize landing page sections, branding/logo, academy notices, and student reviews.

---

## 🧰 Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router + Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Authentication | Firebase Authentication (Email/Password, Google) + HttpOnly Session Cookies |
| Database | MongoDB via Mongoose |
| Media Uploads | Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| Forms & Validation | React Hook Form, Zod |
| Charts & Icons | Recharts, Lucide React |

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) 18.18+ (20+ recommended) and npm
- A [MongoDB](https://www.mongodb.com/) database (local or [Atlas](https://www.mongodb.com/atlas))
- A [Firebase](https://console.firebase.google.com/) project with a Web app
- A [Cloudinary](https://cloudinary.com/) account (for image / logo / file uploads)
- *(Optional)* A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) for password-reset emails

---

## 🚀 Getting Started

### 1. Clone and install

```bash
git clone <your-repository-url>
cd chord-and-craft
npm install
```

### 2. Configure environment variables

Copy the example template and fill in your values:

```bash
# macOS / Linux
cp .env.example .env.local

# Windows (CMD / PowerShell)
copy .env.example .env.local
```

See [Environment Variables](#-environment-variables) below for details.

### 3. Set up Firebase

1. Open the [Firebase Console](https://console.firebase.google.com/) and select your project.
2. Go to **Authentication → Sign-in method** and enable **Email/Password** and **Google**.
   *(Otherwise you will see `auth/operation-not-allowed`.)*
3. Go to **Authentication → Settings → Authorized domains** and ensure `localhost` (and your production domain) is listed.
4. Go to **Project Settings → General → Your apps (Web)** and copy the config values into `.env.local`.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Restart the dev server whenever you edit `.env.local`.

---

## 🔐 Environment Variables

All variables live in `.env.local` (git-ignored). Use [`.env.example`](./.env.example) as a template.

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string. Falls back to `mongodb://localhost:27017/chord_and_craft` |
| `MONGODB_DB` | No | Database name. Defaults to `chord_and_craft` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | e.g. `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | No | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | No | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | No | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | No | Google Analytics measurement ID |
| `CLOUDINARY_CLOUD_NAME` | Yes* | Cloudinary cloud name (*required for media uploads) |
| `CLOUDINARY_API_KEY` | Yes* | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes* | Cloudinary API secret (server-only) |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Yes | Admin email shown / recognized on the client (defaults to `admin@chordandcraft.com`) |
| `ADMIN_EMAIL` | Yes | Admin email recognized by server routes |
| `ADMIN_DEFAULT_EMAIL` | Yes | Email of the seeded default admin account |
| `ADMIN_DEFAULT_PASSWORD` | Yes | Password of the default admin account (**change for production!**) |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | No | Optional client fallback (prefer server-side `ADMIN_DEFAULT_PASSWORD`) |
| `GMAIL_USER` | No | Gmail address used to send password-reset emails |
| `GMAIL_APP_PASSWORD` | No | Gmail App Password (if empty, reset emails are logged to the console) |
| `NEXT_PUBLIC_APP_URL` | No | Base URL for reset links. Falls back to `VERCEL_URL`, then `http://localhost:3000` |

> [!WARNING]
> `NEXT_PUBLIC_*` variables are embedded in the browser bundle. Never place private secrets in them.

---

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint across the codebase |

---

## 📁 Project Structure

```text
chord-and-craft/
├── public/
│   ├── chord-craft-icon.svg   # Official Chord & Craft brand logo emblem
│   ├── audio/                 # Studio backing tracks (.wav)
│   └── tabs/                  # Printable guitar TAB sheets (.pdf)
├── src/
│   ├── app/
│   │   ├── (auth)/            # login, signup, forgot-password, reset-password
│   │   ├── admin/             # Admin portal (dashboard, courses, students, approvals, lessons, CMS, ...)
│   │   ├── student/           # Student portal (dashboard, profile, lessons, orders, attendance, ...)
│   │   ├── courses/           # Public courses catalog & course detail pages
│   │   ├── lessons/           # Public lesson detail pages
│   │   ├── merchandise/       # Public store & product detail pages
│   │   ├── cart/ checkout/    # Shopping cart & bKash checkout
│   │   ├── payment-lobby/     # Onboarding, course selection & bKash verification waiting lobby
│   │   ├── waiting-approval/  # Rejected / status fallback screen
│   │   └── api/               # Route handlers (auth, courses, enrollments, users, lessons, orders, cms, ...)
│   ├── components/
│   │   ├── landing/           # Homepage sections (Hero, CoursesSection, Lessons, Merch, Reviews, ...)
│   │   └── shared/            # BrandLogo, PublicNavbar, PublicFooter, Sidebars, Modals, Toasts
│   ├── context/               # StoreContext (global state, auth, courses, enrollments, cart)
│   ├── lib/                   # authGuard, sessionCookie, firebase, mongodb, cloudinary, mailer, types, utils
│   ├── models/                # Mongoose models (User, Course, CourseEnrollment, Lesson, Order, Product, ...)
│   └── proxy.ts               # Server route guard for /admin/*, /student/*, and /payment-lobby
├── .env.example               # Environment variable template
├── next.config.ts
└── package.json
```

---

## 🔄 Enrollment & Verification Flow

1. A student enrolls via **Email/Password** (`/signup`) or clicks **Continue with Google** (`/login` or `/signup`) → account starts with status **`Pending`**.
2. The student enters the **Waiting & Payment Lobby** (`/payment-lobby`) to complete/confirm personal details, select their expertise level & course, and submit their **bKash Sender Mobile + Transaction ID (TrxID)**.
3. While verification is pending, `/student/*` remains strictly locked and the lobby auto-polls every 5 seconds.
4. The administrator reviews and verifies the payment under **Admin → Courses** (`/admin/courses`) or **Admin → Approvals** (`/admin/approvals`).
5. Once approved, the student's account becomes **`Active`**, the chosen course is added to their profile, and their **Student Dashboard** and course lectures unlock automatically.

---

## ☁️ Deployment

The fastest way to deploy is [Vercel](https://vercel.com/new):

1. Push the repository to GitHub and import it into Vercel.
2. Add all environment variables from `.env.example` under **Project Settings → Environment Variables**.
3. In Firebase, add your Vercel domain to **Authentication → Settings → Authorized domains**.
4. In MongoDB Atlas, allow Vercel's IPs (or `0.0.0.0/0`) under **Network Access**.
5. Deploy.

---

## 🛡️ Security Notes

- Never commit `.env.local` or any real credentials.
- Change the default admin password (`admin123`) before deploying to production.
- Rotate any API key or credential that has been accidentally shared or committed.
- Restrict Firebase authorized domains and MongoDB Atlas network access for production.

---

## 🐛 Troubleshooting

| Problem | Fix |
| --- | --- |
| `Firebase: Error (auth/operation-not-allowed)` | Enable **Email/Password** and **Google** in Firebase → Authentication → Sign-in method |
| `Firebase credentials are missing` warning | Fill the `NEXT_PUBLIC_FIREBASE_*` values in `.env.local` and restart the dev server |
| `auth/unauthorized-domain` | Add your domain to Firebase → Authentication → Authorized domains |
| MongoDB connection errors | Verify `MONGODB_URI` and your MongoDB Atlas IP allow-list |
| Password-reset email not arriving | Set `GMAIL_USER` + `GMAIL_APP_PASSWORD` (otherwise emails log to the server console) |
| Environment changes not taking effect | Restart `npm run dev` |

---

## 📄 License

Private project — all rights reserved by **Chord & Craft — Harmonic Guitar Academy**.
