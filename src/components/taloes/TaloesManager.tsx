import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, FileText, Search, Printer, Undo2, CheckCircle } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatDate, toBRL, qtdLiquidaItem } from '@/lib/helpers'
import { Talao, ItemTal, TalaoStatus } from '@/types'
import SignaturePad from '@/components/ui/signature-pad'

const TaloesManager: React.FC = () => {
  const { 
    taloes, obras, produtos, addTalao, updateTalao, deleteTalao, 
    concluirEntrega, registrarDevolucao 
  } = useStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [obraFilter, setObraFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showEntregaForm, setShowEntregaForm] = useState(false)
  const [showDevolucaoForm, setShowDevolucaoForm] = useState(false)
  const [editingTalao, setEditingTalao] = useState<Talao | null>(null)
  const [entregaTalao, setEntregaTalao] = useState<Talao | null>(null)
  const [devolucaoItem, setDevolucaoItem] = useState<{ talao: Talao; item: ItemTal } | null>(null)
  
  const [formData, setFormData] = useState({
    obraId: '',
    solicitante: '',
    itens: [] as Omit<ItemTal, 'id'>[]
  })
  
  const [entregaData, setEntregaData] = useState({
    itens: [] as { id: string; qtdEntregue: number }[],
    assinatura: {
      nomeRecebedor: '',
      cpf: '',
      imageDataUrl: ''
    }
  })
  
  const [devolucaoData, setDevolucaoData] = useState({
    qtd: 0,
    motivo: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const itensComId = formData.itens.map(item => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9)
    }))
    
    if (editingTalao) {
      updateTalao(editingTalao.id, { ...formData, itens: itensComId })
    } else {
      addTalao({ ...formData, itens: itensComId, status: 'A separar' })
    }
    resetForm()
  }

  const handleEntregaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!entregaTalao) return

    // Atualizar quantidades entregues
    const itensAtualizados = entregaTalao.itens.map(item => {
      const entregaItem = entregaData.itens.find(e => e.id === item.id)
      return entregaItem ? { ...item, qtdEntregue: entregaItem.qtdEntregue } : item
    })

    updateTalao(entregaTalao.id, { itens: itensAtualizados })
    
    // Se todos os itens foram entregues, concluir
    const todosEntregues = itensAtualizados.every(item => (item.qtdEntregue || 0) >= item.qtd)
    if (todosEntregues) {
      concluirEntrega(entregaTalao.id, {
        ...entregaData.assinatura,
        dataHora: new Date().toISOString()
      })
    }

    setShowEntregaForm(false)
    setEntregaTalao(null)
    setEntregaData({ itens: [], assinatura: { nomeRecebedor: '', cpf: '', imageDataUrl: '' } })
  }

  const handleDevolucaoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!devolucaoItem) return

    try {
      registrarDevolucao({
        talaoId: devolucaoItem.talao.id,
        itemTalId: devolucaoItem.item.id,
        qtd: devolucaoData.qtd,
        motivo: devolucaoData.motivo
      })
      
      setShowDevolucaoForm(false)
      setDevolucaoItem(null)
      setDevolucaoData({ qtd: 0, motivo: '' })
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao registrar devoluÃ§Ã£o')
    }
  }

  const handleEdit = (talao: Talao) => {
    setEditingTalao(talao)
    setFormData({
      obraId: talao.obraId,
      solicitante: talao.solicitante,
      itens: talao.itens.map(({ id, ...item }) => item)
    })
    setShowForm(true)
  }

  const handleEntrega = (talao: Talao) => {
    setEntregaTalao(talao)
    setEntregaData({
      itens: talao.itens.map(item => ({ id: item.id, qtdEntregue: item.qtdEntregue || 0 })),
      assinatura: { nomeRecebedor: '', cpf: '', imageDataUrl: '' }
    })
    setShowEntregaForm(true)
  }

  const handleDevolucao = (talao: Talao, item: ItemTal) => {
    setDevolucaoItem({ talao, item })
    setDevolucaoData({ qtd: 0, motivo: '' })
    setShowDevolucaoForm(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este talÃ£o?')) {
      deleteTalao(id)
    }
  }

  const resetForm = () => {
    setFormData({ obraId: '', solicitante: '', itens: [] })
    setEditingTalao(null)
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
        origem: 'estoque',
        precoUnit: 0
      }]
    })
  }

  const updateItem = (index: number, item: Partial<Omit<ItemTal, 'id'>>) => {
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

  const filteredTaloes = taloes.filter(talao => {
    const matchesSearch = talao.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         talao.solicitante.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesObra = !obraFilter || obraFilter === '__ALL_OBRAS__' || talao.obraId === obraFilter
    const matchesStatus = !statusFilter || statusFilter === '__ALL_STATUS__' || talao.status === statusFilter
    
    return matchesSearch && matchesObra && matchesStatus
  })

  const getStatusColor = (status: TalaoStatus) => {
    switch (status) {
      case 'A separar': return 'bg-yellow-100 text-yellow-800'
      case 'Em entrega': return 'bg-blue-100 text-blue-800'
      case 'ConcluÃ­do': return 'bg-green-100 text-green-800'
      case 'Devolvido Parcial': return 'bg-orange-100 text-orange-800'
      case 'Devolvido Total': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="mr-3 h-8 w-8 text-blue-600" />
              Gerenciar TalÃµes
            </h1>
            <p className="text-gray-600 mt-2">Controle de talÃµes digitais</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo TalÃ£o
          </Button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar talÃµes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={obraFilter} onValueChange={setObraFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todas as obras" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL_OBRAS__">Todas as obras</SelectItem>
              {obras.map(obra => (
                <SelectItem key={obra.id} value={obra.id}>{obra.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL_STATUS__">Todos os status</SelectItem>
              <SelectItem value="A separar">A separar</SelectItem>
              <SelectItem value="Em entrega">Em entrega</SelectItem>
              <SelectItem value="ConcluÃ­do">ConcluÃ­do</SelectItem>
              <SelectItem value="Devolvido Parcial">Devolvido Parcial</SelectItem>
              <SelectItem value="Devolvido Total">Devolvido Total</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTalao ? 'Editar TalÃ£o' : 'Novo TalÃ£o'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Obra</label>
                <Select value={formData.obraId} onValueChange={(value) => setFormData({ ...formData, obraId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a obra" />
                  </SelectTrigger>
                  <SelectContent>
                    {obras.filter(o => o.ativo).map(obra => (
                      <SelectItem key={obra.id} value={obra.id}>{obra.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Solicitante</label>
                <Input
                  value={formData.solicitante}
                  onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                  placeholder="Nome do solicitante"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Itens do TalÃ£o</h3>
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
                            unidade: produto?.unidade || '',
                            precoUnit: produto?.preco || 0
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
                        value={item.descricaoLivre || ''}
                        onChange={(e) => updateItem(index, { descricaoLivre: e.target.value })}
                        placeholder="DescriÃ§Ã£o livre"
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
                      <label className="block text-sm font-medium mb-2">Origem</label>
                      <Select 
                        value={item.origem} 
                        onValueChange={(value: 'estoque' | 'compra_externa') => updateItem(index, { origem: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="estoque">Estoque</SelectItem>
                          <SelectItem value="compra_externa">Compra Externa</SelectItem>
                        </SelectContent>
                      </Select>
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
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingTalao ? 'Atualizar' : 'Criar TalÃ£o'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Entrega Dialog */}
      <Dialog open={showEntregaForm} onOpenChange={setShowEntregaForm}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Entrega - {entregaTalao?.numero}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEntregaSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Itens para Entrega</h3>
              {entregaTalao?.itens.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <div>
                      <p className="font-medium">{item.descricaoLivre}</p>
                      <p className="text-sm text-gray-600">Solicitado: {item.qtd} {item.unidade}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">JÃ¡ entregue: {item.qtdEntregue || 0}</p>
                      <p className="text-sm text-gray-600">Devolvido: {item.qtdDevolvida || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Qtd a Entregar</label>
                      <Input
                        type="number"
                        value={entregaData.itens.find(e => e.id === item.id)?.qtdEntregue || 0}
                        onChange={(e) => {
                          const qtd = parseInt(e.target.value) || 0
                          setEntregaData({
                            ...entregaData,
                            itens: entregaData.itens.map(ei => 
                              ei.id === item.id ? { ...ei, qtdEntregue: qtd } : ei
                            )
                          })
                        }}
                        max={item.qtd - (item.qtdEntregue || 0)}
                        min="0"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">LÃ­quido: {qtdLiquidaItem(item)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Recebedor</label>
                <Input
                  value={entregaData.assinatura.nomeRecebedor}
                  onChange={(e) => setEntregaData({
                    ...entregaData,
                    assinatura: { ...entregaData.assinatura, nomeRecebedor: e.target.value }
                  })}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CPF (opcional)</label>
                <Input
                  value={entregaData.assinatura.cpf}
                  onChange={(e) => setEntregaData({
                    ...entregaData,
                    assinatura: { ...entregaData.assinatura, cpf: e.target.value }
                  })}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Assinatura Digital</label>
              <SignaturePad
                onSave={(dataUrl) => setEntregaData({
                  ...entregaData,
                  assinatura: { ...entregaData.assinatura, imageDataUrl: dataUrl }
                })}
                onClear={() => setEntregaData({
                  ...entregaData,
                  assinatura: { ...entregaData.assinatura, imageDataUrl: '' }
                })}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEntregaForm(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Registrar Entrega
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DevoluÃ§Ã£o Dialog */}
      <Dialog open={showDevolucaoForm} onOpenChange={setShowDevolucaoForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar DevoluÃ§Ã£o</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDevolucaoSubmit} className="space-y-4">
            <div>
              <p className="font-medium">{devolucaoItem?.item.descricaoLivre}</p>
              <p className="text-sm text-gray-600">
                Entregue: {devolucaoItem?.item.qtdEntregue || 0} | 
                Devolvido: {devolucaoItem?.item.qtdDevolvida || 0} | 
                DisponÃ­vel: {(devolucaoItem?.item.qtdEntregue || 0) - (devolucaoItem?.item.qtdDevolvida || 0)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quantidade a Devolver</label>
              <Input
                type="number"
                value={devolucaoData.qtd}
                onChange={(e) => setDevolucaoData({ ...devolucaoData, qtd: parseInt(e.target.value) || 0 })}
                max={(devolucaoItem?.item.qtdEntregue || 0) - (devolucaoItem?.item.qtdDevolvida || 0)}
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Motivo da DevoluÃ§Ã£o</label>
              <Input
                value={devolucaoData.motivo}
                onChange={(e) => setDevolucaoData({ ...devolucaoData, motivo: e.target.value })}
                placeholder="Ex: Material com defeito, Sobra de obra"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowDevolucaoForm(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Registrar DevoluÃ§Ã£o
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>TalÃµes Cadastrados ({filteredTaloes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NÃºmero</TableHead>
                <TableHead>Obra</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>AÃ§Ãµes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTaloes.map((talao) => {
                const obra = obras.find(o => o.id === talao.obraId)
                return (
                  <TableRow key={talao.id}>
                    <TableCell className="font-medium">{talao.numero}</TableCell>
                    <TableCell>{obra?.nome || 'N/A'}</TableCell>
                    <TableCell>{talao.solicitante}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(talao.status)}`}>
                        {talao.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {talao.itens.map(item => (
                          <div key={item.id} className="text-xs">
                            <span className="font-medium">{item.descricaoLivre}</span>
                            <div className="text-gray-500">
                              Env: {item.qtd} | Ent: {item.qtdEntregue || 0} | Dev: {item.qtdDevolvida || 0} | LÃ­q: {qtdLiquidaItem(item)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(talao.criadoEm)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(talao)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {talao.status !== 'ConcluÃ­do' && (
                          <Button variant="outline" size="sm" onClick={() => handleEntrega(talao)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Printer className="h-4 w-4" />
                        </Button>
                        {talao.itens.some(item => (item.qtdEntregue || 0) > (item.qtdDevolvida || 0)) && (
                          <div className="relative group">
                            <Button variant="outline" size="sm">
                              <Undo2 className="h-4 w-4" />
                            </Button>
                            <div className="absolute top-8 left-0 bg-white border rounded shadow-lg p-2 hidden group-hover:block z-10">
                              {talao.itens.filter(item => (item.qtdEntregue || 0) > (item.qtdDevolvida || 0)).map(item => (
                                <Button
                                  key={item.id}
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-xs"
                                  onClick={() => handleDevolucao(talao, item)}
                                >
                                  Devolver: {item.descricaoLivre}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(talao.id)}
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
          
          {filteredTaloes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhum talÃ£o encontrado' : 'Nenhum talÃ£o cadastrado'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TaloesManager
