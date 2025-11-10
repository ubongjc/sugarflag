'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ShoppingCart, TrendingDown, DollarSign } from 'lucide-react'

interface CartItem {
  productId: string
  upc: string
  name: string
  brand: string
  quantity: number
  price?: number
  reason: string
  sugarSavings?: number
}

export default function CartPage() {
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/cart/suggest')
      const data = await response.json()
      setCart(data)
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Cart Suggestions Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start scanning products to get personalized lower-sugar alternatives
            </p>
            <Button onClick={() => (window.location.href = '/scan')}>
              Scan Products
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Weekly Cart</h1>
        <p className="text-muted-foreground">
          Your personalized lower-sugar alternatives for this week
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sugar Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  {cart.estSavings?.toFixed(0) || 0}g
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">
                  ${cart.totalCost?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="text-2xl font-bold">{cart.items.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart Items */}
      <div className="space-y-4">
        {cart.items.map((item: CartItem, index: number) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.brand}</p>
                  <p className="text-sm text-muted-foreground mb-3">{item.reason}</p>
                </div>
                <div className="text-right ml-4">
                  {item.price && (
                    <p className="text-lg font-semibold">${item.price.toFixed(2)}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>

              {item.sugarSavings && item.sugarSavings > 0 && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
                  <TrendingDown className="h-4 w-4" />
                  <span>Saves {item.sugarSavings}g sugar per week</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <Button onClick={fetchCart} variant="outline" className="flex-1">
          Refresh Suggestions
        </Button>
        <Button className="flex-1" onClick={() => alert('Export feature coming soon!')}>
          Export Shopping List
        </Button>
      </div>
    </div>
  )
}
