import { FlexBox } from '@/components/atoms/flex-box'
import { Footer } from '@/components/templates/landing/footer'
import { Header } from '@/components/templates/landing/header'
import styles from '@/components/templates/landing/landing.module.css'
import { Main } from '@/components/templates/landing/main'

export async function Landing() {
  return (
    <FlexBox
      direction='column'
      alignItems='center'
      justifyContent='start'
      gap={12}
      className={styles.container}
    >
      <Header />
      <Main />
      <Footer />
    </FlexBox>
  )
}
