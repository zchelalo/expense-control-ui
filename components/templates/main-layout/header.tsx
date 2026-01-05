'use client'

import { ArrowLeftRight, TrendingDown, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import styles from '@/components/templates/main-layout/main-layout.module.css'
import { Namespace } from '@/constants'
import { Link, usePathname } from '@/i18n/navigation'

export function Header() {
  const t = useTranslations(Namespace.Common)
  const pathname = usePathname()

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

  const getLinkClasses = (href: string) => {
    const isActive = pathname === href
    return `
      ${styles.link}
      ${scrolled ? styles.scrolled : ''}
      ${isActive ? styles.active : ''}
    `
  }

  return (
    <header className={styles.header}>
      <ul className={scrolled ? styles.scrolled : ''}>
        <li>
          <Link href='/movements' className={getLinkClasses('/movements')}>
            <ArrowLeftRight size={16} />
            <span>{t('header.movements')}</span>
          </Link>
        </li>
        <li>
          <Link href='/incomes' className={getLinkClasses('/incomes')}>
            <TrendingUp size={16} />
            <span>{t('header.incomes')}</span>
          </Link>
        </li>
        <li>
          <Link href='/expenses' className={getLinkClasses('/expenses')}>
            <TrendingDown size={16} />
            <span>{t('header.expenses')}</span>
          </Link>
        </li>
      </ul>
    </header>
  )
}
