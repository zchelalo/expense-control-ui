import clsx from 'clsx'
import { forwardRef, type HTMLAttributes } from 'react'
import styles from '@/components/atoms/text/text.module.css'
import { TYPOGRAPHY_CLASSNAMES, TypographyTypes } from '@/constants/typography'
import type { TypographyProps } from '@/types/typography'

type Variant = 'p' | 'span'

interface TextProps<T extends Variant = 'p'>
  extends HTMLAttributes<
      T extends 'p' ? HTMLParagraphElement : HTMLSpanElement
    >,
    TypographyProps {
  variant?: Variant
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  (
    {
      variant = 'p',
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
      styles.text,
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
