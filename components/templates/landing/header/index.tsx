import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Box } from '@/components/atoms/box'
import { Button } from '@/components/atoms/button'
import { FlexBox } from '@/components/atoms/flex-box'
import { Text } from '@/components/atoms/text'
import { Title } from '@/components/atoms/title'
import styles from '@/components/templates/landing/header/header.module.css'
import { Namespace } from '@/constants/common'
import { Link } from '@/i18n/navigation'
import { getAuthSession } from '@/utils/auth'

export async function Header() {
  const t = await getTranslations(Namespace.Landing)
  const { isAuthenticated } = await getAuthSession()

  return (
    <FlexBox
      variant='header'
      alignItems='center'
      justifyContent='center'
      className={styles.header}
    >
      <Box variant='div' className={styles.headerContainer}>
        {/* LEFT SIDE */}
        <FlexBox
          variant='div'
          direction='column'
          alignItems='center'
          justifyContent='center'
          padding={12}
          className={styles.headerContent}
        >
          <FlexBox
            variant='section'
            direction='column'
            alignItems='start'
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
                {t('header.title')}
              </Title>
              <Text variant='p' typographySize='normal' typographyWeight='bold'>
                {t('header.subtitle')}
              </Text>
            </FlexBox>
            {!isAuthenticated ? (
              <FlexBox
                variant='div'
                alignItems='center'
                justifyContent='center'
                gap={4}
                className={styles.buttonsContainer}
              >
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
              </FlexBox>
            ) : (
              <FlexBox
                variant='div'
                alignItems='center'
                justifyContent='center'
                gap={4}
                className={styles.buttonsContainer}
              >
                <Link href='/accounts'>
                  <Button variant='primary' appearance='filled'>
                    {t('header.accounts_button')}
                  </Button>
                </Link>
              </FlexBox>
            )}
          </FlexBox>
        </FlexBox>

        {/* RIGHT SIDE */}
        <FlexBox
          variant='div'
          direction='column'
          alignItems='center'
          justifyContent='center'
          padding={12}
          className={styles.headerContent}
        >
          <FlexBox
            variant='section'
            alignItems='center'
            justifyContent='center'
            className={styles.imageContainer}
          >
            <Image
              src='/img/chart.svg'
              alt={t('header.chart_illustration_alt')}
              fill
              priority
            />
          </FlexBox>
        </FlexBox>
      </Box>
    </FlexBox>
  )
}
