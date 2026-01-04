import type { ReactNode } from 'react'
import styles from '@/components/main-layout/main-layout.module.css'
import { Footer } from '@/components/templates/main-layout/footer'
import { Header } from '@/components/templates/main-layout/header'

type MainLayoutProps = {
  readonly children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  )
}
