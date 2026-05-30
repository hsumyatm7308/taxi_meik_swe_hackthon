import { useEffect, useState } from 'react'
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
          ? 'border-amber-200 bg-amber-50 text-amber-700'
          : 'border-slate-200 bg-slate-50 text-slate-600'
      )}
    >
      {initials || 'DR'}
    </div>
  )
}

function MatchMetric({
  label,
  value,
  featured,
}: {
  label: string
  value: string
  featured?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2',
        featured ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'
      )}
    >
      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  )
}

function DriverCard({ driver, featured = false }: { driver: DriverMatch; featured?: boolean }) {
  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-xl border bg-white transition-all duration-300',
        featured
          ? 'border-amber-200 p-5 shadow-sm ring-1 ring-amber-100 lg:col-span-2'
          : 'border-slate-200 p-4 shadow-sm hover:border-slate-300 hover:shadow-md'
      )}
    >
      {featured && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-amber-400" />
      )}

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <DriverAvatar name={driver.name} featured={featured} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-slate-950">{driver.name}</h3>
              {driver.isRecommended && (
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                  Best Match
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">{driver.township}</p>
          </div>
        </div>

        <div
          className={cn(
            'inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
            featured
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-slate-200 bg-slate-50 text-slate-600'
          )}
        >
          Rank {driver.rank}
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-3">
        <MatchMetric
          featured={featured}
          label="Rating"
          value={`${driver.rating.toFixed(1)} / 5`}
        />
        <MatchMetric
          featured={featured}
          label="Experience"
          value={`${driver.experienceYears} years`}
        />
      </div>

      <div
        className={cn(
          'relative mt-4 rounded-lg border p-4',
          featured ? 'border-amber-200 bg-amber-50/60' : 'border-slate-200 bg-slate-50'
        )}
      >
        <div className="mb-2 text-xs font-medium text-slate-700">Reasoning</div>
        <p className="text-sm leading-6 text-slate-600">{driver.summary}</p>
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
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">
                Gemini AI Matchmaker
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search ranked applicants with location, rating, and experience signals.
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live database
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 transition-colors focus-within:border-amber-300 focus-within:bg-white"
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find me a 5-star driver in Kamayut"
            className="h-12 min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-950 outline-none placeholder:text-slate-400 sm:text-base"
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Search
          </button>
        </form>

        {isProcessing && (
          <div className="mx-auto flex w-full max-w-3xl items-center justify-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700">
            <span className="relative flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-500" />
            </span>
            Gemini is analyzing applicants...
          </div>
        )}

        {hasSearched && !isProcessing && topMatch && (
          <>
            <div className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Showing AI-ranked drivers from your database for{' '}
              <span className="font-semibold text-slate-950">"{submittedQuery}"</span>.
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
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            {error || 'No approved drivers found in the database for this search.'}
          </div>
        )}
      </div>
    </section>
  )
}
