'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Employee {
  id: string
  nome: string
  setor?: string
  ativo: boolean
}

interface EmployeesManagerTabProps {
  employees: Employee[]
  newEmployeeName: string
  newEmployeeSetor: string
  editingEmployee: Employee | null
  onNewEmployeeNameChange: (name: string) => void
  onNewEmployeeSectorChange: (sector: string) => void
  onAddEmployee: () => void
  onEditingEmployeeChange: (employee: Employee | null) => void
  onEditingNameChange: (name: string) => void
  onEditingSectorChange: (sector: string) => void
  onUpdateEmployee: (id: string, data: any) => void
  onToggleEmployeeStatus: (id: string, ativo: boolean) => void
}

export function EmployeesManagerTab({
  employees,
  newEmployeeName,
  newEmployeeSetor,
  editingEmployee,
  onNewEmployeeNameChange,
  onNewEmployeeSectorChange,
  onAddEmployee,
  onEditingEmployeeChange,
  onEditingNameChange,
  onEditingSectorChange,
  onUpdateEmployee,
  onToggleEmployeeStatus,
}: EmployeesManagerTabProps) {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Adicionar Funcionário</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Nome do funcionário"
            value={newEmployeeName}
            onChange={(e) => onNewEmployeeNameChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddEmployee()}
            className="flex-1"
          />
          <Input
            placeholder="Setor (opcional)"
            value={newEmployeeSetor}
            onChange={(e) => onNewEmployeeSectorChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddEmployee()}
            className="flex-1"
          />
          <Button onClick={onAddEmployee}>Adicionar</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Lista de Funcionários</h3>
        <div className="space-y-2">
          {employees.map((emp) => (
            <div key={emp.id} className="flex items-center gap-2 p-3 border border-border rounded-lg">
              <div className="flex-1">
                {editingEmployee?.id === emp.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editingEmployee.nome}
                      onChange={(e) =>
                        onEditingEmployeeChange({ ...editingEmployee, nome: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdateEmployee(emp.id, { nome: editingEmployee.nome, setor: editingEmployee.setor })
                        }
                        if (e.key === 'Escape') onEditingEmployeeChange(null)
                      }}
                      placeholder="Nome"
                      autoFocus
                    />
                    <Input
                      value={editingEmployee.setor || ''}
                      onChange={(e) =>
                        onEditingEmployeeChange({ ...editingEmployee, setor: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdateEmployee(emp.id, { nome: editingEmployee.nome, setor: editingEmployee.setor })
                        }
                        if (e.key === 'Escape') onEditingEmployeeChange(null)
                      }}
                      placeholder="Setor"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={emp.ativo ? 'text-foreground font-medium' : 'text-muted-foreground line-through'}>
                        {emp.nome}
                      </span>
                      <Badge variant={emp.ativo ? 'default' : 'secondary'}>
                        {emp.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    {emp.setor && (
                      <div className="text-sm text-muted-foreground mt-1">{emp.setor}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {editingEmployee?.id === emp.id ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onUpdateEmployee(emp.id, { nome: editingEmployee.nome, setor: editingEmployee.setor })}
                    >
                      Salvar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onEditingEmployeeChange(null)}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => onEditingEmployeeChange(emp)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant={emp.ativo ? 'outline' : 'default'}
                      onClick={() => onToggleEmployeeStatus(emp.id, !emp.ativo)}
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
