'use client'

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  MovementStatsAccountsCard,
  MovementStatsCategoryCard,
  MovementStatsOverviewCard,
} from '@/components/templates/dashboard/movements/movement-stats-sections'
import type { MovementStatsTranslations } from '@/components/templates/dashboard/movements/types'
import type { MovementStats as MovementStatsData } from '@/modules/movement/ports/movement-store'
import styles from './movement-stats.module.css'
import {
  buildAccountChartData,
  buildAccountChartOptions,
  buildCategoryChartData,
  buildCategoryChartOptions,
  buildCategorySlices,
  type ChartPalette,
  FALLBACK_PALETTE,
  getAccountChartHeight,
  readChartPalette,
} from './movement-stats.utils'

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
  const categoryChartData = buildCategoryChartData(categorySlices, palette)
  const categoryChartOptions = buildCategoryChartOptions(locale, palette)
  const accountChartData = buildAccountChartData(stats, translations, palette)
  const accountChartOptions = buildAccountChartOptions(locale, palette)
  const accountChartHeight = getAccountChartHeight(stats.accounts.length)

  return (
    <div className={styles.statsLayout}>
      <MovementStatsOverviewCard
        stats={stats}
        locale={locale}
        translations={translations}
      />
      <MovementStatsCategoryCard
        data={categoryChartData}
        options={categoryChartOptions}
        hasData={categorySlices.length > 0}
        translations={translations}
      />
      <MovementStatsAccountsCard
        data={accountChartData}
        options={accountChartOptions}
        hasData={stats.accounts.length > 0}
        chartHeight={accountChartHeight}
        translations={translations}
      />
    </div>
  )
}
