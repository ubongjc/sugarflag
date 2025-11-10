'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search as SearchIcon, Loader2 } from 'lucide-react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (query.length < 2) return

    setLoading(true)
    setSearched(true)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data.products || [])
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Search Products</h1>
        <p className="text-muted-foreground">
          Search our database for product information
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by product name, brand, or ingredient..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-3 border rounded-md text-lg"
            disabled={loading}
          />
          <Button
            onClick={handleSearch}
            disabled={loading || query.length < 2}
            size="lg"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SearchIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground">
              Try searching with different keywords
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Found {results.length} product{results.length !== 1 ? 's' : ''}
          </p>

          {results.map((product, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{product.brand}</p>

                    {(product.totalSugars !== undefined || product.addedSugars !== undefined) && (
                      <div className="flex gap-4 text-sm mb-3">
                        {product.addedSugars !== undefined && product.addedSugars !== null && (
                          <div>
                            <span className="text-muted-foreground">Added Sugars:</span>
                            <span className="ml-2 font-semibold">{product.addedSugars}g</span>
                          </div>
                        )}
                        {product.totalSugars !== undefined && product.totalSugars !== null && (
                          <div>
                            <span className="text-muted-foreground">Total Sugars:</span>
                            <span className="ml-2 font-semibold">{product.totalSugars}g</span>
                          </div>
                        )}
                      </div>
                    )}

                    {product.sweeteners && product.sweeteners.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {product.sweeteners.map((s: any, i: number) => (
                          <span
                            key={i}
                            className={`text-xs px-2 py-1 rounded ${
                              s.type === 'natural_alternative'
                                ? 'bg-green-100 text-green-800'
                                : s.type === 'artificial'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = `/scan?upc=${product.upc}`)}
                  >
                    Scan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
