import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Package, Search, Upload, TrendingUp } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { toBRL } from '@/lib/helpers'
import { Produto } from '@/types'

const ProdutosManager: React.FC = () => {
  const { produtos, addProduto, updateProduto, deleteProduto, ajusteEstoque } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showAjusteForm, setShowAjusteForm] = useState(false)
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)
  const [ajusteProduto, setAjusteProduto] = useState<Produto | null>(null)
  
  const initialFormData = {
    nome: '',
    categoria: '',
    unidade: '',
    sku: '',
    preco: 0,
    estoque: 0,
    tipo: 'revenda' as 'interno' | 'revenda',
    ativo: true
  }
  const [formData, setFormData] = useState(initialFormData)
  
  const [ajusteData, setAjusteData] = useState({
    delta: 0,
    motivo: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingProduto) {
      updateProduto(editingProduto.id, formData)
    } else {
      addProduto(formData)
    }
    resetForm()
  }

  const handleAjusteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (ajusteProduto) {
      ajusteEstoque(ajusteProduto.id, ajusteData.delta, ajusteData.motivo)
      setShowAjusteForm(false)
      setAjusteProduto(null)
      setAjusteData({ delta: 0, motivo: '' })
    }
  }

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto)
    setFormData({
      nome: produto.nome,
      categoria: produto.categoria || '',
      unidade: produto.unidade,
      sku: produto.sku || '',
      preco: produto.preco || 0,
      estoque: produto.estoque || 0,
      tipo: produto.tipo || 'revenda',
      ativo: produto.ativo
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduto(id)
    }
  }

  const handleAjusteEstoque = (produto: Produto) => {
    setAjusteProduto(produto)
    setShowAjusteForm(true)
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setEditingProduto(null)
    setShowForm(false)
  }

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (produto.sku && produto.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !categoryFilter || categoryFilter === '__ALL_CATEGORIES__' || produto.categoria === categoryFilter
    const matchesStatus = !statusFilter || statusFilter === '__ALL_STATUS__' || 
                         (statusFilter === 'ativo' && produto.ativo) ||
                         (statusFilter === 'inativo' && !produto.ativo)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const categorias = [...new Set(produtos.map(p => p.categoria).filter(Boolean))]

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Package className="mr-3 h-8 w-8 text-blue-600" />
              Gerir Produtos
            </h1>
            <p className="text-gray-600 mt-2">Registo e controlo de produtos</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Importar CSV
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Procurar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL_CATEGORIES__">Todas as categorias</SelectItem>
              {categorias.map(categoria => (
                <SelectItem key={categoria} value={categoria!}>{categoria}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL_STATUS__">Todos</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduto ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Produto</label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Cimento CP II-E-32"
                required
              />
            </div>
             <div>
              <label className="block text-sm font-medium mb-2">Tipo de Produto</label>
              <Select value={formData.tipo} onValueChange={(value: 'interno' | 'revenda') => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenda">Revenda (compra externa)</SelectItem>
                  <SelectItem value="interno">Interno (produção própria)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <Input
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                placeholder="Ex: Materiais Básicos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Unidade</label>
              <Input
                value={formData.unidade}
                onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                placeholder="Ex: SC, M³, KG"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">SKU</label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Ex: CIM001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Preço de Custo / Venda</label>
              <Input
                type="number"
                step="0.01"
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Stock Inicial</label>
              <Input
                type="number"
                value={formData.estoque}
                onChange={(e) => setFormData({ ...formData, estoque: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="flex items-center space-x-2 col-span-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="ativo" className="text-sm font-medium">
                Produto Ativo
              </label>
            </div>
            <div className="flex justify-end space-x-2 col-span-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingProduto ? 'Atualizar' : 'Criar Produto'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ajuste Estoque Dialog */}
      <Dialog open={showAjusteForm} onOpenChange={setShowAjusteForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Stock - {ajusteProduto?.nome}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAjusteSubmit} className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Stock Atual</label>
              <Input value={ajusteProduto?.estoque || 0} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quantidade (+ entrada / - saída)</label>
              <Input
                type="number"
                value={ajusteData.delta}
                onChange={(e) => setAjusteData({ ...ajusteData, delta: parseInt(e.target.value) || 0 })}
                placeholder="Ex: +50 ou -20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Motivo</label>
              <Input
                value={ajusteData.motivo}
                onChange={(e) => setAjusteData({ ...ajusteData, motivo: e.target.value })}
                placeholder="Ex: Compra, Venda, Correção"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowAjusteForm(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Ajustar Stock
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Produtos Registados ({filteredProdutos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProdutos.map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell className="font-medium">{produto.nome}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      produto.tipo === 'interno' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {produto.tipo === 'interno' ? 'Interno' : 'Revenda'}
                    </span>
                  </TableCell>
                  <TableCell>{produto.categoria || '-'}</TableCell>
                  <TableCell>{produto.sku || '-'}</TableCell>
                  <TableCell>{produto.unidade}</TableCell>
                  <TableCell>{produto.preco ? toBRL(produto.preco) : '-'}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      (produto.estoque || 0) <= 10 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {produto.estoque || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      produto.ativo 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(produto)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAjusteEstoque(produto)}
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(produto.id)}
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
          
          {filteredProdutos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto registado'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ProdutosManager
