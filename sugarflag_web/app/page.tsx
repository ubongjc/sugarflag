import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Camera, History, ShoppingCart, Search } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
      <div className="z-10 max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            🍭 SugarFlag
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Instant added-sugar and sweetener analysis
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Know your sugar, choose better. Get instant scores with plain-English explanations
            and personalized lower-sugar alternatives.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/scan">
              <Button size="lg" className="gap-2">
                <Camera className="h-5 w-5" />
                Start Scanning
              </Button>
            </Link>
            <Link href="/cart">
              <Button size="lg" variant="outline" className="gap-2">
                <ShoppingCart className="h-5 w-5" />
                Weekly Cart
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/scan" className="group">
            <div className="p-6 border rounded-lg hover:border-primary transition-colors h-full">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                Scan
              </h3>
              <p className="text-sm text-muted-foreground">
                Snap a photo of any nutrition label or enter a UPC barcode
              </p>
            </div>
          </Link>

          <Link href="/scan" className="group">
            <div className="p-6 border rounded-lg hover:border-primary transition-colors h-full">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                Analyze
              </h3>
              <p className="text-sm text-muted-foreground">
                Get instant sweetener breakdown with plain-English explanations
              </p>
            </div>
          </Link>

          <Link href="/cart" className="group">
            <div className="p-6 border rounded-lg hover:border-primary transition-colors h-full">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                Swap
              </h3>
              <p className="text-sm text-muted-foreground">
                Discover lower-sugar alternatives tailored to your taste
              </p>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/history">
            <Button variant="outline" className="w-full gap-2">
              <History className="h-4 w-4" />
              View Scan History
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" className="w-full gap-2">
              <Search className="h-4 w-4" />
              Search Products
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
