import { getTranslations } from 'next-intl/server'
import { Title } from '@/components/atoms/title'
import styles from '@/components/templates/landing/landing.module.css'
import { Namespace } from '@/constants/common'

export async function Landing() {
  const t = await getTranslations(Namespace.Landing)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <section className={styles.titleContainer}>
          <Title variant='h1' typographyWeight='bold' typographySize='large'>
            {t('title')}
          </Title>
        </section>
        <section></section>
      </header>
    </div>
  )
}
