export interface ConnectionStringParts {
  host: string
  port: string
  database: string
  username: string
  password: string
  ssl: boolean
}

export function parseConnectionString(
  input: string,
  prev: ConnectionStringParts
): ConnectionStringParts {
  try {
    const url = new URL(input)
    return {
      host: url.hostname || prev.host,
      port: url.port || prev.port,
      database: url.pathname.slice(1) || prev.database,
      username: url.username ? decodeURIComponent(url.username) : prev.username,
      password: url.password ? decodeURIComponent(url.password) : prev.password,
      ssl:
        url.searchParams.has("sslmode") &&
        url.searchParams.get("sslmode") !== "disable",
    }
  } catch {
    return prev
  }
}
