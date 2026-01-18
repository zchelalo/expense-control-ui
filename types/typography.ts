export type TypographyTextStyle = 'normal' | 'italic'
export type TypographyWeight = 'light' | 'normal' | 'medium' | 'bold'
export type TypographySize =
  | 'small'
  | 'normal'
  | 'medium'
  | 'large'
  | 'extraLarge'

export interface TypographyProps {
  typographyTextStyle?: TypographyTextStyle
  typographyWeight?: TypographyWeight
  typographySize?: TypographySize
}
