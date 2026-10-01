export function LottiePlaceholder({ name }: { name: string }) {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-success/15 text-success" aria-label={`Animación ${name}`}>
      <span className="h-3 w-3 rounded-full border-2 border-success border-t-transparent animate-spin" />
    </span>
  )
}