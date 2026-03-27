import clsx from 'clsx'
import { forwardRef } from 'react'
import { Box, type BoxProps } from '@/components/atoms/box'
import styles from '@/components/atoms/flexbox/flex-box.module.css'

interface FlexBoxProps extends BoxProps {
  direction?: 'row' | 'column'
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justifyContent?:
    | 'start'
    | 'center'
    | 'end'
    | 'spaceBetween'
    | 'spaceAround'
    | 'spaceEvenly'
  gap?: 0 | 1 | 2 | 3 | 4 | 8 | 8 | 10 | 12 | 16
  padding?: 0 | 1 | 2 | 3 | 4 | 8 | 8 | 10 | 12 | 16
  margin?: 0 | 1 | 2 | 3 | 4 | 8 | 8 | 10 | 12 | 16
}

export const FlexBox = forwardRef<HTMLDivElement, FlexBoxProps>(
  (
    {
      variant = 'div',
      direction,
      alignItems,
      justifyContent,
      gap,
      padding,
      margin,
      className,
      ...props
    },
    ref,
  ) => {
    const flexBoxClassnames = clsx(
      styles.flexBox,
      styles[`flexDirection-${direction ?? 'row'}`],
      styles[`alignItems-${alignItems ?? 'start'}`],
      styles[`justifyContent-${justifyContent ?? 'start'}`],
      gap && styles[`gap-${gap}`],
      padding && styles[`padding-${padding}`],
      margin && styles[`margin-${margin}`],
      className,
    )
    return (
      <Box
        ref={ref}
        variant={variant}
        className={flexBoxClassnames}
        {...props}
      />
    )
  },
)
