import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CarCard } from '@/components/shared/CarCard'
import { MOCK_CARS } from '@/mock-data/driver'

const PER_PAGE_DESKTOP = 12
const PER_PAGE_MOBILE = 6

export function DriverBrowseCarsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const isMobile = useMemo(() => typeof window !== 'undefined' && window.innerWidth < 768, [])
  const perPage = isMobile ? PER_PAGE_MOBILE : PER_PAGE_DESKTOP

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return MOCK_CARS.filter((c) => {
      if (!q) return true
      return c.brand.toLowerCase().includes(q) || c.model.toLowerCase().includes(q)
    })
  }, [search])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const handlePage = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse Cars</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Find the perfect car for your next rental</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by brand or model..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-9" />
      </div>

      {paginated.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No cars found</p>
          <p className="text-sm">Try a different search term.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {paginated.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                onView={(id) => navigate(`/driver/cars/${id}`)}
                onBook={(id) => navigate(`/driver/bookings?car=${id}`)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => handlePage(page - 1)}>Previous</Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={page === i + 1 ? 'default' : 'outline'}
                  onClick={() => handlePage(i + 1)}
                  className="min-w-[36px]"
                >
                  {i + 1}
                </Button>
              ))}
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => handlePage(page + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
