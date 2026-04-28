import { List } from '@/components/molecules/list'
import styles from '@/components/templates/dashboard/movements/movements.module.css'

type FormFieldErrorsProps = {
  messages?: string[] | null
}

export function FormFieldErrors({ messages }: FormFieldErrorsProps) {
  if (!messages || messages.length === 0) return null

  return (
    <List
      listStyle='disc'
      messages={messages}
      className={styles.listError}
      isErrorList
    />
  )
}
