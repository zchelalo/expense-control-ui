import clsx from 'clsx'
import { forwardRef, type HTMLAttributes } from 'react'
import { FlexBox } from '@/components/atoms/flex-box'
import styles from '@/components/molecules/badge/badge.module.css'

type Variant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant
  icon?: React.ReactNode
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ icon, variant, className, children, ...props }: BadgeProps, ref) => {
    const variantClasses: Record<Variant, string> = {
      default: styles['variant-default'],
      primary: styles['variant-primary'],
      secondary: styles['variant-secondary'],
      success: styles['variant-success'],
      error: styles['variant-error'],
      warning: styles['variant-warning'],
    }

    const badgeClasses = clsx(
      styles.badge,
      variant && variantClasses[variant],
      className,
    )

    return (
      <FlexBox
        direction='row'
        justifyContent='center'
        alignItems='center'
        gap={icon ? 2 : 0}
        padding={1}
        ref={ref}
        className={badgeClasses}
        {...props}
      >
        {children}
        {icon && icon}
      </FlexBox>
    )
  },
)
