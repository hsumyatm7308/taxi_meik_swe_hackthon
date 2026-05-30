import { AIDriverSearchInterface } from './AIDriverSearchInterface'

export function OwnerAIMatchmakerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Matchmaker</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Search your applicants with AI-powered ranking.
        </p>
      </div>

      <AIDriverSearchInterface />
    </div>
  )
}
