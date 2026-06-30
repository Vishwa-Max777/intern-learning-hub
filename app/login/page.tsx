"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Lock, User } from 'lucide-react'

const VALID_USERNAME = 'gokul'
const VALID_PASSWORD = 'gokul'
const LOGIN_STORAGE_KEY = 'intern_logged_in'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage.getItem(LOGIN_STORAGE_KEY) === 'true') {
      router.replace('/')
      return
    }
    setIsReady(true)
  }, [router])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LOGIN_STORAGE_KEY, 'true')
      }
      router.replace('/')
      return
    }

    setError('Invalid login details. Please try again.')
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500 text-white shadow-md shadow-blue-500/20">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">Login</h1>
          <p className="mt-2 text-sm text-slate-500">Simple access page for the Intern Hub app.</p>
        </div>

        {success ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-center text-emerald-900">
            <p className="font-semibold">Login successful.</p>
            <p className="mt-2 text-sm text-slate-600">You may now continue into the application.</p>
            <Link href="/" className="mt-5 inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
              Go to Home <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                Username
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Sign in
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-xs text-slate-500">
          No security layer is required for this demo.
        </div>
      </div>
    </div>
  )
}
