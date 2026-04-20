# GatorGreen

A Next.js app for finding and favoriting green spaces at UF.

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/kyleighdavis/GatorGreen.git
cd GatorGreen
```

### 2. Set up environment variables

Create a `.env.local` file in the root of the project:

```bash
cp .env.example .env.local
```

Or create it manually and add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tlyapvmcsgmhhlatqqqp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRseWFwdm1jc2dtaGhsYXRxcXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTk0OTksImV4cCI6MjA4ODk5NTQ5OX0.p99M3TI1rklMbMvNqgWC3nEVhgchdPEDnREK76-RnUw
GEMINI_API_KEY=AIzaSyAKUD2NNT8lUhqxyh8X-6rrRaDNAgX1CFI
```

- **Supabase** — get your URL and anon key from your [Supabase project settings](https://supabase.com/dashboard)
- **Gemini** — get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 3. Install dependencies

```bash
npm install
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- [Next.js](https://nextjs.org) — React framework
- [Supabase](https://supabase.com) — auth and database
- [Google Gemini](https://ai.google.dev) — AI-powered space finder
