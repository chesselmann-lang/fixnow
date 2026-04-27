import MarketingNav from '@/components/MarketingNav'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingNav />
      <div className="pt-14">{children}</div>
    </>
  )
}
