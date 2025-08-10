import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Plus, Edit, Trash2, Download, Upload, Percent } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { RegraMarkup } from '@/types'
import { initSupabase, testConnection, syncToSupabase, syncFromSupabase } from "@/lib/supabase";

const ConfiguracoesManager: React.FC = () => {
  const { 
    regrasMarkup, obras, config, addRegraMarkup, updateRegraMarkup, 
    deleteRegraMarkup, updateConfig, exportData, importData 
  } = useStore()
  
  const [showMarkupForm, setShowMarkupForm] = useState(false)
  const [editingRegra, setEditingRegra] = useState<RegraMarkup | null>(null)
  const [markupFormData, setMarkupFormData] = useState({
    alvo: 'global' as 'global' | 'categoria' | 'obra',
    ref: '',
    percentual: 0.2
  })
  
  // Estados para Supabase
  const [supabaseConfig, setSupabaseConfig] = useState({
    url: config.supabase?.url || '',
    anonKey: config.supabase?.anonKey || '',
    enabled: config.supabase?.enabled || false
  })
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [syncing, setSyncing] = useState(false)
  const [syncResults, setSyncResults] = useState<any>(null)

  const handleMarkupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingRegra) {
      updateRegraMarkup(editingRegra.id, markupFormData)
    } else {
      addRegraMarkup(markupFormData)
    }
    resetMarkupForm()
  }

  const handleEditMarkup = (regra: RegraMarkup) => {
    setEditingRegra(regra)
    setMarkupFormData({
      alvo: regra.alvo,
      ref: regra.ref || '',
      percentual: regra.percentual
    })
    setShowMarkupForm(true)
  }

  const handleDeleteMarkup = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta regra?')) {
      deleteRegraMarkup(id)
    }
  }

  const resetMarkupForm = () => {
    setMarkupFormData({ alvo: 'global', ref: '', percentual: 0.2 })
    setEditingRegra(null)
    setShowMarkupForm(false)
  }

  const handleExportData = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pls-obras-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const jsonData = event.target?.result as string
        importData(jsonData)
        alert('Dados importados com sucesso!')
      } catch (error) {
        alert('Erro ao importar dados. Verifique se o arquivo está correto.')
      }
    }
    reader.readAsText(file)
  }

  const handleSupabaseConfigSave = () => {
    updateConfig({
      supabase: {
        ...supabaseConfig,
        lastSync: config.supabase?.lastSync
      }
    })
    
    if (supabaseConfig.enabled && supabaseConfig.url && supabaseConfig.anonKey) {
      try {
        initSupabase(supabaseConfig.url, supabaseConfig.anonKey)
        alert('Configuração do Supabase salva com sucesso!')
      } catch (error) {
        alert('Erro na configuração do Supabase. Verifique os dados.')
      }
    }
  }

  const handleTestConnection = async () => {
    if (!supabaseConfig.url || !supabaseConfig.anonKey) {
      alert('Preencha a URL e a chave da API primeiro')
      return
    }

    setTestingConnection(true)
    setConnectionStatus('idle')
    
    try {
      initSupabase(supabaseConfig.url, supabaseConfig.anonKey)
      const success = await testConnection()
      
      if (success) {
        setConnectionStatus('success')
      } else {
        setConnectionStatus('error')
      }
    } catch (error) {
      setConnectionStatus('error')
    } finally {
      setTestingConnection(false)
    }
  }

  const handleCreateTables = async () => {
    if (!supabaseConfig.enabled) {
      alert('Configure e ative o Supabase primeiro')
      return
    }

    try {
      await createSupabaseTables()
      alert('Tabelas criadas com sucesso no Supabase!')
    } catch (error) {
      alert('Erro ao criar tabelas. Verifique as permissões no Supabase.')
    }
  }

  const handleSyncToSupabase = async () => {
    if (!supabaseConfig.enabled) {
      alert('Configure e ative o Supabase primeiro')
      return
    }

    setSyncing(true)
    setSyncResults(null)
    
    try {
      const results = await syncToSupabase()
      setSyncResults(results)
      alert('Sincronização para Supabase concluída!')
    } catch (error) {
      alert('Erro na sincronização: ' + (error as Error).message)
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncFromSupabase = async () => {
    if (!supabaseConfig.enabled) {
      alert('Configure e ative o Supabase primeiro')
      return
    }

    setSyncing(true)
    setSyncResults(null)
    
    try {
      const results = await syncFromSupabase()
      setSyncResults(results)
      alert('Sincronização do Supabase concluída!')
    } catch (error) {
      alert('Erro na sincronização: ' + (error as Error).message)
    } finally {
      setSyncing(false)
    }
  }

  const categorias = [...new Set(regrasMarkup.filter(r => r.alvo === 'categoria').map(r => r.ref))]

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Settings className="mr-3 h-8 w-8 text-blue-600" />
              Configurações
            </h1>
            <p className="text-gray-600 mt-2">Configurações do sistema</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="markup" className="space-y-6">
        <TabsList>
          <TabsTrigger value="markup">Mark-up</TabsTrigger>
          <TabsTrigger value="tema">Tema</TabsTrigger>
          <TabsTrigger value="backup">Backup/Restore</TabsTrigger>
          <TabsTrigger value="sync">Sincronização</TabsTrigger>
        </TabsList>

        <TabsContent value="markup" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Percent className="mr-2 h-5 w-5" />
                  Regras de Mark-up
                </CardTitle>
                <Button onClick={() => setShowMarkupForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Regra
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead>Percentual</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regrasMarkup.map((regra) => (
                    <TableRow key={regra.id}>
                      <TableCell className="font-medium">
                        {regra.alvo === 'global' && 'Global'}
                        {regra.alvo === 'categoria' && 'Categoria'}
                        {regra.alvo === 'obra' && 'Obra'}
                      </TableCell>
                      <TableCell>
                        {regra.alvo === 'global' ? '-' : regra.ref}
                      </TableCell>
                      <TableCell>
                        {(regra.percentual * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMarkup(regra)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {regra.alvo !== 'global' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteMarkup(regra.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Markup Form Dialog */}
          <Dialog open={showMarkupForm} onOpenChange={setShowMarkupForm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRegra ? 'Editar Regra de Mark-up' : 'Nova Regra de Mark-up'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleMarkupSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <Select 
                    value={markupFormData.alvo} 
                    onValueChange={(value: 'global' | 'categoria' | 'obra') => 
                      setMarkupFormData({ ...markupFormData, alvo: value, ref: '' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="categoria">Por Categoria</SelectItem>
                      <SelectItem value="obra">Por Obra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {markupFormData.alvo === 'categoria' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Categoria</label>
                    <Input
                      value={markupFormData.ref}
                      onChange={(e) => setMarkupFormData({ ...markupFormData, ref: e.target.value })}
                      placeholder="Nome da categoria"
                      required
                    />
                  </div>
                )}

                {markupFormData.alvo === 'obra' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Obra</label>
                    <Select 
                      value={markupFormData.ref} 
                      onValueChange={(value) => setMarkupFormData({ ...markupFormData, ref: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a obra" />
                      </SelectTrigger>
                      <SelectContent>
                        {obras.map(obra => (
                          <SelectItem key={obra.id} value={obra.id}>{obra.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Percentual (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={markupFormData.percentual * 100}
                    onChange={(e) => setMarkupFormData({ 
                      ...markupFormData, 
                      percentual: parseFloat(e.target.value) / 100 || 0 
                    })}
                    placeholder="20.0"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetMarkupForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingRegra ? 'Atualizar' : 'Criar Regra'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="tema" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Tema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tema</label>
                  <Select 
                    value={config.tema} 
                    onValueChange={(value: 'light' | 'dark') => updateConfig({ tema: value })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mark-up Global Padrão (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.markupGlobal * 100}
                    onChange={(e) => updateConfig({ 
                      markupGlobal: parseFloat(e.target.value) / 100 || 0.2 
                    })}
                    className="w-48"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup e Restore</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Exportar Dados</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Faça o download de todos os dados do sistema em formato JSON.
                  </p>
                  <Button onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Backup
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Importar Dados</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Restaure os dados do sistema a partir de um arquivo de backup.
                  </p>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="w-64"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sincronização com Supabase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Configuração */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Configuração</h3>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="supabase-enabled"
                      checked={supabaseConfig.enabled}
                      onChange={(e) => setSupabaseConfig({ ...supabaseConfig, enabled: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="supabase-enabled" className="text-sm font-medium">
                      Ativar sincronização com Supabase
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">URL do Supabase</label>
                    <Input 
                      value={supabaseConfig.url}
                      onChange={(e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
                      placeholder="https://seu-projeto.supabase.co"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Chave da API (anon/public)</label>
                    <Input 
                      type="password"
                      value={supabaseConfig.anonKey}
                      onChange={(e) => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })}
                      placeholder="sua-chave-api-publica"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={handleSupabaseConfigSave}>
                      Salvar Configuração
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleTestConnection}
                      disabled={testingConnection || !supabaseConfig.url || !supabaseConfig.anonKey}
                    >
                      {testingConnection ? 'Testando...' : 'Testar Conexão'}
                    </Button>
                  </div>

                  {connectionStatus === 'success' && (
                    <div className="text-green-600 text-sm">
                      ✅ Conexão com Supabase estabelecida com sucesso!
                    </div>
                  )}
                  
                  {connectionStatus === 'error' && (
                    <div className="text-red-600 text-sm">
                      ❌ Erro na conexão. Verifique a URL e chave da API.
                    </div>
                  )}
                </div>

                {/* Preparação do Banco */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-medium">Preparação do Banco</h3>
                  <p className="text-sm text-gray-600">
                    Antes da primeira sincronização, é necessário criar as tabelas no Supabase.
                  </p>
                  <Button 
                    onClick={handleCreateTables}
                    disabled={!supabaseConfig.enabled}
                    variant="outline"
                  >
                    Criar Tabelas no Supabase
                  </Button>
                </div>

                {/* Sincronização */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-medium">Sincronização</h3>
                  
                  {config.supabase?.lastSync && (
                    <p className="text-sm text-gray-600">
                      Última sincronização: {new Date(config.supabase.lastSync).toLocaleString('pt-BR')}
                    </p>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleSyncToSupabase}
                      disabled={!supabaseConfig.enabled || syncing}
                    >
                      {syncing ? 'Sincronizando...' : 'Enviar para Supabase'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleSyncFromSupabase}
                      disabled={!supabaseConfig.enabled || syncing}
                    >
                      {syncing ? 'Sincronizando...' : 'Receber do Supabase'}
                    </Button>
                  </div>

                  {syncResults && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Resultados da Sincronização:</h4>
                      <div className="text-sm space-y-1">
                        {Object.entries(syncResults).map(([key, value]) => (
                          <div key={key}>
                            <strong>{key}:</strong> {typeof value === 'object' ? 
                              `${(value as any).success || value} sucesso, ${(value as any).errors || 0} erros` : 
                              `${value} registros`
                            }
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Instruções */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-medium">Instruções</h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p><strong>1.</strong> Crie um projeto no Supabase (supabase.com)</p>
                    <p><strong>2.</strong> Copie a URL do projeto e a chave anon/public</p>
                    <p><strong>3.</strong> Cole as informações acima e salve</p>
                    <p><strong>4.</strong> Teste a conexão</p>
                    <p><strong>5.</strong> Crie as tabelas necessárias</p>
                    <p><strong>6.</strong> Execute a sincronização</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ConfiguracoesManager