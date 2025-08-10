import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Package, Search, Upload, TrendingUp } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { toBRL } from '@/lib/helpers'
import { Produto } from '@/types'

const ProdutosManager: React.FC = () => {
  const { produtos, addProduto, updateProduto, deleteProduto, ajusteEstoque } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos')
  const [showForm, setShowForm] = useState(false)
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)
  const [showAjusteForm, setShowAjusteForm] = useState(false)
  const [ajusteProduto, setAjusteProduto] = useState<Produto | null>(null)

  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    unidade: '',
    sku: '',
    preco: 0,
    estoque: 0,
    ativo: true
  })

  const [ajusteData, setAjusteData] = useState({
    delta: 0,
    motivo: ''
  })

  const resetForm = () => {
    setFormData({
      nome: '',
      categoria: '',
      unidade: '',
      sku: '',
      preco: 0,
      estoque: 0,
      ativo: true
    })
    setEditingProduto(null)
    setShowForm(false)
  }

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

  const filteredProdutos = produtos.filter((p) => {
    const matchesSearch =
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter ? p.categoria === categoryFilter : true
    const matchesStatus =
      statusFilter === 'todos' ? true : statusFilter === 'ativos' ? p.ativo : !p.ativo

    return matchesSearch && matchesCategory && matchesStatus
  })

  const categorias = [...new Set(produtos.map(p => p.categoria).filter(Boolean))]

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Package className="mr-3 h-8 w-8 text-blue-600" />
              Gerenciar Produtos
            </h1>
            <p className="text-gray-600 mt-2">Cadastro, edição, estoque e análise de produtos.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou SKU..."
                className="pl-9 w-[280px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {categorias.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativos">Ativos</SelectItem>
                <SelectItem value="inativos">Inativos</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={showForm} onOpenChange={(o) => { setShowForm(o); if (!o) setEditingProduto(null) }}>
              <DialogTrigger asChild>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Button>
              </DialogTrigger>

              {/* Form Dialog */}
              <DialogContent className="p-6 sm:max-w-2xl rounded-2xl border border-slate-200 bg-card text-card-foreground shadow-xl ring-1 ring-black/8 dark:border-neutral-800 dark:ring-white/10">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduto ? 'Editar Produto' : 'Novo Produto'}
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Nome do Produto</label>
                    <Input
                      placeholder="Ex: Cimento CP II-E-32"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Categoria</label>
                    <Input
                      placeholder="Ex: Materiais Básicos"
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Unidade</label>
                    <Input
                      placeholder="Ex: SC, M³, KG"
                      value={formData.unidade}
                      onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">SKU</label>
                    <Input
                      placeholder="Ex: CIM001"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Preço Unitário</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Estoque Inicial</label>
                    <Input
                      type="number"
                      value={formData.estoque}
                      onChange={(e) => setFormData({ ...formData, estoque: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center gap-2 mt-2">
                    <input
                      id="ativo"
                      type="checkbox"
                      className="h-4 w-4"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    />
                    <label htmlFor="ativo" className="text-sm">Produto Ativo</label>
                  </div>

                  <div className="md:col-span-2 flex items-center justify-end gap-3 mt-2">
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
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Upload className="h-4 w-4" />
          <span>Importe planilhas de produtos em breve</span>
          <TrendingUp className="h-4 w-4 ml-3" />
          <span>Relatórios e gráficos de consumo por obra (em breve)</span>
        </div>
      </div>

      {/* Ajuste de Estoque */}
      <Dialog open={showAjusteForm} onOpenChange={(o) => { setShowAjusteForm(o); if (!o) setAjusteProduto(null) }}>
        <DialogContent className="p-6 sm:max-w-md rounded-2xl border border-slate-200 bg-card text-card-foreground shadow-xl ring-1 ring-black/8 dark:border-neutral-800 dark:ring-white/10">
          <DialogHeader>
            <DialogTitle>
              Ajuste de Estoque — {ajusteProduto?.nome}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAjusteSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Quantidade (use negativo para saída)</label>
              <Input
                type="number"
                value={ajusteData.delta}
                onChange={(e) => setAjusteData({ ...ajusteData, delta: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Motivo</label>
              <Input
                placeholder="Ex: correção de inventário"
                value={ajusteData.motivo}
                onChange={(e) => setAjusteData({ ...ajusteData, motivo: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAjusteForm(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Ajustar Estoque
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-xl ring-1 ring-black/8">
        <CardHeader>
          <CardTitle>Produtos Cadastrados ({filteredProdutos.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProdutos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nome}</TableCell>
                  <TableCell>{p.categoria}</TableCell>
                  <TableCell>{p.sku}</TableCell>
                  <TableCell>{p.unidade}</TableCell>
                  <TableCell>{toBRL(p.preco)}</TableCell>
                  <TableCell className="text-green-600 font-semibold">{p.estoque}</TableCell>
                  <TableCell>
                    {p.ativo ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Ativo</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">Inativo</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => { setEditingProduto(p); setFormData({
                        nome: p.nome, categoria: p.categoria, unidade: p.unidade, sku: p.sku, preco: p.preco, estoque: p.estoque, ativo: p.ativo
                      }); setShowForm(true) }}>
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button variant="outline" size="icon" onClick={() => { setAjusteProduto(p); setShowAjusteForm(true) }}>
                        <Package className="h-4 w-4" />
                      </Button>

                      <Button variant="destructive" size="icon" onClick={() => deleteProduto(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filteredProdutos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProdutosManager
