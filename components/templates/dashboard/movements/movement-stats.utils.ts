import type { ChartData, ChartOptions, TooltipItem } from 'chart.js'
import type { MovementStatsTranslations } from '@/components/templates/dashboard/movements/types'
import type { Language } from '@/constants/common'
import type { MovementStats as MovementStatsData } from '@/modules/movement/ports/movement-store'
import { getCurrencyFromLanguage } from '@/utils/currency'

export type CategorySlice = {
  label: string
  incomeTotal: number
  expenseTotal: number
}

export type ChartPalette = {
  primary: string
  secondary: string
  success: string
  error: string
  warning: string
  foregroundMuted: string
  border: string
  background: string
}

export const FALLBACK_PALETTE: ChartPalette = {
  primary: '#6c5ce7',
  secondary: '#a29bfe',
  success: 'rgba(28, 187, 86, 1)',
  error: 'rgba(220, 38, 38, 1)',
  warning: 'rgba(255, 191, 53, 1)',
  foregroundMuted: '#6b6b6b',
  border: '#e5e5e5',
  background: '#fafafa',
}

export function formatCurrency(locale: string, amount: number) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: getCurrencyFromLanguage(locale as Language),
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatInteger(locale: string, value: number) {
  return new Intl.NumberFormat(locale).format(value)
}

function truncateLabel(value: string, max = 18) {
  if (value.length <= max) return value

  return `${value.slice(0, max - 3)}...`
}

function readCssVar(
  style: CSSStyleDeclaration,
  name: string,
  fallback: string,
) {
  const value = style.getPropertyValue(name).trim()

  return value || fallback
}

export function readChartPalette(): ChartPalette {
  if (typeof window === 'undefined') return FALLBACK_PALETTE

  const style = getComputedStyle(document.documentElement)

  return {
    primary: readCssVar(style, '--primary', FALLBACK_PALETTE.primary),
    secondary: readCssVar(style, '--secondary', FALLBACK_PALETTE.secondary),
    success: readCssVar(style, '--success', FALLBACK_PALETTE.success),
    error: readCssVar(style, '--error', FALLBACK_PALETTE.error),
    warning: readCssVar(style, '--warning', FALLBACK_PALETTE.warning),
    foregroundMuted: readCssVar(
      style,
      '--foreground-muted',
      FALLBACK_PALETTE.foregroundMuted,
    ),
    border: readCssVar(style, '--border', FALLBACK_PALETTE.border),
    background: readCssVar(style, '--background', FALLBACK_PALETTE.background),
  }
}

export function buildCategorySlices(
  stats: MovementStatsData,
  translations: MovementStatsTranslations,
) {
  const sortedCategories = [...stats.categories]
    .map((item) => ({
      label: item.category.name,
      incomeTotal: item.incomeTotal,
      expenseTotal: item.expenseTotal,
      volume: item.incomeTotal + item.expenseTotal,
    }))
    .sort((left, right) => right.volume - left.volume)

  const topCategories = sortedCategories.slice(0, 5)
  const remainingCategories = sortedCategories.slice(5)

  if (remainingCategories.length === 0) {
    return topCategories
  }

  const otherCategory = remainingCategories.reduce<CategorySlice>(
    (accumulator, item) => ({
      label: translations.other,
      incomeTotal: accumulator.incomeTotal + item.incomeTotal,
      expenseTotal: accumulator.expenseTotal + item.expenseTotal,
    }),
    {
      label: translations.other,
      incomeTotal: 0,
      expenseTotal: 0,
    },
  )

  return [...topCategories, otherCategory]
}

export function buildCategoryChartData(
  categorySlices: CategorySlice[],
  palette: ChartPalette,
) {
  const categoryPalette = [
    palette.primary,
    palette.success,
    palette.warning,
    palette.error,
    palette.secondary,
    palette.foregroundMuted,
  ]

  return {
    labels: categorySlices.map((item) => item.label),
    datasets: [
      {
        data: categorySlices.map(
          (item) => item.incomeTotal + item.expenseTotal,
        ),
        backgroundColor: categoryPalette,
        borderColor: palette.background,
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  } satisfies ChartData<'doughnut'>
}

export function buildCategoryChartOptions(
  locale: string,
  palette: ChartPalette,
) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '56%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: palette.foregroundMuted,
          usePointStyle: true,
          boxWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'doughnut'>) =>
            `${context.label}: ${formatCurrency(locale, context.parsed)}`,
        },
      },
    },
  } satisfies ChartOptions<'doughnut'>
}

export function buildAccountChartData(
  stats: MovementStatsData,
  translations: MovementStatsTranslations,
  palette: ChartPalette,
) {
  return {
    labels: stats.accounts.map((item) => truncateLabel(item.account.name, 22)),
    datasets: [
      {
        label: translations.income,
        data: stats.accounts.map((item) => item.incomeTotal),
        backgroundColor: palette.success,
        borderRadius: 999,
        borderSkipped: false as const,
        barThickness: 18,
      },
      {
        label: translations.expense,
        data: stats.accounts.map((item) => item.expenseTotal * -1),
        backgroundColor: palette.error,
        borderRadius: 999,
        borderSkipped: false as const,
        barThickness: 18,
      },
    ],
  } satisfies ChartData<'bar'>
}

export function buildAccountChartOptions(
  locale: string,
  palette: ChartPalette,
) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: palette.foregroundMuted,
          usePointStyle: true,
          boxWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'bar'>) =>
            `${context.dataset.label}: ${formatCurrency(
              locale,
              Math.abs(Number(context.parsed.x)),
            )}`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: palette.foregroundMuted,
          callback: (value: string | number) =>
            formatCurrency(locale, Math.abs(Number(value))),
        },
        grid: {
          color: palette.border,
        },
      },
      y: {
        stacked: true,
        ticks: {
          color: palette.foregroundMuted,
        },
        grid: {
          display: false,
        },
      },
    },
  } satisfies ChartOptions<'bar'>
}

export function getAccountChartHeight(accountCount: number) {
  return Math.max(280, accountCount * 44)
}
