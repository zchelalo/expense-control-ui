import type { ChartData, ChartOptions } from 'chart.js'
import type { CSSProperties, ReactNode } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { FlexBox } from '@/components/atoms/flex-box'
import { Text } from '@/components/atoms/text'
import { Title } from '@/components/atoms/title'
import { Card } from '@/components/molecules/card'
import {
  formatCurrency,
  formatInteger,
} from '@/components/templates/dashboard/movements/movement-stats.utils'
import type { MovementStatsTranslations } from '@/components/templates/dashboard/movements/types'
import type { MovementStats as MovementStatsData } from '@/modules/movement/ports/movement-store'
import styles from './movement-stats.module.css'

type MovementStatsOverviewCardProps = {
  stats: MovementStatsData
  locale: string
  translations: MovementStatsTranslations
}

type MovementStatsCategoryCardProps = {
  data: ChartData<'doughnut'>
  options: ChartOptions<'doughnut'>
  hasData: boolean
  translations: MovementStatsTranslations
}

type MovementStatsAccountsCardProps = {
  data: ChartData<'bar'>
  options: ChartOptions<'bar'>
  hasData: boolean
  chartHeight: number
  translations: MovementStatsTranslations
}

type StatsCardShellProps = {
  className?: string
  title: string
  summary: string
  children: ReactNode
}

type StatsChartCardProps = StatsCardShellProps & {
  frameClassName: string
  frameStyle?: CSSProperties
  hasData: boolean
  emptyText: string
}

type StatsMetricProps = {
  label: string
  value: string
  valueClassName?: string
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

function StatsCardShell({
  className,
  title,
  summary,
  children,
}: StatsCardShellProps) {
  return (
    <Card
      className={className}
      header={<StatsCardHeader title={title} summary={summary} />}
    >
      {children}
    </Card>
  )
}

function StatsEmptyState({ text }: { text: string }) {
  return (
    <FlexBox
      variant='div'
      direction='column'
      alignItems='center'
      justifyContent='center'
      className={styles.emptyState}
    >
      <Text className={styles.mutedText}>{text}</Text>
    </FlexBox>
  )
}

function StatsChartCard({
  className,
  title,
  summary,
  frameClassName,
  frameStyle,
  hasData,
  emptyText,
  children,
}: StatsChartCardProps) {
  return (
    <StatsCardShell className={className} title={title} summary={summary}>
      <div className={frameClassName} style={frameStyle}>
        {hasData ? children : <StatsEmptyState text={emptyText} />}
      </div>
    </StatsCardShell>
  )
}

function StatsMetric({ label, value, valueClassName }: StatsMetricProps) {
  return (
    <FlexBox
      variant='div'
      direction='column'
      alignItems='start'
      gap={1}
      className={styles.metricItem}
    >
      <Text variant='span' typographySize='small' className={styles.mutedText}>
        {label}
      </Text>
      <Title
        variant='h4'
        typographyWeight='bold'
        typographySize='extraLarge'
        className={valueClassName}
      >
        {value}
      </Title>
    </FlexBox>
  )
}

export function MovementStatsOverviewCard({
  stats,
  locale,
  translations,
}: MovementStatsOverviewCardProps) {
  return (
    <StatsCardShell
      className={styles.overviewCard}
      title={translations.overviewTitle}
      summary={translations.overviewSummary}
    >
      <FlexBox
        variant='div'
        direction='column'
        alignItems='stretch'
        gap={3}
        className={styles.overviewContent}
      >
        <div className={styles.overviewTopGrid}>
          <StatsMetric
            label={translations.netTotal}
            value={formatCurrency(locale, stats.overview.netTotal)}
            valueClassName={styles.balanceValue}
          />
          <StatsMetric
            label={translations.income}
            value={formatCurrency(locale, stats.overview.income.total)}
            valueClassName={styles.incomeValue}
          />
          <StatsMetric
            label={translations.expense}
            value={formatCurrency(locale, stats.overview.expense.total)}
            valueClassName={styles.expenseValue}
          />
        </div>
        <div className={styles.overviewBottomGrid}>
          <StatsMetric
            label={translations.totalMovements}
            value={formatInteger(locale, stats.overview.totalMovements)}
            valueClassName={styles.metricValue}
          />
          <StatsMetric
            label={translations.incomeCount}
            value={formatInteger(locale, stats.overview.income.count)}
            valueClassName={styles.metricValue}
          />
          <StatsMetric
            label={translations.expenseCount}
            value={formatInteger(locale, stats.overview.expense.count)}
            valueClassName={styles.metricValue}
          />
        </div>
      </FlexBox>
    </StatsCardShell>
  )
}

export function MovementStatsCategoryCard({
  data,
  options,
  hasData,
  translations,
}: MovementStatsCategoryCardProps) {
  return (
    <StatsChartCard
      className={styles.categoryCard}
      title={translations.byCategoryTitle}
      summary={translations.byCategorySummary}
      frameClassName={styles.categoryChartFrame}
      hasData={hasData}
      emptyText={translations.noData}
    >
      <Doughnut data={data} options={options} />
    </StatsChartCard>
  )
}

export function MovementStatsAccountsCard({
  data,
  options,
  hasData,
  chartHeight,
  translations,
}: MovementStatsAccountsCardProps) {
  return (
    <StatsChartCard
      className={styles.accountsCard}
      title={translations.byAccountTitle}
      summary={translations.byAccountSummary}
      frameClassName={styles.accountsChartFrame}
      frameStyle={{ height: `${chartHeight}px` }}
      hasData={hasData}
      emptyText={translations.noData}
    >
      <Bar data={data} options={options} />
    </StatsChartCard>
  )
}
