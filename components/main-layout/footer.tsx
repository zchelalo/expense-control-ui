'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/button'
import styles from '@/components/main-layout/main-layout.module.css'
import { Theme } from '@/constants'

export function Footer() {
  const { theme, setTheme } = useTheme()

  return (
    <div className={styles.footer}>
      <Button
        type='button'
        variant='primary'
        appearance='filled'
        onClick={() =>
          setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT)
        }
      >
        {theme === Theme.LIGHT ? <Moon size={16} /> : <Sun size={16} />}
      </Button>
    </div>
  )
}
