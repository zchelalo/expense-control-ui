'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import styles from '@/components/templates/main-layout/main-layout.module.css'
import { Namespace } from '@/constants'
import { Link } from '@/i18n/navigation'

export function Header() {
  const t = useTranslations(Namespace.Common)

  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header className={styles.header}>
      <ul className={scrolled ? styles.scrolled : ''}>
        <li>
          <Link
            href='/movements'
            className={`${styles.link} ${scrolled ? styles.scrolled : ''}`}
          >
            {t('header.movements')}
          </Link>
        </li>
        <li>
          <Link
            href='/income'
            className={`${styles.link} ${scrolled ? styles.scrolled : ''}`}
          >
            {t('header.incomes')}
          </Link>
        </li>
        <li>
          <Link
            href='/expenses'
            className={`${styles.link} ${scrolled ? styles.scrolled : ''}`}
          >
            {t('header.expenses')}
          </Link>
        </li>
      </ul>
    </header>
  )
}
