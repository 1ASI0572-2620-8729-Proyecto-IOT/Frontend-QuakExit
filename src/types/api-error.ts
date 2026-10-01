export type ApiFieldError = {
  field: string
  message: string
}

export type ApiErrorShape = {
  status: number
  message: string
  fieldErrors?: ApiFieldError[]
}

export class ApiError extends Error {
  status: number
  fieldErrors?: ApiFieldError[]

  constructor({ status, message, fieldErrors }: ApiErrorShape) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}
