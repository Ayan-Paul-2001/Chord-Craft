<div align="center">
  <img src="./public/chord-craft-icon.svg" alt="Chord & Craft — Harmonic Guitar Academy Logo" width="88" height="88" />
  <h1>Chord &amp; Craft — Harmonic Guitar Academy</h1>
  <p>
    <strong>Full-stack conservatory &amp; guitar learning platform</strong> built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Firebase Auth, MongoDB, and Cloudinary.
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16-09090b?style=for-the-badge&logo=nextdotjs&logoColor=f59e0b" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/React-19-09090b?style=for-the-badge&logo=react&logoColor=f59e0b" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5-09090b?style=for-the-badge&logo=typescript&logoColor=f59e0b" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-09090b?style=for-the-badge&logo=tailwindcss&logoColor=f59e0b" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-09090b?style=for-the-badge&logo=mongodb&logoColor=f59e0b" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Firebase-Auth-09090b?style=for-the-badge&logo=firebase&logoColor=f59e0b" alt="Firebase Auth" />
  </p>
  <p>
    <a href="#demo-login-credentials">Demo Login</a> &middot;
    <a href="#features">Features</a> &middot;
    <a href="#getting-started">Getting Started</a> &middot;
    <a href="#environment-variables">Environment Variables</a> &middot;
    <a href="#project-structure">Project Structure</a>
  </p>
</div>

---

<a id="demo-login-credentials"></a>

## <img src="./docs/icons/key-round.svg" width="18" height="18" alt="" /> Demo Login Credentials

Sign in at **`/login`** using the default seeded accounts below:

### Administrator Demo Account

| Field | Value |
| --- | --- |
| **Portal URL** | [`http://localhost:3000/login`](http://localhost:3000/login) &rarr; redirects to `/admin/dashboard` |
| **Email** | `admin@chordandcraft.com` |
| **Password** | `admin123` |
| **Role** | Administrator (`Julian Mercer`) |

> [!NOTE]
> If `ADMIN_EMAIL` / `ADMIN_DEFAULT_EMAIL` and `ADMIN_DEFAULT_PASSWORD` are configured in `.env.local`, those values override the default fallback password (`admin123`). Administrator accounts strictly sign in with email and password and cannot use Student Google Sign-In.

### Seeded Demo Student Accounts *(Optional)*

| Role / State | Email | Password | Skill Level &amp; Enrolled Courses |
| --- | --- | --- | --- |
| **Active Student** | `tariq.hasan@gmail.com` | `password123` | Intermediate — Acoustic Fingerstyle &amp; Electric Lead |
| **Active Student** | `nusrat.jahan@yahoo.com` | `password123` | Beginner — Acoustic Fingerstyle Mastery |
| **Active Student** | `tanvir.ahmed@outlook.com` | `password123` | Advanced — Electric Lead &amp; Neoclassical Sweep |
| **Pending Verification** | `abrar.chowdhury@gmail.com` | `password123` | Beginner — Waiting in bKash Payment Lobby |

---

<a id="features"></a>

## <img src="./docs/icons/sparkles.svg" width="18" height="18" alt="" /> Features

### Public Site
- **CMS-Driven Landing Page** — Hero showcase, philosophy, mentor spotlight, learning roadmap, featured lessons, curated **Courses** preview, merchandise showcase, student reviews, and CTA sections.
- **Dedicated Courses Catalog (`/courses`, `/courses/[id]`)** — Filterable guitar programs by expertise level (`Beginner`, `Intermediate`, `Advanced`, `All Levels`) with syllabus highlights and one-click enrollment.
- **Lesson Catalog (`/lessons/[id]`)** — Public lesson previews with HD YouTube embeds, printable PDF TABs, and studio backing audio.
- **Merchandise Store (`/merchandise`, `/cart`, `/checkout`)** — Product browsing, cart management, promo coupons, and bKash checkout (with `/bkash-faq`).
- **Legal Pages** — Privacy Policy and Terms of Service.

### Authentication &amp; Onboarding
- **Email/Password &amp; Continue with Google** — Firebase Authentication synced with MongoDB and HttpOnly session cookies.
- **Level-Matched Enrollment (`/signup`)** — Choose expertise level (`Beginner`, `Intermediate`, `Advanced`) and select a matching course from a dynamic dropdown.
- **Waiting &amp; bKash Payment Lobby (`/payment-lobby`)** — New students (including **Continue with Google** users) complete or confirm their profile details, choose their expertise level and course, submit bKash payment proof (Sender Mobile + TrxID + optional coupon), and wait for Admin verification with live 5-second auto-polling.
- **Strict Portal Access Gate** — Pending and unverified accounts cannot enter `/student/*` until Admin verifies their enrollment payment.
- **Password Reset** — Forgot / reset password flow via Gmail SMTP (Nodemailer).

### Student Portal (`/student/*`)
- **Dashboard &amp; Profile** — Mastery overview, skill tier, progress analytics, personal profile settings, and an **Enrolled Courses** tab strip.
- **Course-Separated Lectures &amp; Common Previews (`/student/lessons`)** — Shows only enrolled course lectures, Admin-permitted lectures, and **Common Preview Classes** open to all students.
- **Progress, Attendance &amp; Store** — Lesson completion tracking, attendance logs, student reviews, merchandise cart, checkout, and order history.

### Admin Portal (`/admin/*`)
- **Analytics Dashboard (`/admin/dashboard`)** — Revenue, enrollment, student, and course analytics (Recharts).
- **Course &amp; Tuition Verification Studio (`/admin/courses`)** — Create, edit, toggle homepage preview, or disable courses; review and approve/reject student bKash course tuition submissions.
- **Student &amp; Approval Management (`/admin/students`, `/admin/approvals`)** — Manage student profiles, skill tiers, enrolled courses, per-lecture access permissions, and pending registrations.
- **Lessons, Attendance, Merchandise, Orders &amp; Billing** — Assign lessons to specific courses or `Common (All Students)`, log session attendance, manage store inventory/orders, coupons, and bKash settings.
- **CMS, Announcements &amp; Review Moderation** — Customize landing page sections, branding/logo, academy notices, and student reviews.

---

<a id="tech-stack"></a>

## <img src="./docs/icons/layers.svg" width="18" height="18" alt="" /> Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router + Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Authentication | Firebase Authentication (Email/Password, Google) + HttpOnly Session Cookies |
| Database | MongoDB via Mongoose |
| Media Uploads | Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| Forms &amp; Validation | React Hook Form, Zod |
| Charts &amp; Icons | Recharts, Lucide React |

---

<a id="prerequisites"></a>

## <img src="./docs/icons/list-checks.svg" width="18" height="18" alt="" /> Prerequisites

- [Node.js](https://nodejs.org/) 18.18+ (20+ recommended) and npm
- A [MongoDB](https://www.mongodb.com/) database (local or [Atlas](https://www.mongodb.com/atlas))
- A [Firebase](https://console.firebase.google.com/) project with a Web app
- A [Cloudinary](https://cloudinary.com/) account (for image, logo, and file uploads)
- *(Optional)* A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) for password-reset emails

---

<a id="getting-started"></a>

## <img src="./docs/icons/rocket.svg" width="18" height="18" alt="" /> Getting Started

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

See [Environment Variables](#environment-variables) below for details.

### 3. Set up Firebase

1. Open the [Firebase Console](https://console.firebase.google.com/) and select your project.
2. Go to **Authentication &rarr; Sign-in method** and enable **Email/Password** and **Google** *(otherwise Firebase returns `auth/operation-not-allowed`)*.
3. Go to **Authentication &rarr; Settings &rarr; Authorized domains** and ensure `localhost` (and your production domain) is listed.
4. Go to **Project Settings &rarr; General &rarr; Your apps (Web)** and copy the config values into `.env.local`.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Restart the server whenever you edit `.env.local`.

---

<a id="environment-variables"></a>

## <img src="./docs/icons/sliders.svg" width="18" height="18" alt="" /> Environment Variables

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
| `NEXT_PUBLIC_ADMIN_EMAIL` | Yes | Admin email recognized on the client (defaults to `admin@chordandcraft.com`) |
| `ADMIN_EMAIL` | Yes | Admin email recognized by server routes |
| `ADMIN_DEFAULT_EMAIL` | Yes | Email of the seeded default admin account |
| `ADMIN_DEFAULT_PASSWORD` | Yes | Password of the default admin account |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | No | Optional client fallback (prefer server-side `ADMIN_DEFAULT_PASSWORD`) |
| `GMAIL_USER` | No | Gmail address used to send password-reset emails |
| `GMAIL_APP_PASSWORD` | No | Gmail App Password (if empty, reset emails are logged to the server console) |
| `NEXT_PUBLIC_APP_URL` | No | Base URL for reset links. Falls back to `VERCEL_URL`, then `http://localhost:3000` |

---

<a id="available-scripts"></a>

## <img src="./docs/icons/terminal.svg" width="18" height="18" alt="" /> Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Run the production server |
| `npm run lint` | Run ESLint across the codebase |

---

<a id="project-structure"></a>

## <img src="./docs/icons/folder.svg" width="18" height="18" alt="" /> Project Structure

```text
chord-and-craft/
├── docs/icons/                # Vector icons used in documentation
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

<a id="enrollment-verification-flow"></a>

## <img src="./docs/icons/git-branch.svg" width="18" height="18" alt="" /> Enrollment &amp; Verification Flow

1. A student enrolls via **Email/Password** (`/signup`) or clicks **Continue with Google** (`/login` or `/signup`) &rarr; account starts with status **`Pending`**.
2. The student enters the **Waiting &amp; Payment Lobby** (`/payment-lobby`) to complete or confirm personal details, select their expertise level and course, and submit their **bKash Sender Mobile + Transaction ID (TrxID)**.
3. While verification is pending, `/student/*` remains strictly locked and the lobby auto-polls every 5 seconds.
4. The administrator reviews and verifies the payment under **Admin &rarr; Courses &amp; Tuition** (`/admin/courses`) or **Admin &rarr; Approvals** (`/admin/approvals`).
5. Once approved, the student's account becomes **`Active`**, the chosen course is added to their profile, and their **Student Dashboard** and enrolled course lectures unlock automatically.

