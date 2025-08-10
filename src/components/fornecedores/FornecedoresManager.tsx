import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Truck, Search } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Fornecedor } from '@/types'

const FornecedoresManager: React.FC = () => {
  const { fornecedores, addFornecedor, updateFornecedor, deleteFornecedor } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    cnpjCpf: '',
    contato: '',
    ativo: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingFornecedor) {
      updateFornecedor(editingFornecedor.id, formData)
    } else {
      addFornecedor(formData)
    }
    resetForm()
  }

  const handleEdit = (fornecedor: Fornecedor) => {
    setEditingFornecedor(fornecedor)
    setFormData({
      nome: fornecedor.nome,
      cnpjCpf: fornecedor.cnpjCpf || '',
      contato: fornecedor.contato || '',
      ativo: fornecedor.ativo
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      deleteFornecedor(id)
    }
  }

  const resetForm = () => {
    setFormData({ nome: '', cnpjCpf: '', contato: '', ativo: true })
    setEditingFornecedor(null)
    setShowForm(false)
  }

  const filteredFornecedores = fornecedores.filter(fornecedor =>
    fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fornecedor.cnpjCpf && fornecedor.cnpjCpf.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Truck className="mr-3 h-8 w-8 text-blue-600" />
              Gerir Fornecedores
            </h1>
            <p className="text-gray-600 mt-2">Registo e controlo de fornecedores</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Fornecedor
          </Button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Procurar fornecedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Fornecedor</label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Construtora ABC Ltda"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CNPJ/CPF</label>
              <Input
                value={formData.cnpjCpf}
                onChange={(e) => setFormData({ ...formData, cnpjCpf: e.target.value })}
                placeholder="Ex: 12.345.678/0001-90"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contacto</label>
              <Input
                value={formData.contato}
                onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                placeholder="Ex: (11) 98765-4321"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="ativo" className="text-sm font-medium">
                Fornecedor Ativo
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingFornecedor ? 'Atualizar' : 'Criar Fornecedor'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Fornecedores Registados ({filteredFornecedores.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ/CPF</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFornecedores.map((fornecedor) => (
                <TableRow key={fornecedor.id}>
                  <TableCell className="font-medium">{fornecedor.nome}</TableCell>
                  <TableCell>{fornecedor.cnpjCpf || '-'}</TableCell>
                  <TableCell>{fornecedor.contato || '-'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      fornecedor.ativo 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(fornecedor)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(fornecedor.id)}
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
          
          {filteredFornecedores.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor registado'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default FornecedoresManager
