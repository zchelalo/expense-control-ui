import type {
  TypographySize,
  TypographyTextStyle,
  TypographyWeight,
} from '@/types/typography'

export enum TypographyTypes {
  Weight = 'typographyWeight',
  Size = 'typographySize',
  TextStyle = 'typographyTextStyle',
}

const weight: Record<TypographyWeight, string> = {
  light: 'weight-light',
  normal: 'weight-normal',
  medium: 'weight-medium',
  bold: 'weight-bold',
}

const size: Record<TypographySize, string> = {
  small: 'size-small',
  normal: 'size-normal',
  medium: 'size-medium',
  large: 'size-large',
  extraLarge: 'size-extraLarge',
  extraLarge2: 'size-extraLarge-2',
  extraLarge3: 'size-extraLarge-3',
  extraLarge4: 'size-extraLarge-4',
}

const textStyle: Record<TypographyTextStyle, string> = {
  normal: 'textStyle-normal',
  italic: 'textStyle-italic',
}

export const TYPOGRAPHY_CLASSNAMES = {
  [TypographyTypes.Weight]: weight,
  [TypographyTypes.Size]: size,
  [TypographyTypes.TextStyle]: textStyle,
} as const
