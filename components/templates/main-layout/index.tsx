import type { ReactNode } from 'react'
import { FlexBox } from '@/components/atoms/flex-box'
import { Footer } from '@/components/templates/main-layout/footer'
import { Header } from '@/components/templates/main-layout/header'
import styles from '@/components/templates/main-layout/main-layout.module.css'

type MainLayoutProps = {
  readonly children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <FlexBox
      variant='div'
      direction='column'
      alignItems='stretch'
      className={styles.container}
    >
      <Header />
      <FlexBox variant='main' padding={16} className={styles.main}>
        {children}
      </FlexBox>
      <Footer />
    </FlexBox>
  )
}
