import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Text } from '@/components/atoms/text'
import { Title } from '@/components/atoms/title'
import styles from '@/components/templates/landing/main/main.module.css'
import { Namespace } from '@/constants/common'

export async function Main() {
  const t = await getTranslations(Namespace.Landing)

  return (
    <main className={styles.main}>
      <div className={styles.mainContent}>
        <section className={styles.imageContainer}>
          <Image
            src='/img/features.svg'
            alt={t('main.features_illustration_alt')}
            fill
            priority
          />
        </section>
      </div>
      <div className={styles.mainContent}>
        <section className={styles.titleContainer}>
          <Title
            variant='h2'
            typographySize='extraLarge4'
            typographyWeight='bold'
          >
            {t('main.features_title')}
          </Title>
          <ul>
            <li>
              <Title
                variant='h3'
                typographySize='extraLarge'
                typographyWeight='medium'
              >
                {t('main.feature_1_title')}
              </Title>
              <Text variant='p' typographySize='normal'>
                {t('main.feature_1_description')}
              </Text>
            </li>
            <li>
              <Title
                variant='h3'
                typographySize='extraLarge'
                typographyWeight='medium'
              >
                {t('main.feature_2_title')}
              </Title>
              <Text variant='p' typographySize='normal'>
                {t('main.feature_2_description')}
              </Text>
            </li>
            <li>
              <Title
                variant='h3'
                typographySize='extraLarge'
                typographyWeight='medium'
              >
                {t('main.feature_3_title')}
              </Title>
              <Text variant='p' typographySize='normal'>
                {t('main.feature_3_description')}
              </Text>
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}
