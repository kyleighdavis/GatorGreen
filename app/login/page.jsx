'use client'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold">Sign in to GatorGreen</h1>
        <button
          onClick={signInWithGoogle}
          className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
