import clsx from 'clsx'
import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react'

import styles from '@/components/atoms/button/button.module.css'

type Variant =
  | 'primary'
  | 'secondary'
  | 'default'
  | 'danger'
  | 'success'
  | 'warning'
type Appearance = 'filled' | 'outlined'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  appearance?: Appearance
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      appearance = 'filled',
      type = 'button',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const variantClasses: Record<Variant, string> = {
      primary: styles['variant-primary'],
      secondary: styles['variant-secondary'],
      default: styles['variant-default'],
      danger: styles['variant-danger'],
      success: styles['variant-success'],
      warning: styles['variant-warning'],
    }

    const appearanceClasses: Record<Appearance, string> = {
      filled: styles['appearance-filled'],
      outlined: styles['appearance-outlined'],
    }

    const classes = clsx(
      styles.btn,
      variantClasses[variant],
      appearanceClasses[appearance],
      className,
    )

    return (
      <button ref={ref} className={classes} type={type} {...props}>
        {children}
      </button>
    )
  },
)
