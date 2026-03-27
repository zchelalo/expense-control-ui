import clsx from 'clsx'
import { forwardRef, type HTMLAttributes } from 'react'
import styles from '@/components/atoms/box/box.module.css'

export interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'div'
    | 'section'
    | 'article'
    | 'header'
    | 'footer'
    | 'main'
    | 'aside'
}

export const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ variant: Tag = 'div', className, ...props }, ref) => {
    const boxClassnames = clsx(styles.box, className)
    return <Tag ref={ref} className={boxClassnames} {...props} />
  },
)
