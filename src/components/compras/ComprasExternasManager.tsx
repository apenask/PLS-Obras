import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, ShoppingCart, Search, Paperclip } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatDate, toBRL } from '@/lib/helpers'
import { CompraExterna, ItemCompra } from '@/types'

const ComprasExternasManager: React.FC = () => {
  const { 
    compras, fornecedores, produtos, addCompraExterna, updateCompraExterna, 
    deleteCompraExterna, aplicarMarkup 
  } = useStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [fornecedorFilter, setFornecedorFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCompra, setEditingCompra] = useState<CompraExterna | null>(null)
  
  const [formData, setFormData] = useState({
    fornecedorId: '',
    numeroNota: '',
    data: new Date().toISOString().split('T')[0],
    anexos: [] as { nome: string; mime: string; dataUrl: string }[],
    itens: [] as Omit<ItemCompra, 'id' | 'precoUnitObra'>[]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Calcular preÃ§os com markup
    const itensComPreco = formData.itens.map(item => {
      const produto = produtos.find(p => p.id === item.produtoId)
      const precoUnitObra = aplicarMarkup({
        categoria: produto?.categoria,
        custoUnit: item.custoUnit
      })
      
      return {
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        markupAplicado: (precoUnitObra - item.custoUnit) / item.custoUnit,
        precoUnitObra
      }
    })
    
    if (editingCompra) {
      updateCompraExterna(editingCompra.id, { ...formData, itens: itensComPreco })
    } else {
      addCompraExterna({ ...formData, itens: itensComPreco })
    }
    resetForm()
  }

  const handleEdit = (compra: CompraExterna) => {
    setEditingCompra(compra)
    setFormData({
      fornecedorId: compra.fornecedorId,
      numeroNota: compra.numeroNota || '',
      data: compra.data,
      anexos: compra.anexos || [],
      itens: compra.itens.map(({ id, precoUnitObra, ...item }) => item)
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta compra?')) {
      deleteCompraExterna(id)
    }
  }

  const resetForm = () => {
    setFormData({
      fornecedorId: '',
      numeroNota: '',
      data: new Date().toISOString().split('T')[0],
      anexos: [],
      itens: []
    })
    setEditingCompra(null)
    setShowForm(false)
  }

  const addItem = () => {
    setFormData({
      ...formData,
      itens: [...formData.itens, {
        produtoId: '',
        descricaoLivre: '',
        qtd: 1,
        unidade: '',
        custoUnit: 0,
        markupAplicado: 0.2
      }]
    })
  }

  const updateItem = (index: number, item: Partial<Omit<ItemCompra, 'id' | 'precoUnitObra'>>) => {
    const novosItens = [...formData.itens]
    novosItens[index] = { ...novosItens[index], ...item }
    setFormData({ ...formData, itens: novosItens })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      itens: formData.itens.filter((_, i) => i !== index)
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setFormData({
          ...formData,
          anexos: [...formData.anexos, {
            nome: file.name,
            mime: file.type,
            dataUrl
          }]
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const filteredCompras = compras.filter(compra => {
    const fornecedor = fornecedores.find(f => f.id === compra.fornecedorId)
    const matchesSearch = (compra.numeroNota && compra.numeroNota.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (fornecedor && fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFornecedor = !fornecedorFilter || fornecedorFilter === '__ALL_FORNECEDORES__' || compra.fornecedorId === fornecedorFilter
    
    return matchesSearch && matchesFornecedor
  })

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ShoppingCart className="mr-3 h-8 w-8 text-blue-600" />
              Compras Externas
            </h1>
            <p className="text-gray-600 mt-2">Gerenciamento de compras externas</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Compra
          </Button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar compras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={fornecedorFilter} onValueChange={setFornecedorFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os fornecedores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL_FORNECEDORES__">Todos os fornecedores</SelectItem>
              {fornecedores.map(fornecedor => (
                <SelectItem key={fornecedor.id} value={fornecedor.id}>{fornecedor.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCompra ? 'Editar Compra Externa' : 'Nova Compra Externa'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Fornecedor</label>
                <Select value={formData.fornecedorId} onValueChange={(value) => setFormData({ ...formData, fornecedorId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedores.filter(f => f.ativo).map(fornecedor => (
                      <SelectItem key={fornecedor.id} value={fornecedor.id}>{fornecedor.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">NÃºmero da Nota</label>
                <Input
                  value={formData.numeroNota}
                  onChange={(e) => setFormData({ ...formData, numeroNota: e.target.value })}
                  placeholder="Ex: NF-12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Data</label>
                <Input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Anexos</label>
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                <Paperclip className="h-4 w-4 text-gray-400" />
              </div>
              {formData.anexos.length > 0 && (
                <div className="mt-2 space-y-1">
                  {formData.anexos.map((anexo, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                      <span>{anexo.nome}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({
                          ...formData,
                          anexos: formData.anexos.filter((_, i) => i !== index)
                        })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Itens da Compra</h3>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Item
                </Button>
              </div>
              
              {formData.itens.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-6 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Produto</label>
                      <Select 
                        value={item.produtoId || ''} 
                        onValueChange={(value) => {
                          const produto = produtos.find(p => p.id === value)
                          updateItem(index, {
                            produtoId: value,
                            descricaoLivre: produto?.nome || '',
                            unidade: produto?.unidade || ''
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {produtos.filter(p => p.ativo).map(produto => (
                            <SelectItem key={produto.id} value={produto.id}>
                              {produto.nome} ({produto.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">DescriÃ§Ã£o</label>
                      <Input
                        value={item.descricaoLivre}
                        onChange={(e) => updateItem(index, { descricaoLivre: e.target.value })}
                        placeholder="DescriÃ§Ã£o do item"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Qtd</label>
                      <Input
                        type="number"
                        value={item.qtd}
                        onChange={(e) => updateItem(index, { qtd: parseInt(e.target.value) || 0 })}
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Unidade</label>
                      <Input
                        value={item.unidade}
                        onChange={(e) => updateItem(index, { unidade: e.target.value })}
                        placeholder="UN, KG, MÂ³"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Custo Unit.</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.custoUnit}
                        onChange={(e) => updateItem(index, { custoUnit: parseFloat(e.target.value) || 0 })}
                        min="0"
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    PreÃ§o para obra (com markup): {toBRL(aplicarMarkup({ custoUnit: item.custoUnit }))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingCompra ? 'Atualizar' : 'Criar Compra'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Compras Cadastradas ({filteredCompras.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>NÂº Nota</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Total Custo</TableHead>
                <TableHead>Total Receita</TableHead>
                <TableHead>Anexos</TableHead>
                <TableHead>AÃ§Ãµes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompras.map((compra) => {
                const fornecedor = fornecedores.find(f => f.id === compra.fornecedorId)
                const totalCusto = compra.itens.reduce((sum, item) => sum + (item.qtd * item.custoUnit), 0)
                const totalReceita = compra.itens.reduce((sum, item) => sum + (item.qtd * item.precoUnitObra), 0)
                
                return (
                  <TableRow key={compra.id}>
                    <TableCell className="font-medium">{fornecedor?.nome || 'N/A'}</TableCell>
                    <TableCell>{compra.numeroNota || '-'}</TableCell>
                    <TableCell>{formatDate(compra.data)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {compra.itens.map(item => (
                          <div key={item.id} className="text-xs">
                            <span className="font-medium">{item.descricaoLivre}</span>
                            <div className="text-gray-500">
                              {item.qtd} {item.unidade} Ã— {toBRL(item.custoUnit)} = {toBRL(item.qtd * item.custoUnit)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-red-600">{toBRL(totalCusto)}</TableCell>
                    <TableCell className="font-medium text-green-600">{toBRL(totalReceita)}</TableCell>
                    <TableCell>
                      {compra.anexos && compra.anexos.length > 0 ? (
                        <span className="text-blue-600">{compra.anexos.length} arquivo(s)</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(compra)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(compra.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {filteredCompras.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhuma compra encontrada' : 'Nenhuma compra cadastrada'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ComprasExternasManager
