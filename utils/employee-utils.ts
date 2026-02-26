export async function fetchEmployees() {
  try {
    const response = await fetch('/api/employees/manage')
    if (response.ok) {
      const data = await response.json()
      return data.employees || []
    }
    return []
  } catch (error) {
    console.error('Error fetching employees:', error)
    return []
  }
}
