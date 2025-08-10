import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, Building2, Search } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatDate } from '@/lib/utils'
import { Obra } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'


const ObrasManager: React.FC = () => {
  const { obras, addObra, updateObra, deleteObra } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingObra, setEditingObra] = useState<Obra | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    cidade: '',
    ativo: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingObra) {
      updateObra(editingObra.id, formData)
    } else {
      addObra(formData)
    }
    resetForm()
  }

  const handleEdit = (obra: Obra) => {
    setEditingObra(obra)
    setFormData({
      nome: obra.nome,
      cidade: obra.cidade || '',
      ativo: obra.ativo
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta obra?')) {
      deleteObra(id)
    }
  }

  const resetForm = () => {
    setFormData({ nome: '', cidade: '', ativo: true })
    setEditingObra(null)
    setShowForm(false)
  }

  const filteredObras = obras.filter(obra =>
    obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (obra.cidade && obra.cidade.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Building2 className="mr-3 h-8 w-8 text-blue-600" />
              Gerir Obras
            </h1>
            <p className="text-gray-600 mt-2">Registo e controlo de obras</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Nova Obra
          </Button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Procurar obras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingObra ? 'Editar Obra' : 'Nova Obra'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome da Obra</label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Obra Residencial Centro"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cidade</label>
                <Input
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  placeholder="Ex: São Paulo"
                  required
                />
              </div>
              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="ativo" className="text-sm font-medium">
                  Obra Ativa
                </label>
              </div>
              <div className="flex justify-end space-x-2 md:col-span-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingObra ? 'Atualizar' : 'Criar Obra'}
                </Button>
              </div>
            </form>
        </DialogContent>
      </Dialog>
      

      <Card>
        <CardHeader>
          <CardTitle>Obras Registadas ({filteredObras.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredObras.map((obra) => (
                <TableRow key={obra.id}>
                  <TableCell className="font-medium">{obra.nome}</TableCell>
                  <TableCell>{obra.cidade}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      obra.ativo 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {obra.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(obra.criadoEm)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(obra)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(obra.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredObras.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhuma obra encontrada' : 'Nenhuma obra registada'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ObrasManager
