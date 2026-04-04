export type ChartType = "bar" | "line" | "pie" | "area" | "scatter" | "table"

export interface SqlResult {
  rows: Record<string, unknown>[]
  fields: { name: string; dataTypeID: number }[]
  rowCount: number
  truncated: boolean
  durationMs: number
  error?: boolean
  message?: string
}

interface ColumnAnalysis {
  name: string
  isNumeric: boolean
  isDate: boolean
  isString: boolean
  uniqueValues: number
}

const DATE_TYPE_IDS = [
  1082, // date
  1114, // timestamp
  1184, // timestamptz
]

const NUMERIC_TYPE_IDS = [
  20, // int8 / bigint
  21, // int2 / smallint
  23, // int4 / integer
  24, // regproc
  26, // oid
  700, // float4 / real
  701, // float8 / double precision
  1700, // numeric
]

function analyzeColumns(result: SqlResult): ColumnAnalysis[] {
  const rows = result.rows
  if (rows.length === 0) return []

  return result.fields.map((field) => {
    const isNumeric = NUMERIC_TYPE_IDS.includes(field.dataTypeID)
    const isDate = DATE_TYPE_IDS.includes(field.dataTypeID)
    const isString = !isNumeric && !isDate

    const uniqueValues = new Set(rows.map((r) => String(r[field.name]))).size

    return {
      name: field.name,
      isNumeric,
      isDate,
      isString,
      uniqueValues,
    }
  })
}

export function detectChartType(result: SqlResult): ChartType {
  if (!result.rows || result.rows.length === 0) return "table"
  if (result.fields.length <= 1) return "table"

  const columns = analyzeColumns(result)
  const numericCols = columns.filter((c) => c.isNumeric)
  const stringCols = columns.filter((c) => c.isString)
  const dateCols = columns.filter((c) => c.isDate)
  const rowCount = result.rows.length

  if (dateCols.length >= 1 && numericCols.length >= 1) {
    return rowCount > 10 ? "area" : "line"
  }

  if (stringCols.length === 1 && numericCols.length >= 1) {
    const categories = stringCols[0]
    if (categories.uniqueValues <= 8 && numericCols.length <= 3) {
      return "pie"
    }
    return "bar"
  }

  if (numericCols.length >= 2 && stringCols.length === 0) {
    return "scatter"
  }

  if (numericCols.length >= 1) {
    return "bar"
  }

  return "table"
}

export function getChartConfig(
  columns: ColumnAnalysis[]
): Record<string, { label: string; color: string }> {
  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ]

  const numericCols = columns.filter((c) => c.isNumeric)

  return numericCols.reduce(
    (acc, col, i) => {
      acc[col.name] = {
        label: col.name,
        color: colors[i % colors.length],
      }
      return acc
    },
    {} as Record<string, { label: string; color: string }>
  )
}

export function getLabelKey(columns: ColumnAnalysis[]): string | undefined {
  const stringCols = columns.filter((c) => c.isString)
  const dateCols = columns.filter((c) => c.isDate)
  return stringCols[0]?.name ?? dateCols[0]?.name
}

export { analyzeColumns }
export type { ColumnAnalysis }
