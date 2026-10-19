export function useTextNormalize() {
  function toUpperCase(str: string | null | undefined): string {
    if (!str) return ''
    return str.toUpperCase()
  }

  function toLowerCase(str: string | null | undefined): string {
    if (!str) return ''
    return str.toLowerCase()
  }

  function capitalize(str: string | null | undefined): string {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  function capitalizeWords(str: string | null | undefined): string {
    if (!str) return ''
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  function normalizeForStorage(str: string | null | undefined): string {
    if (!str) return ''
    return str.trim().toLowerCase()
  }

  function normalizePlaca(str: string | null | undefined): string {
    if (!str) return ''
    return str.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
  }

  return {
    toUpperCase,
    toLowerCase,
    capitalize,
    capitalizeWords,
    normalizeForStorage,
    normalizePlaca
  }
}