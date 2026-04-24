'use client'

import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'

type LocalDateTimeProps = {
  readonly value: string
}

export function LocalDateTime({ value }: LocalDateTimeProps) {
  const locale = useLocale()
  const [formattedValue, setFormattedValue] = useState(value)

  useEffect(() => {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      setFormattedValue(value)
      return
    }

    setFormattedValue(
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date),
    )
  }, [locale, value])

  return <time dateTime={value}>{formattedValue}</time>
}
