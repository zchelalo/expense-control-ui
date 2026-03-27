import clsx from 'clsx'
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { FlexBox } from '@/components/atoms/flex-box'
import styles from '@/components/molecules/Card/Card.module.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode
  footer?: ReactNode
  clickable?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      header,
      footer,
      clickable = false,
      className,
      children,
      ...props
    }: CardProps,
    ref,
  ) => {
    const cardClasses = clsx(
      styles.card,
      clickable && styles.clickable,
      className,
    )

    return (
      <FlexBox
        direction='column'
        justifyContent='center'
        alignItems='start'
        ref={ref}
        className={cardClasses}
        {...props}
      >
        {header && (
          <FlexBox
            direction='row'
            justifyContent='start'
            alignItems='center'
            className={styles.header}
          >
            {header}
          </FlexBox>
        )}
        <FlexBox
          direction='row'
          justifyContent='start'
          alignItems='center'
          className={styles.body}
        >
          {children}
        </FlexBox>
        {footer && (
          <FlexBox
            direction='row'
            justifyContent='start'
            alignItems='center'
            className={styles.footer}
          >
            {footer}
          </FlexBox>
        )}
      </FlexBox>
    )
  },
)
