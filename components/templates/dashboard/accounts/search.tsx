'use client'

import { SearchIcon } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/components/atoms/button'
import { FlexBox } from '@/components/atoms/flex-box'
import { InputText } from '@/components/atoms/input-text'
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
      <FlexBox
        direction='column'
        alignItems='stretch'
        gap={2}
        className={styles.formGroup}
      >
        <InputText
          id={searchId}
          name='search'
          placeholder={translations.searchPlaceholder}
          defaultValue={normalizeAccountSearch(search)}
        />
      </FlexBox>
      <FlexBox
        direction='column'
        alignItems='stretch'
        gap={2}
        className={styles.formGroup}
      >
        <Button type='submit' className={styles.searchButton}>
          <SearchIcon size={18} />
        </Button>
      </FlexBox>
    </form>
  )
}
