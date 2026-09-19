# RentEase AI

> Find a place that feels like home.

RentEase AI is a full-stack MERN rental and PG discovery platform for students and young working
professionals. Tenants search, compare, save and enquire about listings; owners publish and manage
their properties; admins moderate everything from one console.

---

## Problem statement

Finding a PG or rented room in an unfamiliar city is fragmented and slow:

- Listings are scattered across brokers, WhatsApp groups and classified sites
- There is no reliable way to filter by budget, locality, room type or amenities
- Comparing two or three shortlisted places means keeping notes by hand
- Amenities and meal availability are vague or missing
- Fake, stale and duplicate listings are common
- Inquiries get lost across phone calls and chat threads
- Nothing tells you which listings actually fit *your* requirements

## Solution

One platform that covers the whole journey:

| For tenants | For owners | For admins |
| --- | --- | --- |
| Search and filter listings | Publish listings | Approve or reject listings |
| Compare up to 3 properties | Edit and delete own listings | Delete inappropriate listings |
| Save favourites | Track tenant inquiries | Manage users |
| Send inquiries and track status | Update inquiry status | View platform analytics |
| Review properties | See reviews and average rating | Monitor platform activity |
| Get explained recommendations | Owner analytics dashboard | |

---

## Key features

- Clerk authentication with tenant / owner / admin roles stored in MongoDB
- Property discovery with search, ten filters, four sort orders and pagination
- Property detail pages with image gallery, amenities, owner info, reviews and similar listings
- Favourites, up-to-three comparison table and recently viewed tracking
- Inquiry system with owner-side status workflow (pending / contacted / closed)
- Review system with a one-review-per-user rule and automatic rating recalculation
- Preference onboarding that drives a transparent 100-point recommendation score
- Owner workspace: listing CRUD, inquiry inbox, reviews and Recharts analytics
- Admin console: moderation queue, user management and four platform charts
- Loading skeletons, empty states, error states, toasts, validation and confirm dialogs throughout

## User roles

| Role | How it is set | What it unlocks |
| --- | --- | --- |
| `tenant` | Default on first sign-in, or chosen in onboarding | Search, save, compare, enquire, review, recommendations |
| `owner` | Chosen in onboarding or from the profile page | `/owner/*` listing and inquiry tools |
| `admin` | Set directly in MongoDB (never from the UI) | `/admin/*` moderation and analytics |

Promote yourself to admin after signing up:

```js
// mongosh
use rentease
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

---

## AI recommendation system

The feature is labelled **AI-Powered Smart Recommendations**. It is a transparent, explainable
**preference-matching engine** in `server/services/recommendationService.js` - **not** a trained
machine-learning model, and it needs no paid AI API key.

Each approved listing is scored out of 100 against the tenant's saved preferences:

| Signal | Weight | What it checks |
| --- | --- | --- |
| Budget | 30 | Rent inside min/max, partial credit up to 25% above |
| Location | 25 | Preferred city (16) + preferred locality (9) |
| Property type | 15 | PG / Room / Flat / Apartment |
| Room type | 10 | Single / Double / Triple / Shared |
| Amenities | 10 | Proportion of required amenities present |
| Food preference | 5 | Meals included when requested |
| Rating | 5 | Average tenant rating |

`GET /api/recommendations` returns, for every listing:

```json
{
  "matchScore": 87,
  "reasons": [
    "Within your preferred budget",
    "Located in Delhi, your preferred city",
    "Matches your preferred room type (Single)",
    "Contains 4 of your 5 requested amenities"
  ]
}
```

Because scoring is isolated in one `scoreProperty` function, it can later be swapped for an ML
model or an LLM call (semantic description matching, learned weights, collaborative filtering)
without touching controllers, routes or the frontend.

---

## Tech stack

**Frontend** React 18, Vite, Tailwind CSS, React Router DOM, Axios, Lucide React, Recharts, React Hot Toast
**Backend** Node.js, Express, MongoDB, Mongoose
**Auth** Clerk (`@clerk/clerk-react` on the client, `@clerk/express` on the server)

No JWT, no bcrypt, no custom sessions - Clerk owns all credentials and no passwords are stored.

## System architecture

```
React (Vite)  ──►  Axios instance with Clerk token  ──►  Express API  ──►  MongoDB (Mongoose)
     ▲                                                        │
     └──────────── ClerkProvider session ◄── clerkMiddleware ──┘
```

1. Clerk authenticates the user in the browser.
2. `AppContext` mirrors the Clerk profile into MongoDB (`POST /api/users/sync`).
3. Every Axios request attaches `Authorization: Bearer <clerk session token>`.
4. `clerkMiddleware()` verifies it, `requireAuth` loads the MongoDB user, `requireRole` authorizes.

## Database models

| Model | Fields |
| --- | --- |
| **User** | clerkUserId, name, email, phone, role, profileImage, city, preferences{preferredCity, preferredLocality, minRent, maxRent, propertyType, roomType, requiredAmenities, foodRequired, genderPreference, isCompleted}, timestamps |
| **Property** | title, description, propertyType, roomType, rent, securityDeposit, city, locality, address, latitude, longitude, amenities, furnishing, foodAvailable, genderPreference, availableFrom, images, owner, status, rating, reviewCount, rejectionReason, timestamps |
| **Favourite** | user, property, createdAt (unique on user+property) |
| **Inquiry** | tenant, owner, property, message, status, timestamps |
| **Review** | user, property, rating, comment, timestamps (unique on user+property) |
| **RecentlyViewed** | user, property, viewedAt (unique on user+property) |

## API routes

**Auth / users**

| Method | Route | Access |
| --- | --- | --- |
| POST | `/api/auth/sync`, `/api/users/sync` | authenticated |
| GET | `/api/auth/me`, `/api/users/me` | authenticated |
| PATCH | `/api/users/me` | authenticated |
| PATCH | `/api/users/preferences` | authenticated |
| PATCH | `/api/users/role` | authenticated (admin role cannot be self-assigned) |
| GET | `/api/users/dashboard` | tenant |
| GET | `/api/users/:id/public` | public |

**Properties**

| Method | Route | Access |
| --- | --- | --- |
| GET | `/api/properties` | public (approved only, filters + sort + pagination) |
| GET | `/api/properties/featured`, `/api/properties/cities` | public |
| GET | `/api/properties/:id`, `/api/properties/:id/similar` | public |
| GET | `/api/properties/owner/mine`, `/api/properties/owner/stats` | owner |
| POST | `/api/properties` | owner |
| PUT / DELETE | `/api/properties/:id` | owner (own listings only) |

**Favourites** `GET /api/favourites`, `POST /api/favourites/:propertyId`, `DELETE /api/favourites/:propertyId`
**Inquiries** `POST /api/inquiries`, `GET /api/inquiries/my`, `GET /api/inquiries/owner`, `PATCH /api/inquiries/:id`
**Reviews** `GET /api/reviews/property/:propertyId`, `POST /api/reviews`, `DELETE /api/reviews/:id`, `GET /api/reviews/owner`
**Recommendations** `GET /api/recommendations`
**Recently viewed** `GET /api/recently-viewed`, `POST /api/recently-viewed/:propertyId`
**Admin** `GET /api/admin/stats`, `GET /api/admin/users`, `DELETE /api/admin/users/:id`, `GET /api/admin/properties`, `PATCH /api/admin/properties/:id/status`, `DELETE /api/admin/properties/:id`

Every response follows one shape:

```json
{ "success": true,  "data": { } }
{ "success": false, "message": "Property not found" }
```

## Folder structure

```
rent-ease/
├── client/
│   ├── public/favicon.svg
│   ├── src/
│   │   ├── components/      Navbar, Footer, PropertyCard, FilterSidebar, CompareBar,
│   │   │                    ReviewSection, ProtectedRoute, ui/ (shared primitives)
│   │   ├── pages/           Landing, Properties, PropertyDetails, Favourites, Compare,
│   │   │                    Recommendations, Onboarding, TenantDashboard, MyInquiries,
│   │   │                    Profile, About, Login, Register, owner/, admin/
│   │   ├── layouts/         MainLayout, DashboardLayout
│   │   ├── context/         AppContext (Clerk sync, favourites, comparison)
│   │   ├── services/        api.js (Axios + Clerk token), endpoints.js
│   │   ├── hooks/           useDebounce, useDocumentTitle
│   │   ├── utils/           constants.js, format.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/
│   ├── config/db.js
│   ├── controllers/         user, property, favourite, inquiry, review,
│   │                        recommendation, recentlyViewed, admin, dashboard
│   ├── middleware/          auth.js, errorHandler.js
│   ├── models/              User, Property, Favourite, Inquiry, Review, RecentlyViewed
│   ├── routes/              one router per resource
│   ├── services/            recommendationService.js, ratingService.js
│   ├── utils/               apiResponse, asyncHandler, validators, constants
│   ├── seed/                seed.js, properties.js
│   ├── server.js
│   └── package.json
│
├── package.json             runs client + server together
├── README.md
└── .gitignore
```

---

## Installation

```bash
cd rent-ease
npm install     # installs root, server and client dependencies
```

Then create the two env files (see below) and run:

```bash
npm run dev     # Express on :5000 and Vite on :5173
```

## Environment variables

`server/.env` (copy from `server/.env.example`)

```
MONGODB_URI=mongodb://127.0.0.1:27017/rentease
PORT=5000
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
CLIENT_URL=http://localhost:5173
```

`client/.env` (copy from `client/.env.example`)

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
VITE_API_URL=http://localhost:5000/api
```

`CLERK_SECRET_KEY` and `MONGODB_URI` stay on the server only. Never put the secret key in any
`VITE_` variable - anything prefixed with `VITE_` is bundled into the browser.

## Clerk setup

1. Create a free account at <https://dashboard.clerk.com> and add an application.
2. Enable the sign-in methods you want (email + password and/or Google).
3. Open **API Keys** and copy:
   - Publishable key (`pk_test_...`) into both `.env` files
   - Secret key (`sk_test_...`) into `server/.env` only
4. Under **Paths**, set sign-in to `/login` and sign-up to `/register` (the app renders Clerk's
   `<SignIn />` and `<SignUp />` components at those routes).
5. Restart `npm run dev` after editing any env file.

## MongoDB setup

**Local:** install MongoDB Community Edition, start `mongod`, and keep
`MONGODB_URI=mongodb://127.0.0.1:27017/rentease`.

**Atlas:** create a free cluster, add a database user, allow your IP under Network Access, then use
`mongodb+srv://<user>:<password>@<cluster>.mongodb.net/rentease?retryWrites=true&w=majority`.

## Running the app

```bash
npm run dev       # both together (recommended)
npm run server    # Express only  -> http://localhost:5000
npm run client    # Vite only     -> http://localhost:5173
```

Health check: <http://localhost:5000/api/health>

## Database seeding

```bash
npm run seed      # or: cd server && npm run seed
```

This wipes the collections and inserts 1 admin, 3 owners, 5 tenants, 15 properties (12 approved,
2 pending, 1 rejected), reviews, inquiries, favourites and recently-viewed rows.

**Important - Clerk and seeded users.** Authentication is handled by Clerk, so no passwords exist
anywhere. Seeded users carry *placeholder* Clerk ids (`seed_admin_001`, `seed_owner_001`, ...). To
sign in as one of them, create the account in Clerk (or sign up in the app), copy your real Clerk
user id from the Clerk dashboard, and point the seeded record at it:

```js
// mongosh
use rentease
db.users.updateOne(
  { clerkUserId: "seed_owner_001" },
  { $set: { clerkUserId: "user_2abcDEF..." } }
)
```

The simpler demo path is to sign up normally and just change your own role:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Demo instructions

1. `npm run seed`, then `npm run dev`, then open <http://localhost:5173>.
2. Landing page: show the hero, search preview and featured listings.
3. `/properties`: filter by city and budget, change the sort order, page through results.
4. Open a listing: gallery, amenities, owner card, reviews, similar properties.
5. Sign up -> onboarding asks for role and preferences -> "Your personalized recommendations are ready."
6. `/recommendations`: point out the match percentage and the reasons under each card.
7. Save two or three listings, then open `/compare` for the side-by-side table.
8. Send an inquiry from a listing, then check `/inquiries` for its status.
9. Switch your role to owner in `/profile`, add a listing at `/owner/properties/new`, and show the
   "submitted for admin approval" state plus the owner charts.
10. Promote yourself to admin in MongoDB, reload, and approve the listing at `/admin/properties`.
11. Finish on `/admin` with the four analytics charts.

## Testing checklist

- [ ] `GET /api/health` returns `{ success: true }`
- [ ] Sign up, sign in and sign out through Clerk all work
- [ ] A new user is created in MongoDB with the Clerk user id
- [ ] Onboarding saves preferences and redirects to recommendations
- [ ] Filters, search, sorting and pagination all change the result set
- [ ] Only approved listings appear on `/properties`
- [ ] Favourite and un-favourite persist across a page reload
- [ ] Comparison caps at three properties
- [ ] Inquiry appears in the tenant's list and the owner's inbox
- [ ] A second review by the same user on the same property is rejected
- [ ] Property rating and review count update after a review
- [ ] Owner cannot edit or delete another owner's listing (returns 403)
- [ ] Non-admin hitting `/api/admin/stats` returns 403
- [ ] Admin approve/reject changes public visibility
- [ ] Layout works at 375px, 768px and 1440px widths

## Common errors and fixes

| Symptom | Fix |
| --- | --- |
| "Clerk key missing" screen | Create `client/.env` with `VITE_CLERK_PUBLISHABLE_KEY` and restart Vite |
| `Cannot reach the RentEase API` toast | Start the server (`npm run server`); check `VITE_API_URL` |
| `MongoDB connection failed` | Start `mongod`, or fix `MONGODB_URI` / Atlas IP allow-list |
| 401 on every protected route | `CLERK_SECRET_KEY` missing or from a different Clerk application than the publishable key |
| CORS error in the console | Set `CLIENT_URL=http://localhost:5173` in `server/.env` |
| `/admin` redirects to `/unauthorized` | Set your user's `role` to `admin` in MongoDB and reload |
| Tailwind classes not applying | Restart Vite so `tailwind.config.js` is re-read |
| Images not loading | Use direct image URLs ending in `.jpg`/`.png`; a fallback image is shown otherwise |
| Port 5000 already in use | Change `PORT` in `server/.env` and `VITE_API_URL` to match |

## Deployment

**Backend (Render / Railway)**

1. Push the repo to GitHub and create a Web Service with root directory `server`.
2. Build command `npm install`, start command `npm start`.
3. Add env vars: `MONGODB_URI` (Atlas), `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `CLIENT_URL`
   (your deployed frontend URL), `PORT`.

**Frontend (Vercel / Netlify)**

1. Create a project with root directory `client`.
2. Build command `npm run build`, output directory `dist`.
3. Add env vars `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL` (your deployed API URL + `/api`).
4. Add a SPA rewrite so client-side routes work: Vercel `{"rewrites":[{"source":"/(.*)","destination":"/"}]}`,
   Netlify `/* /index.html 200`.

**Clerk** Add both deployed domains under Clerk's allowed origins, and use production keys
(`pk_live_` / `sk_live_`) for a production instance.

## Future enhancements

- Real map integration with property pins and draw-to-search
- Geo-location based recommendations using latitude/longitude distance
- Cloudinary uploads to replace image URLs
- Real-time chat between tenants and owners
- ML-based recommendation model trained on click and inquiry history
- Fraud detection for duplicate or suspicious listings
- LLM-based analysis of property descriptions and review sentiment
- Payment integration for booking and deposits
- Document-backed property verification
- Advanced location intelligence (commute time to college or office)
