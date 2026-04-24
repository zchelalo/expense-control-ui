export class AmountVO {
  private readonly amount: number

  constructor(amount: number) {
    this.amount = amount
  }

  getValue(): number {
    return this.amount
  }

  public toCurrency(
    locale: string = 'es-MX',
    currency: string = 'MXN',
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(this.amount)
  }
}
