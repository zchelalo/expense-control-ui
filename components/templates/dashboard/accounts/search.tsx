'use client'

import { SearchIcon } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/components/atoms/button'
import { InputText } from '@/components/atoms/input-text'
import { Label } from '@/components/atoms/label'
import styles from '@/components/templates/dashboard/accounts/accounts.module.css'
import { normalizeAccountSearch } from '@/modules/account/adapters/in/query-params'

type SearchProps = {
  translations: Record<string, string>
  search?: string | null
  limit?: string
}

export function Search({ translations, search, limit = '10' }: SearchProps) {
  const searchId = useId()

  return (
    <form className={styles.form} method='GET'>
      <input type='hidden' name='limit' value={limit} />
      <div className={styles.formGroup}>
        <Label htmlFor={searchId}>{translations.searchLabel}</Label>
        <InputText
          id={searchId}
          name='search'
          placeholder={translations.searchPlaceholder}
          defaultValue={normalizeAccountSearch(search)}
        />
      </div>
      <div className={styles.formGroup}>
        <Button type='submit' className={styles.searchButton}>
          <SearchIcon size={18} />
        </Button>
      </div>
    </form>
  )
}
