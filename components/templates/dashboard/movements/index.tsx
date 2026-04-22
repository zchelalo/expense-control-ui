import { FlexBox } from '@/components/atoms/flex-box'
import styles from '@/components/templates/dashboard/movements/movements.module.css'

export async function Movements() {
  // const locale = await getLocale()
  // const t = await getTranslations(Namespace.Movement)

  return (
    <FlexBox
      variant='div'
      direction='column'
      alignItems='start'
      justifyContent='center'
      gap={6}
      className={styles.container}
    >
      <p>test</p>
    </FlexBox>
  )
}
