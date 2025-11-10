'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Barcode, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function ScanPage() {
  const [scanning, setScanning] = useState(false)
  const [upc, setUpc] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpcScan = async () => {
    if (!upc || upc.length < 8) {
      setError('Please enter a valid UPC code (at least 8 digits)')
      return
    }

    setScanning(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upc }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Scan failed')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan product')
    } finally {
      setScanning(false)
    }
  }

  const handlePhotoScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setScanning(true)
    setError(null)
    setResult(null)

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result?.toString().split(',')[1]
        if (!base64) throw new Error('Failed to read image')

        const response = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo: base64 }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Scan failed')
        }

        const data = await response.json()
        setResult(data)
      }

      reader.readAsDataURL(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan nutrition label')
    } finally {
      setScanning(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-lime-600'
    if (score >= 40) return 'text-yellow-600'
    if (score >= 20) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    if (score >= 20) return 'Poor'
    return 'Very Poor'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Scan a Product</h1>
        <p className="text-muted-foreground">
          Enter a UPC barcode or upload a photo of a nutrition label
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* UPC Scan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Barcode className="h-5 w-5" />
              Scan Barcode
            </CardTitle>
            <CardDescription>
              Enter the UPC code from the product
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Enter UPC (e.g., 012000161551)"
              value={upc}
              onChange={(e) => setUpc(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUpcScan()}
              className="w-full px-4 py-2 border rounded-md"
              disabled={scanning}
            />
            <Button
              onClick={handleUpcScan}
              disabled={scanning || !upc}
              className="w-full"
            >
              {scanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                'Scan UPC'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Photo Scan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scan Label
            </CardTitle>
            <CardDescription>
              Upload a photo of the nutrition label
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoScan}
              className="hidden"
              disabled={scanning}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={scanning}
              variant="outline"
              className="w-full"
            >
              {scanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Photo
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Scan Failed</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Scan Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score */}
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.score)}`}>
                {result.score}
              </div>
              <div className="text-lg text-muted-foreground">
                {getScoreLabel(result.score)}
              </div>
            </div>

            {/* Product Info */}
            {result.product && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">{result.product.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{result.product.brand}</p>
                {result.product.addedSugars !== undefined && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Added Sugars:</span>
                      <span className="ml-2 font-semibold">{result.product.addedSugars}g</span>
                    </div>
                    {result.product.totalSugars !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Total Sugars:</span>
                        <span className="ml-2 font-semibold">{result.product.totalSugars}g</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Rationale */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Analysis</h4>
              <p className="text-sm text-muted-foreground">{result.rationale}</p>
            </div>

            {/* Sweeteners */}
            {result.sweeteners && result.sweeteners.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Sweeteners Detected</h4>
                <div className="space-y-2">
                  {result.sweeteners.map((sweetener: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div>
                        <div className="font-medium">{sweetener.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Position #{sweetener.position} • Health Score: {sweetener.healthScore}/100
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          sweetener.type === 'natural_alternative'
                            ? 'bg-green-100 text-green-800'
                            : sweetener.type === 'artificial'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {sweetener.type.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => {
                  setResult(null)
                  setUpc('')
                  setError(null)
                }}
                variant="outline"
                className="flex-1"
              >
                Scan Another
              </Button>
              <Link href="/history" className="flex-1">
                <Button className="w-full">View History</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
