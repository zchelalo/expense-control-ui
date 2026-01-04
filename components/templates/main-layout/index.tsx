import type { ReactNode } from 'react'
import { Footer } from '@/components/templates/main-layout/footer'
import { Header } from '@/components/templates/main-layout/header'
import styles from '@/components/templates/main-layout/main-layout.module.css'

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
