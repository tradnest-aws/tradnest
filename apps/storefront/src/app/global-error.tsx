"use client"
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="he-IL" dir="rtl">
      <body>
        <div data-testid="global-error">
          <h2>משהו השתבש</h2>
          <button onClick={() => reset()} data-testid="global-error-retry-button">
            נסו שוב
          </button>
        </div>
      </body>
    </html>
  )
}
