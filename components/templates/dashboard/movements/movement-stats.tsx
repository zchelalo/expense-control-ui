'use client'

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type TooltipItem,
} from 'chart.js'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { FlexBox } from '@/components/atoms/flex-box'
import { Text } from '@/components/atoms/text'
import { Title } from '@/components/atoms/title'
import { Card } from '@/components/molecules/card'
import type { MovementStatsTranslations } from '@/components/templates/dashboard/movements/types'
import type { Language } from '@/constants/common'
import type { MovementStats as MovementStatsData } from '@/modules/movement/ports/movement-store'
import { getCurrencyFromLanguage } from '@/utils/currency'
import styles from './movement-stats.module.css'

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
)

type MovementStatsProps = {
  stats: MovementStatsData
  locale: string
  translations: MovementStatsTranslations
}

type CategorySlice = {
  label: string
  incomeTotal: number
  expenseTotal: number
}

type ChartPalette = {
  primary: string
  secondary: string
  success: string
  error: string
  warning: string
  foregroundMuted: string
  border: string
  background: string
}

const FALLBACK_PALETTE: ChartPalette = {
  primary: '#6c5ce7',
  secondary: '#a29bfe',
  success: 'rgba(28, 187, 86, 1)',
  error: 'rgba(220, 38, 38, 1)',
  warning: 'rgba(255, 191, 53, 1)',
  foregroundMuted: '#6b6b6b',
  border: '#e5e5e5',
  background: '#fafafa',
}

function formatCurrency(locale: string, amount: number) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: getCurrencyFromLanguage(locale as Language),
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatInteger(locale: string, value: number) {
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

function readChartPalette(): ChartPalette {
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

function buildCategorySlices(
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

function StatsCardHeader({
  title,
  summary,
}: {
  title: string
  summary: string
}) {
  return (
    <FlexBox
      variant='div'
      direction='column'
      alignItems='start'
      gap={1}
      className={styles.cardHeader}
    >
      <Title variant='h3' typographyWeight='medium' typographySize='extraLarge'>
        {title}
      </Title>
      <Text className={styles.mutedText}>{summary}</Text>
    </FlexBox>
  )
}

export function MovementStats({
  stats,
  locale,
  translations,
}: MovementStatsProps) {
  const { resolvedTheme } = useTheme()
  const [palette, setPalette] = useState<ChartPalette>(FALLBACK_PALETTE)

  useEffect(() => {
    if (!resolvedTheme) return

    setPalette(readChartPalette())
  }, [resolvedTheme])

  const categorySlices = buildCategorySlices(stats, translations)
  const categoryPalette = [
    palette.primary,
    palette.success,
    palette.warning,
    palette.error,
    palette.secondary,
    palette.foregroundMuted,
  ]
  const categoryChartData = {
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
  }
  const categoryChartOptions = {
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
  }
  const accountChartData = {
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
  }
  const accountChartOptions = {
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
  }
  const accountChartHeight = Math.max(280, stats.accounts.length * 44)

  return (
    <div className={styles.statsLayout}>
      <Card
        className={styles.overviewCard}
        header={
          <StatsCardHeader
            title={translations.overviewTitle}
            summary={translations.overviewSummary}
          />
        }
      >
        <FlexBox
          variant='div'
          direction='column'
          alignItems='stretch'
          gap={3}
          className={styles.overviewContent}
        >
          <div className={styles.overviewTopGrid}>
            <FlexBox
              variant='div'
              direction='column'
              alignItems='start'
              gap={1}
              className={`${styles.metricItem} ${styles.overviewPrimaryItem}`}
            >
              <Text
                variant='span'
                typographySize='small'
                className={styles.mutedText}
              >
                {translations.netTotal}
              </Text>
              <Title
                variant='h2'
                typographyWeight='bold'
                typographySize='extraLarge3'
                className={styles.balanceValue}
              >
                {formatCurrency(locale, stats.overview.netTotal)}
              </Title>
            </FlexBox>
            <FlexBox
              variant='div'
              direction='column'
              alignItems='start'
              gap={1}
              className={styles.metricItem}
            >
              <Text
                variant='span'
                typographySize='small'
                className={styles.mutedText}
              >
                {translations.income}
              </Text>
              <Title
                variant='h4'
                typographyWeight='bold'
                typographySize='extraLarge'
                className={styles.incomeValue}
              >
                {formatCurrency(locale, stats.overview.income.total)}
              </Title>
              <Text
                variant='span'
                typographySize='small'
                className={styles.mutedText}
              >
                {translations.incomeCount}:{' '}
                {formatInteger(locale, stats.overview.income.count)}
              </Text>
            </FlexBox>
            <FlexBox
              variant='div'
              direction='column'
              alignItems='start'
              gap={1}
              className={styles.metricItem}
            >
              <Text
                variant='span'
                typographySize='small'
                className={styles.mutedText}
              >
                {translations.expense}
              </Text>
              <Title
                variant='h4'
                typographyWeight='bold'
                typographySize='extraLarge'
                className={styles.expenseValue}
              >
                {formatCurrency(locale, stats.overview.expense.total)}
              </Title>
              <Text
                variant='span'
                typographySize='small'
                className={styles.mutedText}
              >
                {translations.expenseCount}:{' '}
                {formatInteger(locale, stats.overview.expense.count)}
              </Text>
            </FlexBox>
          </div>
          <div className={styles.overviewBottomGrid}>
            <FlexBox
              variant='div'
              direction='column'
              alignItems='start'
              gap={1}
              className={styles.metricItem}
            >
              <Text
                variant='span'
                typographySize='small'
                className={styles.mutedText}
              >
                {translations.totalMovements}
              </Text>
              <Title
                variant='h4'
                typographyWeight='bold'
                typographySize='extraLarge'
                className={styles.metricValue}
              >
                {formatInteger(locale, stats.overview.totalMovements)}
              </Title>
            </FlexBox>
            <FlexBox
              variant='div'
              direction='column'
              alignItems='start'
              gap={1}
              className={styles.metricItem}
            >
              <Text
                variant='span'
                typographySize='small'
                className={styles.mutedText}
              >
                {translations.incomeCount}
              </Text>
              <Title
                variant='h4'
                typographyWeight='bold'
                typographySize='extraLarge'
                className={styles.metricValue}
              >
                {formatInteger(locale, stats.overview.income.count)}
              </Title>
            </FlexBox>
            <FlexBox
              variant='div'
              direction='column'
              alignItems='start'
              gap={1}
              className={styles.metricItem}
            >
              <Text
                variant='span'
                typographySize='small'
                className={styles.mutedText}
              >
                {translations.expenseCount}
              </Text>
              <Title
                variant='h4'
                typographyWeight='bold'
                typographySize='extraLarge'
                className={styles.metricValue}
              >
                {formatInteger(locale, stats.overview.expense.count)}
              </Title>
            </FlexBox>
          </div>
        </FlexBox>
      </Card>

      <Card
        className={styles.categoryCard}
        header={
          <StatsCardHeader
            title={translations.byCategoryTitle}
            summary={translations.byCategorySummary}
          />
        }
      >
        <div className={styles.categoryChartFrame}>
          {categorySlices.length > 0 ? (
            <Doughnut data={categoryChartData} options={categoryChartOptions} />
          ) : (
            <FlexBox
              variant='div'
              direction='column'
              alignItems='center'
              justifyContent='center'
              className={styles.emptyState}
            >
              <Text className={styles.mutedText}>{translations.noData}</Text>
            </FlexBox>
          )}
        </div>
      </Card>

      <Card
        className={styles.accountsCard}
        header={
          <StatsCardHeader
            title={translations.byAccountTitle}
            summary={translations.byAccountSummary}
          />
        }
      >
        <div
          className={styles.accountsChartFrame}
          style={{ height: `${accountChartHeight}px` }}
        >
          {stats.accounts.length > 0 ? (
            <Bar data={accountChartData} options={accountChartOptions} />
          ) : (
            <FlexBox
              variant='div'
              direction='column'
              alignItems='center'
              justifyContent='center'
              className={styles.emptyState}
            >
              <Text className={styles.mutedText}>{translations.noData}</Text>
            </FlexBox>
          )}
        </div>
      </Card>
    </div>
  )
}
