export namespace NumericDate {
  export type t = Valid | Invalid

  export interface Valid {
    type: "valid",
    value: string
  }

  export interface Invalid {
    type: "invalid",
    value: string
  }

  export function make(candidate: string): Valid | Invalid {
    if (candidate.length !== 10) {
      return { type: "invalid", value: candidate }
    }

    const [y, m, d] = candidate.split('-');
    if (!y || !m || !d) {
      return { type: "invalid", value: candidate }
    }

    return { type: "valid", value: candidate }
  }

  export function isValid(date: Valid | Invalid): date is Valid {
    return date.type === "valid"
  }

  export function isInvalid(date: Valid | Invalid): date is Invalid {
    return date.type === "invalid"
  }
}