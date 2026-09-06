export default function Emoji({ symbol, className, ...props }: { symbol: string; className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={['emoji select-none', className].filter(Boolean).join(' ')} {...props}>
      {symbol}
    </span>
  )
}
