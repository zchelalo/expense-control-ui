import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/atoms/button'
import { Text } from '@/components/atoms/text'
import { Title } from '@/components/atoms/title'
import styles from '@/components/templates/landing/header/header.module.css'
import { Namespace } from '@/constants/common'
import { Link } from '@/i18n/navigation'

export async function Header() {
  const t = await getTranslations(Namespace.Landing)

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        {/* LEFT SIDE */}
        <div className={styles.headerContent}>
          <section className={styles.titleContainer}>
            <div className={styles.textContainer}>
              <Title
                variant='h1'
                typographySize='extraLarge4'
                typographyWeight='bold'
              >
                {t('header.title')}
              </Title>
              <Text variant='p' typographySize='normal' typographyWeight='bold'>
                {t('header.subtitle')}
              </Text>
            </div>
            <div className={styles.buttonsContainer}>
              <Link href='/login'>
                <Button variant='primary' appearance='filled'>
                  {t('header.login_button')}
                </Button>
              </Link>
              <Link href='/sign-up'>
                <Button variant='primary' appearance='filled'>
                  {t('header.signup_button')}
                </Button>
              </Link>
            </div>
          </section>
        </div>

        {/* RIGHT SIDE */}
        <div className={styles.headerContent}>
          <section className={styles.imageContainer}>
            <Image
              src='/img/chart.svg'
              alt={t('header.chart_illustration_alt')}
              fill
              priority
            />
          </section>
        </div>
      </div>
    </header>
  )
}
