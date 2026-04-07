/**
 * Runtime NgSwitch directive.
 */
export class NgSwitch {
  private value: any;

  setValue(value: any): void {
    this.value = value;
  }

  matches(caseValue: any): boolean {
    return this.value === caseValue;
  }
}
