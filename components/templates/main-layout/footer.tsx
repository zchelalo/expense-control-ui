'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/atoms/button'
import styles from '@/components/templates/main-layout/main-layout.module.css'
import { Theme } from '@/constants/common'

export function Footer() {
  const { theme, setTheme } = useTheme()

  return (
    <div className={styles.footer}>
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
    </div>
  )
}
