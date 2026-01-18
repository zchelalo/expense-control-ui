import clsx from 'clsx'
import { forwardRef, type HTMLAttributes } from 'react'

import styles from '@/components/atoms/title/title.module.css'
import { TYPOGRAPHY_CLASSNAMES, TypographyTypes } from '@/constants/typography'
import type { TypographyProps } from '@/types/typography'

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

interface TitleProps
  extends HTMLAttributes<HTMLHeadingElement>,
    TypographyProps {
  variant?: Variant
}

export const Title = forwardRef<HTMLHeadingElement, TitleProps>(
  (
    {
      variant = 'h1',
      typographyWeight = 'normal',
      typographyTextStyle = 'normal',
      typographySize = 'normal',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = clsx(
      styles.title,
      styles[TYPOGRAPHY_CLASSNAMES[TypographyTypes.Weight][typographyWeight]],
      styles[TYPOGRAPHY_CLASSNAMES[TypographyTypes.Size][typographySize]],
      styles[
        TYPOGRAPHY_CLASSNAMES[TypographyTypes.TextStyle][typographyTextStyle]
      ],
      className,
    )

    const Tag = variant as Variant
    return (
      <Tag ref={ref} className={classes} {...props}>
        {children}
      </Tag>
    )
  },
)
