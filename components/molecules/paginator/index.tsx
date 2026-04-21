import clsx from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { forwardRef, type HTMLAttributes } from 'react'
import { Button } from '@/components/atoms/button'
import { FlexBox } from '@/components/atoms/flex-box'
import styles from '@/components/molecules/paginator/paginator.module.css'
import { Link } from '@/i18n/navigation'

interface PaginatorProps extends HTMLAttributes<HTMLDivElement> {
  previousHref: string | null
  nextHref: string | null
}

export const Paginator = forwardRef<HTMLDivElement, PaginatorProps>(
  ({ previousHref, nextHref, className, ...props }: PaginatorProps, ref) => {
    const paginatorClasses = clsx(styles.paginator, className)

    return (
      <FlexBox
        ref={ref}
        variant='div'
        alignItems='center'
        justifyContent='end'
        gap={2}
        className={paginatorClasses}
        {...props}
      >
        {previousHref ? (
          <Link href={previousHref}>
            <Button type='button' className={styles['paginator-button']}>
              <ChevronLeft size={18} />
            </Button>
          </Link>
        ) : (
          <Button
            type='button'
            appearance='outlined'
            disabled
            className={
              styles['paginator-button'] +
              ' ' +
              styles['paginator-button-disabled']
            }
          >
            <ChevronLeft size={18} />
          </Button>
        )}
        {nextHref ? (
          <Link href={nextHref}>
            <Button type='button' className={styles['paginator-button']}>
              <ChevronRight size={18} />
            </Button>
          </Link>
        ) : (
          <Button
            type='button'
            appearance='outlined'
            disabled
            className={
              styles['paginator-button'] +
              ' ' +
              styles['paginator-button-disabled']
            }
          >
            <ChevronRight size={18} />
          </Button>
        )}
      </FlexBox>
    )
  },
)
