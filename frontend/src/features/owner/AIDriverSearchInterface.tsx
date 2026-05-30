import { useEffect, useState } from 'react'
import {
  BrainCircuit,
  CheckCircle2,
  Database,
  MapPin,
  Send,
  Sparkles,
  Star,
  Trophy,
  UserRound,
  WandSparkles,
} from 'lucide-react'
import apiClient from '@/api/client'
import { cn } from '@/utils/format'

type DriverMatch = {
  id: string
  name: string
  township: string
  rating: number
  experienceYears: number
  rank: number
  isRecommended: boolean
  summary: string
}

type ApiDriverMatch = {
  id?: string
  name?: string
  township?: string
  average_rating?: number
  experience_years?: number
  rank?: number
  is_recommended?: boolean
  summary?: string
}

type DriverSearchResponse = {
  data?: {
    ranked_applicants?: ApiDriverMatch[]
  }
}

function mapApiDriver(driver: ApiDriverMatch, index: number): DriverMatch {
  return {
    id: driver.id || `${driver.name || 'driver'}-${index}`,
    name: driver.name || 'Unknown Driver',
    township: driver.township || 'Unknown',
    rating: Number(driver.average_rating || 0),
    experienceYears: Number(driver.experience_years || 0),
    rank: Number(driver.rank || index + 1),
    isRecommended: Boolean(driver.is_recommended ?? index === 0),
    summary: driver.summary || 'Ranked from approved driver data in the database.',
  }
}

function DriverAvatar({ name, featured }: { name: string; featured?: boolean }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={cn(
        'grid h-12 w-12 shrink-0 place-items-center rounded-full border text-sm font-semibold',
        featured
          ? 'border-cyan-300/60 bg-cyan-300/15 text-cyan-50 shadow-[0_0_28px_rgba(34,211,238,0.35)]'
          : 'border-white/10 bg-white/5 text-white/80'
      )}
    >
      {initials || <UserRound className="h-5 w-5" />}
    </div>
  )
}

function MatchMetric({
  icon,
  label,
  value,
  featured,
}: {
  icon: React.ReactNode
  label: string
  value: string
  featured?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2',
        featured ? 'border-cyan-300/20 bg-cyan-300/10' : 'border-white/10 bg-white/5'
      )}
    >
      <div className="flex items-center gap-2 text-[11px] text-white/45">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

function DriverCard({ driver, featured = false }: { driver: DriverMatch; featured?: boolean }) {
  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-xl border backdrop-blur-md transition-all duration-300',
        featured
          ? 'border-cyan-300/40 bg-white/10 p-5 shadow-[0_0_55px_rgba(34,211,238,0.16)] lg:col-span-2'
          : 'border-white/10 bg-white/5 p-4 hover:border-white/20 hover:bg-white/10'
      )}
    >
      {featured && (
        <>
          <div className="pointer-events-none absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
        </>
      )}

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <DriverAvatar name={driver.name} featured={featured} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-white">{driver.name}</h3>
              {driver.isRecommended && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-300/15 px-2 py-1 text-[11px] font-medium text-amber-100">
                  <Trophy className="h-3 w-3" />
                  Best Match
                </span>
              )}
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-white/55">
              <MapPin className="h-3.5 w-3.5 text-cyan-200/80" />
              {driver.township}
            </p>
          </div>
        </div>

        <div
          className={cn(
            'inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
            featured
              ? 'border-cyan-200/40 bg-cyan-200/15 text-cyan-50'
              : 'border-white/10 bg-white/5 text-white/70'
          )}
        >
          Rank {driver.rank}
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-3">
        <MatchMetric
          featured={featured}
          icon={<Star className="h-3.5 w-3.5 text-amber-200" />}
          label="Rating"
          value={`${driver.rating.toFixed(1)} / 5`}
        />
        <MatchMetric
          featured={featured}
          icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" />}
          label="Experience"
          value={`${driver.experienceYears} years`}
        />
      </div>

      <div
        className={cn(
          'relative mt-4 rounded-lg border p-4',
          featured ? 'border-cyan-200/20 bg-black/25' : 'border-white/10 bg-black/20'
        )}
      >
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-cyan-100">
          <BrainCircuit className="h-4 w-4" />
          AI Reasoning
        </div>
        <p className="text-sm leading-6 text-white/68">{driver.summary}</p>
      </div>
    </article>
  )
}

export function AIDriverSearchInterface() {
  const [query, setQuery] = useState('Find me a 5-star driver in Kamayut')
  const [submittedQuery, setSubmittedQuery] = useState(query)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasSearched, setHasSearched] = useState(true)
  const [rankedDrivers, setRankedDrivers] = useState<DriverMatch[]>([])
  const [error, setError] = useState<string | null>(null)

  const topMatch = rankedDrivers[0]
  const otherApplicants = rankedDrivers.slice(1)

  const searchDrivers = async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) return

    setHasSearched(false)
    setIsProcessing(true)
    setError(null)

    try {
      const res = await apiClient.post<DriverSearchResponse>('/owner/ai-matchmaker/search', {
        query: trimmedQuery,
      })

      const applicants = res.data.data?.ranked_applicants || []
      setRankedDrivers(applicants.map(mapApiDriver))
      setSubmittedQuery(trimmedQuery)
      setHasSearched(true)
    } catch {
      setRankedDrivers([])
      setError('Could not search drivers from the database. Please try again.')
      setHasSearched(true)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    searchDrivers(query)
  }

  useEffect(() => {
    searchDrivers(query)
  }, [])

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#05070d] px-4 py-5 text-white shadow-2xl sm:px-6 sm:py-7">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-52 w-52 rounded-full bg-amber-300/10 blur-3xl" />

      <div className="relative flex flex-col gap-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-cyan-200/30 bg-cyan-200/10 shadow-[0_0_32px_rgba(34,211,238,0.25)]">
              <WandSparkles className="h-5 w-5 text-cyan-100" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-white sm:text-2xl">
                Gemini AI Matchmaker
              </h2>
              <p className="mt-1 text-sm text-white/50">
                Search ranked applicants with location, rating, and experience signals.
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.85)]" />
            Live database
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-md focus-within:border-cyan-200/40 focus-within:shadow-[0_0_45px_rgba(34,211,238,0.16)]"
        >
          <Sparkles className="ml-2 hidden h-5 w-5 shrink-0 text-cyan-100 sm:block" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find me a 5-star driver in Kamayut"
            className="h-12 min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-white/35 sm:text-base"
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-200/30 bg-cyan-300/15 px-4 text-sm font-semibold text-cyan-50 transition-all hover:border-cyan-100/60 hover:bg-cyan-300/25 hover:shadow-[0_0_28px_rgba(34,211,238,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>

        {isProcessing && (
          <div className="mx-auto flex w-full max-w-3xl items-center justify-center gap-3 rounded-xl border border-cyan-200/20 bg-cyan-200/10 px-4 py-4 text-sm text-cyan-50 backdrop-blur-md">
            <span className="relative flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-200 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.8)]" />
            </span>
            Gemini is analyzing applicants...
          </div>
        )}

        {hasSearched && !isProcessing && topMatch && (
          <>
            <div className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65 backdrop-blur-md">
              <Database className="h-4 w-4 shrink-0 text-cyan-100" />
              Showing AI-ranked drivers from your database for{' '}
              <span className="font-semibold text-cyan-100">"{submittedQuery}"</span>.
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <DriverCard driver={topMatch} featured />
              {otherApplicants.map((driver) => (
                <DriverCard key={driver.id} driver={driver} />
              ))}
            </div>
          </>
        )}

        {hasSearched && !isProcessing && !topMatch && (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-white/60 backdrop-blur-md">
            {error || 'No approved drivers found in the database for this search.'}
          </div>
        )}
      </div>
    </section>
  )
}
