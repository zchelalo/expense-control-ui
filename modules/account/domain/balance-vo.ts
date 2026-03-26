export class BalanceVO {
  private readonly balance: number

  constructor(balance: number) {
    this.balance = balance
  }

  getValue(): number {
    return this.balance
  }
}
