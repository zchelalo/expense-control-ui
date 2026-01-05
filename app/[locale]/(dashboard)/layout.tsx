import { MainLayout } from '@/components/templates/main-layout'

type DashboardLayoutProps = {
  readonly children: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return <MainLayout>{children}</MainLayout>
}
