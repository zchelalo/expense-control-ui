import clsx from 'clsx'
import { forwardRef, type HTMLAttributes } from 'react'
import { Text } from '@/components/atoms/text'
import styles from '@/components/molecules/list/list.module.css'

type ListStyle = 'disc' | 'numeric'

interface ListProps extends HTMLAttributes<HTMLUListElement> {
  listStyle: ListStyle
  messages: string[]
  isErrorList?: boolean
}

export const List = forwardRef<HTMLUListElement, ListProps>(
  ({ listStyle = 'disc', messages, className, isErrorList, ...props }, ref) => {
    const classes = clsx(styles[listStyle], className)

    return (
      <ul ref={ref} className={classes} {...props}>
        {messages.map((message) => (
          <li
            key={message}
            className={isErrorList ? styles.fieldError : styles.fieldItem}
          >
            <Text role='alert' variant='span' typographySize='small'>
              {message}
            </Text>
          </li>
        ))}
      </ul>
    )
  },
)
