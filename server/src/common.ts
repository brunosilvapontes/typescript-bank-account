export default function getInputValueError (value: number): string {
  let message = ''
  if (isNaN(value)) {
    message = 'Valor não foi passado ou não é um número'
  } else if (!Number.isInteger(value)) {
    message = 'Valor deve ser passado em centavos (número inteiro)'
  } else if (value < 1) {
    message = 'Valor deve ser maior que 0'
  }
  return message
}
