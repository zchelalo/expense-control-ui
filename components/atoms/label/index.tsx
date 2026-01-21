import clsx from 'clsx'
import { forwardRef, type LabelHTMLAttributes, type ReactNode } from 'react'
import styles from '@/components/atoms/label/label.module.css'
import { TYPOGRAPHY_CLASSNAMES, TypographyTypes } from '@/constants/typography'
import type { TypographyProps } from '@/types/typography'
import '@/app/typography.css'

interface LabelProps
  extends LabelHTMLAttributes<HTMLLabelElement>,
    TypographyProps {
  htmlFor: string
  children: ReactNode
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      htmlFor,
      typographyTextStyle = 'normal',
      typographyWeight = 'normal',
      typographySize = 'normal',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = clsx(
      styles.label,
      TYPOGRAPHY_CLASSNAMES[TypographyTypes.Weight][typographyWeight],
      TYPOGRAPHY_CLASSNAMES[TypographyTypes.Size][typographySize],
      TYPOGRAPHY_CLASSNAMES[TypographyTypes.TextStyle][typographyTextStyle],
      className,
    )

    return (
      <label ref={ref} htmlFor={htmlFor} className={classes} {...props}>
        {children}
      </label>
    )
  },
)
