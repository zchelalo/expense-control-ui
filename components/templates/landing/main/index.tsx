import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Box } from '@/components/atoms/box'
import { FlexBox } from '@/components/atoms/flex-box'
import { Text } from '@/components/atoms/text'
import { Title } from '@/components/atoms/title'
import styles from '@/components/templates/landing/main/main.module.css'
import { Namespace } from '@/constants/common'

export async function Main() {
  const t = await getTranslations(Namespace.Landing)

  return (
    <FlexBox
      variant='main'
      alignItems='center'
      justifyContent='center'
      className={styles.main}
    >
      <Box variant='div' className={styles.mainContainer}>
        {/* LEFT SIDE */}
        <FlexBox
          variant='div'
          direction='column'
          alignItems='center'
          justifyContent='center'
          padding={12}
          className={styles.mainContent}
        >
          <FlexBox
            variant='section'
            alignItems='center'
            justifyContent='center'
            className={styles.imageContainer}
          >
            <Image
              src='/img/features.svg'
              alt={t('main.features_illustration_alt')}
              fill
              priority
            />
          </FlexBox>
        </FlexBox>

        {/* RIGHT SIDE */}
        <FlexBox
          variant='div'
          direction='column'
          alignItems='center'
          justifyContent='center'
          padding={12}
          className={styles.mainContent}
        >
          <FlexBox
            variant='section'
            direction='column'
            alignItems='start'
            justifyContent='center'
            gap={4}
            className={styles.titleContainer}
          >
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
          </FlexBox>
        </FlexBox>
      </Box>
    </FlexBox>
  )
}
