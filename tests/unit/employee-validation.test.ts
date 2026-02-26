/**
 * Unit Tests - Employee Validation
 * Tests employee name validation and autocomplete filtering
 */

describe('Employee Validation', () => {
  const mockEmployees = [
    { id: '1', nome: 'João Silva', setor: 'TI', ativo: true },
    { id: '2', nome: 'Maria Santos', setor: 'RH', ativo: true },
    { id: '3', nome: 'Pedro Oliveira', setor: 'Financeiro', ativo: false },
  ]

  test('should filter active employees only', () => {
    const activeEmployees = mockEmployees.filter(emp => emp.ativo)
    
    expect(activeEmployees.length).toBe(2)
    expect(activeEmployees.every(emp => emp.ativo)).toBe(true)
  })

  test('should search employees by name (case insensitive)', () => {
    const searchTerm = 'joão'
    const results = mockEmployees.filter(emp => 
      emp.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )

    expect(results.length).toBe(1)
    expect(results[0].nome).toBe('João Silva')
  })

  test('should limit autocomplete results to 3 items', () => {
    const manyEmployees = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      nome: `Employee ${i}`,
      setor: 'Setor',
      ativo: true
    }))

    const searchTerm = 'employee'
    const results = manyEmployees
      .filter(emp => emp.nome.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 3)

    expect(results.length).toBe(3)
  })

  test('should validate employee name is not empty', () => {
    const validateName = (name: string) => {
      return name && name.trim().length > 0
    }

    expect(validateName('João Silva')).toBe(true)
    expect(validateName('   ')).toBe(false)
    expect(validateName('')).toBe(false)
  })

  test('should find employee by exact name match', () => {
    const searchName = 'Maria Santos'
    const employee = mockEmployees.find(emp => emp.nome === searchName)

    expect(employee).toBeDefined()
    expect(employee?.nome).toBe('Maria Santos')
    expect(employee?.setor).toBe('RH')
  })
})

describe('Employee CRUD Operations', () => {
  test('should validate required fields for new employee', () => {
    const validateEmployee = (nome: string, setor?: string) => {
      return {
        isValid: nome.trim().length > 0,
        nome: nome.trim(),
        setor: setor?.trim() || null
      }
    }

    const valid = validateEmployee('João Silva', 'TI')
    expect(valid.isValid).toBe(true)
    expect(valid.nome).toBe('João Silva')
    expect(valid.setor).toBe('TI')

    const invalid = validateEmployee('   ')
    expect(invalid.isValid).toBe(false)
  })

  test('should toggle employee active status', () => {
    const employee = { id: '1', nome: 'João', setor: 'TI', ativo: true }
    const toggledEmployee = { ...employee, ativo: !employee.ativo }

    expect(toggledEmployee.ativo).toBe(false)
  })
})
