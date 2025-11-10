'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Calendar } from 'lucide-react'
import Link from 'next/link'

interface Scan {
  id: string
  score: number
  scanType: string
  rationale: string
  createdAt: string
  product: {
    upc: string
    name: string
    brand: string
    totalSugars: number | null
    addedSugars: number | null
  } | null
}

export default function HistoryPage() {
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchScans()
  }, [page])

  const fetchScans = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/scans?page=${page}&limit=10`)
      const data = await response.json()
      setScans(data.scans)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Failed to fetch scans:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-lime-100 text-lime-800'
    if (score >= 40) return 'bg-yellow-100 text-yellow-800'
    if (score >= 20) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  if (loading && scans.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Scan History</h1>
        <p className="text-muted-foreground">View your past product scans</p>
      </div>

      {scans.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Scans Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start scanning products to see your history here
            </p>
            <Link href="/scan">
              <Button>Scan a Product</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {scans.map((scan) => (
              <Card key={scan.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {scan.product ? (
                        <>
                          <h3 className="font-semibold text-lg mb-1">
                            {scan.product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {scan.product.brand}
                          </p>
                        </>
                      ) : (
                        <h3 className="font-semibold text-lg mb-2">
                          Unknown Product
                        </h3>
                      )}
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(scan.createdAt)}
                      </p>
                    </div>
                    <div
                      className={`text-2xl font-bold px-4 py-2 rounded-lg ${getScoreColor(
                        scan.score
                      )}`}
                    >
                      {scan.score}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {scan.rationale}
                  </p>

                  {scan.product && (scan.product.addedSugars !== null || scan.product.totalSugars !== null) && (
                    <div className="flex gap-4 text-sm border-t pt-4">
                      {scan.product.addedSugars !== null && (
                        <div>
                          <span className="text-muted-foreground">Added Sugars:</span>
                          <span className="ml-2 font-semibold">
                            {scan.product.addedSugars}g
                          </span>
                        </div>
                      )}
                      {scan.product.totalSugars !== null && (
                        <div>
                          <span className="text-muted-foreground">Total Sugars:</span>
                          <span className="ml-2 font-semibold">
                            {scan.product.totalSugars}g
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
