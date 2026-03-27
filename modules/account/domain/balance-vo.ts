export class BalanceVO {
  private readonly balance: number

  constructor(balance: number) {
    this.balance = balance
  }

  getValue(): number {
    return this.balance
  }

  public toCurrency(
    locale: string = 'es-MX',
    currency: string = 'MXN',
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(this.balance)
  }
}
