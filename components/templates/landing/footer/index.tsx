import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Text } from '@/components/atoms/text'
import { Title } from '@/components/atoms/title'
import styles from '@/components/templates/landing/footer/footer.module.css'
import { Namespace } from '@/constants/common'

export async function Footer() {
  const t = await getTranslations(Namespace.Landing)

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* LEFT SIDE */}
        <div className={styles.footerContent}>
          <section className={styles.titleContainer}>
            <div className={styles.textContainer}>
              <Title
                variant='h1'
                typographySize='extraLarge4'
                typographyWeight='bold'
              >
                {t('footer.title')}
              </Title>
              <Text variant='p' typographySize='normal' typographyWeight='bold'>
                {t('footer.subtitle')}
              </Text>
            </div>
          </section>
        </div>

        {/* RIGHT SIDE */}
        <div className={styles.footerContent}>
          <section className={styles.imageContainer}>
            <Image
              src='/img/devices.svg'
              alt={t('footer.devices_illustration_alt')}
              fill
              priority
            />
          </section>
        </div>
      </div>
    </footer>
  )
}
