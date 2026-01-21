'use client'

import { Eye, EyeClosed } from 'lucide-react'
import { useState } from 'react'
import styles from '@/components/atoms/input-text/input-text.module.css'

export function InputPasswordToggle({ inputId }: { inputId: string }) {
  const [show, setShow] = useState(false)

  const toggle = () => {
    const el = document.getElementById(inputId) as HTMLInputElement | null
    if (!el) return

    const next = !show
    el.type = next ? 'text' : 'password'
    setShow(next)
  }

  return (
    <button
      type='button'
      className={styles.iconButton}
      onClick={toggle}
      aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {show ? (
        <Eye className={styles.icon} />
      ) : (
        <EyeClosed className={styles.icon} />
      )}
    </button>
  )
}
