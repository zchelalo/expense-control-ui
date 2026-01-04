'use client'

import { useEffect, useState } from 'react'

import styles from '@/components/templates/main-layout/main-layout.module.css'

export function Header() {
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
        <li>Expense Control</li>
      </ul>
    </header>
  )
}
