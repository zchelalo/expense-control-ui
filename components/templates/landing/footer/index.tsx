import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Box } from '@/components/atoms/box'
import { FlexBox } from '@/components/atoms/flex-box'
import { Text } from '@/components/atoms/text'
import { Title } from '@/components/atoms/title'
import styles from '@/components/templates/landing/footer/footer.module.css'
import { Namespace } from '@/constants/common'

export async function Footer() {
  const t = await getTranslations(Namespace.Landing)

  return (
    <FlexBox
      variant='footer'
      alignItems='center'
      justifyContent='center'
      className={styles.footer}
    >
      <Box variant='div' className={styles.footerContainer}>
        {/* LEFT SIDE */}
        <FlexBox
          variant='div'
          direction='column'
          alignItems='center'
          justifyContent='center'
          padding={12}
          className={styles.footerContent}
        >
          <FlexBox
            variant='section'
            direction='column'
            alignItems='stretch'
            justifyContent='center'
            gap={2}
            className={styles.titleContainer}
          >
            <FlexBox
              variant='div'
              direction='column'
              alignItems='start'
              justifyContent='center'
              className={styles.textContainer}
            >
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
            </FlexBox>
          </FlexBox>
        </FlexBox>

        {/* RIGHT SIDE */}
        <FlexBox
          variant='div'
          direction='column'
          alignItems='center'
          justifyContent='center'
          padding={12}
          className={styles.footerContent}
        >
          <FlexBox
            variant='div'
            alignItems='center'
            justifyContent='center'
            className={styles.imageContainer}
          >
            <Image
              src='/img/devices.svg'
              alt={t('footer.devices_illustration_alt')}
              fill
              priority
            />
          </FlexBox>
        </FlexBox>
      </Box>
    </FlexBox>
  )
}
