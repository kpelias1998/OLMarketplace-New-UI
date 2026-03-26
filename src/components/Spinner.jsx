export default function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'h-5 w-5 border-2' : size === 'lg' ? 'h-12 w-12 border-4' : 'h-8 w-8 border-3'
  return (
    <div className={`${s} rounded-full border-primary border-t-transparent animate-spin`} />
  )
}
