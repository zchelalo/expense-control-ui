'use client'

import { useActionState, useEffect, useId } from 'react'
import { Button } from '@/components/atoms/button'
import { InputText } from '@/components/atoms/input-text'
import { Label } from '@/components/atoms/label'
import styles from '@/components/templates/dashboard/accounts/accounts.module.css'
import {
  type SearchFormState,
  searchAction,
} from '@/modules/account/adapters/in/search-action'
import { toast } from '@/utils/toast'

type SearchProps = {
  translations: Record<string, string>
}

const initialState: SearchFormState = {
  globalError: null,
  values: { search: '' },
  data: null,
}

export function Search({ translations }: SearchProps) {
  // const [state, formAction, pending] = useActionState<
  //   SearchFormState,
  //   FormData
  // >(searchAction, initialState)

  // useEffect(() => {
  //   if (state.globalError) {
  //     toast.error(state.globalError.message)
  //   }
  // }, [state.globalError])

  const searchId = useId()

  // return (
  //   <form className={styles.form} action={formAction}>
  //     <div className={styles.formGroup}>
  //       <Label htmlFor={searchId}>{translations.searchLabel}</Label>
  //       <InputText
  //         id={searchId}
  //         name='search'
  //         placeholder={translations.searchPlaceholder}
  //         defaultValue={state.values.search}
  //       />
  //     </div>
  //     <div className={styles.formGroup}>
  //       <Button type='submit' disabled={pending}>
  //         {translations.searchSubmitButton}
  //       </Button>
  //     </div>
  //   </form>
  // )

  return <div>Search Component</div>
}
