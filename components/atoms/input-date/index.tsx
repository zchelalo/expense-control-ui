'use client'

import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale } from 'next-intl'
import {
  type InputHTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import styles from '@/components/atoms/input-date/input-date.module.css'
import { InputText } from '@/components/atoms/input-text'
import { Language } from '@/constants/common'

type DatePart = 'day' | 'month' | 'year'

interface InputDateProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'defaultValue' | 'inputMode' | 'onChange' | 'type' | 'value'
  > {
  error?: boolean
  value?: string
  onChange?: (value: string) => void
  min?: string
  max?: string
}

function getDatePartsOrder(locale: string): DatePart[] {
  return locale.startsWith(Language.Es)
    ? ['day', 'month', 'year']
    : ['month', 'day', 'year']
}

function getFirstDayOfWeek(locale: string): number {
  return locale.startsWith(Language.Es) ? 1 : 0
}

function getPlaceholder(locale: string): string {
  return locale.startsWith(Language.Es) ? 'dd/mm/yyyy' : 'mm/dd/yyyy'
}

function createUtcDate(year: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex, day))
}

function parseIsoDate(value: string | undefined): Date | null {
  if (!value) return null

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (!match) return null

  const [, year, month, day] = match
  return createUtcDate(Number(year), Number(month) - 1, Number(day))
}

function formatIsoDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getTodayUtcDate(): Date {
  const today = new Date()

  return createUtcDate(today.getFullYear(), today.getMonth(), today.getDate())
}

function addDays(date: Date, amount: number): Date {
  return createUtcDate(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + amount,
  )
}

function addMonths(date: Date, amount: number): Date {
  return createUtcDate(date.getUTCFullYear(), date.getUTCMonth() + amount, 1)
}

function getMonthStart(date: Date): Date {
  return createUtcDate(date.getUTCFullYear(), date.getUTCMonth(), 1)
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false

  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  )
}

function isSameMonth(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth()
  )
}

function getDisplayValue(value: string | undefined, locale: string): string {
  const date = parseIsoDate(value)

  if (!date) return value ?? ''

  const year = String(date.getUTCFullYear()).padStart(4, '0')
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const order = getDatePartsOrder(locale)
  const parts = {
    day,
    month,
    year,
  }

  return order.map((part) => parts[part]).join('/')
}

function applyDateMask(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '').slice(0, 8)

  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function isValidDateParts(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false

  const date = createUtcDate(year, month - 1, day)

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

function parseLocalizedDate(
  value: string,
  locale: string,
  min?: string,
  max?: string,
): string | null {
  const digits = value.replace(/\D/g, '')

  if (digits.length !== 8) return null

  const order = getDatePartsOrder(locale)
  const first = digits.slice(0, 2)
  const second = digits.slice(2, 4)
  const third = digits.slice(4, 8)
  const parts: Partial<Record<DatePart, string>> = {
    [order[0]]: first,
    [order[1]]: second,
    [order[2]]: third,
  }

  const year = Number(parts.year)
  const month = Number(parts.month)
  const day = Number(parts.day)

  if (!isValidDateParts(year, month, day)) return null

  const isoValue = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  if (min && isoValue < min) return null
  if (max && isoValue > max) return null

  return isoValue
}

function isDateSelectable(date: Date, min?: string, max?: string): boolean {
  const isoValue = formatIsoDate(date)

  if (min && isoValue < min) return false
  if (max && isoValue > max) return false

  return true
}

function getWeekdayLabels(locale: string): string[] {
  const firstDayOfWeek = getFirstDayOfWeek(locale)
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    timeZone: 'UTC',
  })
  const referenceSunday = createUtcDate(2024, 0, 7)

  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(addDays(referenceSunday, firstDayOfWeek + index)),
  )
}

function getCalendarDays(calendarMonth: Date, locale: string): Date[] {
  const monthStart = getMonthStart(calendarMonth)
  const weekday = monthStart.getUTCDay()
  const firstDayOfWeek = getFirstDayOfWeek(locale)
  const offset = (weekday - firstDayOfWeek + 7) % 7
  const firstVisibleDate = addDays(monthStart, -offset)

  return Array.from({ length: 42 }, (_, index) =>
    addDays(firstVisibleDate, index),
  )
}

function getInitialCalendarMonth(
  value: string | undefined,
  min?: string,
  max?: string,
): Date {
  const selectedDate = parseIsoDate(value)
  const minDate = parseIsoDate(min)
  const maxDate = parseIsoDate(max)

  return getMonthStart(selectedDate ?? minDate ?? maxDate ?? getTodayUtcDate())
}

export function InputDate({
  error,
  value,
  onChange,
  min,
  max,
  placeholder,
  onBlur,
  disabled = false,
  ...props
}: InputDateProps) {
  const locale = useLocale()
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedDate = useMemo(() => parseIsoDate(value), [value])
  const today = useMemo(() => getTodayUtcDate(), [])
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [displayValue, setDisplayValue] = useState(() =>
    getDisplayValue(value, locale),
  )
  const [calendarMonth, setCalendarMonth] = useState(() =>
    getInitialCalendarMonth(value, min, max),
  )
  const normalizedPlaceholder = useMemo(
    () => placeholder ?? getPlaceholder(locale),
    [locale, placeholder],
  )
  const weekdayLabels = useMemo(() => getWeekdayLabels(locale), [locale])
  const calendarDays = useMemo(
    () => getCalendarDays(calendarMonth, locale),
    [calendarMonth, locale],
  )
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(calendarMonth),
    [calendarMonth, locale],
  )

  useEffect(() => {
    setDisplayValue(getDisplayValue(value, locale))
  }, [locale, value])

  useEffect(() => {
    setCalendarMonth(getInitialCalendarMonth(value, min, max))
  }, [max, min, value])

  useEffect(() => {
    if (!isCalendarOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsCalendarOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCalendarOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isCalendarOpen])

  useEffect(() => {
    if (!disabled) return

    setIsCalendarOpen(false)
  }, [disabled])

  const commitDateValue = (nextIsoValue: string) => {
    setDisplayValue(getDisplayValue(nextIsoValue, locale))
    setCalendarMonth(getMonthStart(parseIsoDate(nextIsoValue) ?? calendarMonth))
    onChange?.(nextIsoValue)
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <InputText
        {...props}
        type='text'
        error={error}
        value={displayValue}
        placeholder={normalizedPlaceholder}
        inputMode='numeric'
        className={styles.input}
        disabled={disabled}
        onChange={(event) => {
          const nextDisplayValue = applyDateMask(event.target.value)

          setDisplayValue(nextDisplayValue)

          if (nextDisplayValue.length === 0) {
            onChange?.('')
            return
          }

          const parsedValue = parseLocalizedDate(
            nextDisplayValue,
            locale,
            min,
            max,
          )

          if (parsedValue) {
            commitDateValue(parsedValue)
          }
        }}
        onBlur={(event) => {
          const parsedValue = parseLocalizedDate(displayValue, locale, min, max)

          if (displayValue.length === 0) {
            onChange?.('')
          } else if (parsedValue) {
            commitDateValue(parsedValue)
          } else {
            setDisplayValue(getDisplayValue(value, locale))
          }

          onBlur?.(event)
        }}
      />
      <button
        type='button'
        className={styles.iconButton}
        onClick={() => setIsCalendarOpen((current) => !current)}
        aria-label={normalizedPlaceholder}
        disabled={disabled}
      >
        <CalendarDays className={styles.icon} />
      </button>
      {isCalendarOpen && (
        <div className={styles.calendar} role='dialog' aria-modal='false'>
          <div className={styles.calendarHeader}>
            <button
              type='button'
              className={styles.calendarNavButton}
              onClick={() =>
                setCalendarMonth((currentMonth) => addMonths(currentMonth, -1))
              }
            >
              <ChevronLeft size={16} />
            </button>
            <span className={styles.calendarMonthLabel}>{monthLabel}</span>
            <button
              type='button'
              className={styles.calendarNavButton}
              onClick={() =>
                setCalendarMonth((currentMonth) => addMonths(currentMonth, 1))
              }
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className={styles.calendarWeekdays}>
            {weekdayLabels.map((weekday) => (
              <span key={weekday} className={styles.calendarWeekday}>
                {weekday}
              </span>
            ))}
          </div>
          <div className={styles.calendarDays}>
            {calendarDays.map((day) => {
              const isoValue = formatIsoDate(day)
              const isOutsideCurrentMonth = !isSameMonth(day, calendarMonth)
              const isSelected = isSameDay(day, selectedDate)
              const isToday = isSameDay(day, today)
              const isDisabled = !isDateSelectable(day, min, max)

              return (
                <button
                  key={isoValue}
                  type='button'
                  className={[
                    styles.calendarDay,
                    isOutsideCurrentMonth && styles.calendarDayOutsideMonth,
                    isSelected && styles.calendarDaySelected,
                    isToday && styles.calendarDayToday,
                    isDisabled && styles.calendarDayDisabled,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    if (isDisabled) return

                    commitDateValue(isoValue)
                    setIsCalendarOpen(false)
                  }}
                  disabled={isDisabled}
                >
                  {day.getUTCDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
