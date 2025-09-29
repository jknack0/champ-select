const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const apiFetch = async <TResponse>(
  path: string,
  options: RequestInit = {},
): Promise<TResponse> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    let message = 'Request failed'
    try {
      const data = await response.json()
      if (data?.message) {
        message = data.message
      }
    } catch (error) {
      // ignore json parse errors
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return (await response.json()) as TResponse
}
