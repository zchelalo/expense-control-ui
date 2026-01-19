export type TypographyTextStyle = 'normal' | 'italic'
export type TypographyWeight = 'light' | 'normal' | 'medium' | 'bold'
export type TypographySize =
  | 'small'
  | 'normal'
  | 'medium'
  | 'large'
  | 'extraLarge'
  | 'extraLarge2'
  | 'extraLarge3'
  | 'extraLarge4'

export interface TypographyProps {
  typographyTextStyle?: TypographyTextStyle
  typographyWeight?: TypographyWeight
  typographySize?: TypographySize
}
