export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          🍭 SugarFlag
        </h1>
        <p className="text-xl text-center text-muted-foreground mb-8">
          Instant added-sugar and sweetener analysis
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-6 border rounded-lg">
            <h3 className="font-bold mb-2">📸 Scan</h3>
            <p className="text-sm text-muted-foreground">
              Snap a photo of any nutrition label or menu
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-bold mb-2">🎯 Analyze</h3>
            <p className="text-sm text-muted-foreground">
              Get instant sweetener breakdown with plain-English labels
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-bold mb-2">🛒 Swap</h3>
            <p className="text-sm text-muted-foreground">
              Discover lower-sugar alternatives tailored to your taste
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
