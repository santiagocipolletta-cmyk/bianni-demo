import { PublicMobileBar } from '@/components/public/PublicMobileBar'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="pb-16 md:pb-0">{children}</div>
      <PublicMobileBar />
    </>
  )
}
