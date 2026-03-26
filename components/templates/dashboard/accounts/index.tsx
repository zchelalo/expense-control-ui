import { getTranslations } from 'next-intl/server'
import styles from '@/components/templates/dashboard/accounts/accounts.module.css'
import { Search } from '@/components/templates/dashboard/accounts/search'
import { Namespace } from '@/constants/common'

export async function Accounts() {
  const t = await getTranslations(Namespace.Account)

  return (
    <div className={styles.container}>
      <Search
        translations={{
          searchLabel: t('search.label'),
          searchPlaceholder: t('search.placeholder'),
          searchSubmitButton: t('search.submit_button'),
        }}
      />
    </div>
  )
}
