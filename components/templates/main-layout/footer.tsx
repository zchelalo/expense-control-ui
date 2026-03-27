'use client'

import { ArrowLeftFromLine, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/atoms/button'
import { FlexBox } from '@/components/atoms/flex-box'
import { useAuth } from '@/components/infrastructure/providers/auth-provider'
import styles from '@/components/templates/main-layout/main-layout.module.css'
import { Theme } from '@/constants/common'
import { logoutAction } from '@/modules/auth/adapters/in/logout-action'

export function Footer() {
  const { theme, setTheme } = useTheme()
  const { isAuthenticated } = useAuth()

  return (
    <FlexBox
      variant='footer'
      alignItems='center'
      justifyContent='end'
      gap={1}
      className={styles.footer}
    >
      {isAuthenticated && (
        <Button
          type='button'
          variant='primary'
          appearance='filled'
          onClick={logoutAction}
        >
          <ArrowLeftFromLine size={16} />
        </Button>
      )}
      <Button
        type='button'
        variant='primary'
        appearance='filled'
        onClick={() =>
          setTheme(theme === Theme.Light ? Theme.Dark : Theme.Light)
        }
      >
        {theme === Theme.Light ? <Moon size={16} /> : <Sun size={16} />}
      </Button>
    </FlexBox>
  )
}
