# Latitude Architects

Website and CMS for Latitude Architects and Designers Ltd, a RIBA Chartered architectural practice founded in 2000.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Supabase** (hosted PostgreSQL database)
- **Prisma 7** (ORM with pg adapter)
- **NextAuth v5** (authentication, JWT sessions)
- **Cloudinary** (image hosting and delivery)
- **Tailwind CSS v4** (styling)
- **DM Sans** (typography via next/font)
- **Tiptap** (rich text editor for CMS)
- **@dnd-kit** (drag-and-drop image reordering)

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/latitude-architects.git
cd latitude-architects
npm install
```

### 2. Set environment variables

Copy `.env.local` and fill in the values:

```
DATABASE_URL="your-supabase-pooled-connection-string"
DIRECT_URL="your-supabase-direct-connection-string"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

Also update the `.env` file with the same `DATABASE_URL` and `DIRECT_URL` values (Prisma CLI reads from `.env`).

### 3. Push database schema

```bash
npx prisma db push
```

### 4. Seed the admin user

```bash
npx tsx prisma/seed.ts
```

This creates the default admin login:
- Email: `admin@latitudearchitects.com`
- Password: `latitude2025`

**Change this password immediately after first login** via Settings in the CMS.

### 5. Start development server

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin/login` for the CMS.

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > Database**
3. Copy the **Connection string (URI)** — this is your `DATABASE_URL`
4. Copy the **Direct connection** string — this is your `DIRECT_URL`
5. Paste both into `.env.local` and `.env`

## Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. From the dashboard, copy:
   - **Cloud name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`
3. Paste into `.env.local`

## CMS Usage

### Login

Navigate to `/admin/login` and sign in with your admin credentials.

### Adding a Project

1. Click **Projects** in the sidebar
2. Click **New Project** in the toolbar
3. Upload a main image, fill in the title, year, location, and other fields
4. Write the description using the rich text editor
5. Add gallery images (drag to reorder)
6. Click **Save**
7. Click **Publish** to make it visible on the public site

### Publishing

Items (projects, news, team members) are drafts by default. Click the **Publish** button to make them live. Click **Unpublish** to revert to draft.

### Reordering

Set the **Order** field on projects and team members. Lower numbers appear first.

## Deployment to Vercel

1. Push your code to GitHub
2. Connect the repository in the [Vercel dashboard](https://vercel.com)
3. Add all environment variables from `.env.local` in Vercel's project settings
4. Deploy — Vercel will automatically build and deploy

## Changing the Admin Password

1. Log in to the CMS at `/admin/login`
2. Click **Settings** in the sidebar
3. Enter your current password
4. Enter and confirm a new password
5. Click **Update Settings**
