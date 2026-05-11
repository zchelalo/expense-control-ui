'use client'

import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/atoms/button'

type StatsToggleButtonProps = {
  className?: string
  isVisible: boolean
  showLabel: string
  hideLabel: string
  onToggle: () => void
}

export function StatsToggleButton({
  className,
  isVisible,
  showLabel,
  hideLabel,
  onToggle,
}: StatsToggleButtonProps) {
  return (
    <Button
      type='button'
      appearance='outlined'
      className={className}
      onClick={onToggle}
      aria-expanded={isVisible}
    >
      <BarChart3 size={16} />
      {isVisible ? hideLabel : showLabel}
      {isVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </Button>
  )
}
