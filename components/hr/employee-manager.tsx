'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Employee {
  id: string
  nome: string
  setor?: string
  ativo: boolean
}

interface EmployeeManagerProps {
  employees: Employee[]
  onRefresh: () => void
}

export function EmployeeManager({ employees, onRefresh }: EmployeeManagerProps) {
  const [newEmployeeName, setNewEmployeeName] = useState('')
  const [newEmployeeSetor, setNewEmployeeSetor] = useState('')
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  const handleAddEmployee = async () => {
    if (!newEmployeeName.trim()) {
      toast.error('Digite o nome do funcionário')
      return
    }

    try {
      const response = await fetch('/api/employees/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: newEmployeeName, setor: newEmployeeSetor }),
      })

      if (response.ok) {
        toast.success('Funcionário adicionado')
        setNewEmployeeName('')
        setNewEmployeeSetor('')
        onRefresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao adicionar')
      }
    } catch (error) {
      toast.error('Erro ao adicionar funcionário')
    }
  }

  const handleUpdateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const response = await fetch('/api/employees/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })

      if (response.ok) {
        toast.success('Funcionário atualizado')
        setEditingEmployee(null)
        onRefresh()
      } else {
        toast.error('Erro ao atualizar')
      }
    } catch (error) {
      toast.error('Erro ao atualizar funcionário')
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Adicionar Funcionário</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Nome do funcionário"
            value={newEmployeeName}
            onChange={(e) => setNewEmployeeName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddEmployee()}
            className="flex-1"
          />
          <Input
            placeholder="Setor (opcional)"
            value={newEmployeeSetor}
            onChange={(e) => setNewEmployeeSetor(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddEmployee()}
            className="flex-1"
          />
          <Button onClick={handleAddEmployee}>Adicionar</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Funcionários ({employees.length})</h3>
        <div className="space-y-2">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg"
            >
              <div className="flex-1">
                {editingEmployee?.id === emp.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editingEmployee.nome}
                      onChange={(e) =>
                        setEditingEmployee({ ...editingEmployee, nome: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateEmployee(emp.id, {
                            nome: editingEmployee.nome,
                            setor: editingEmployee.setor,
                          })
                        }
                        if (e.key === 'Escape') setEditingEmployee(null)
                      }}
                      placeholder="Nome"
                      autoFocus
                    />
                    <Input
                      value={editingEmployee.setor || ''}
                      onChange={(e) =>
                        setEditingEmployee({ ...editingEmployee, setor: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateEmployee(emp.id, {
                            nome: editingEmployee.nome,
                            setor: editingEmployee.setor,
                          })
                        }
                        if (e.key === 'Escape') setEditingEmployee(null)
                      }}
                      placeholder="Setor"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          emp.ativo
                            ? 'text-foreground font-medium'
                            : 'text-muted-foreground line-through'
                        }
                      >
                        {emp.nome}
                      </span>
                      <Badge variant={emp.ativo ? 'default' : 'secondary'}>
                        {emp.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    {emp.setor && <div className="text-sm text-muted-foreground mt-1">{emp.setor}</div>}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {editingEmployee?.id === emp.id ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleUpdateEmployee(emp.id, {
                          nome: editingEmployee.nome,
                          setor: editingEmployee.setor,
                        })
                      }
                    >
                      Salvar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingEmployee(null)}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setEditingEmployee(emp)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant={emp.ativo ? 'destructive' : 'default'}
                      onClick={() => handleUpdateEmployee(emp.id, { ativo: !emp.ativo })}
                    >
                      {emp.ativo ? 'Desativar' : 'Ativar'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
