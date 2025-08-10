import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, FileText, Truck, DollarSign, TrendingUp, Package, Undo2 } from 'lucide-react'
import { toBRL, qtdLiquidaItem, valorTotalTalao } from '@/lib/helpers'
import { useStore } from '@/store/useStore'

const Dashboard: React.FC = () => {
  const { obras, taloes, compras, produtos, devolucoes } = useStore()
  
  const taloesAbertos = taloes.filter(t => !['Concluído', 'Devolvido Total'].includes(t.status)).length
  const entregasHoje = taloes.filter(t => 
    t.status === 'Em entrega' && 
    t.criadoEm === new Date().toISOString().split('T')[0]
  ).length
  
  const totalCusto = compras.reduce((sum, c) => 
    sum + c.itens.reduce((itemSum, item) => itemSum + (item.qtd * item.custoUnit), 0), 0
  )
  const totalReceita = compras.reduce((sum, c) => 
    sum + c.itens.reduce((itemSum, item) => itemSum + (item.qtd * item.precoUnitObra), 0), 0
  )

  const devolucoesHoje = devolucoes.filter(d => 
    d.data.split('T')[0] === new Date().toISOString().split('T')[0]
  ).length

  const kpiCards = [
    {
      title: 'Talões Abertos',
      value: taloesAbertos,
      description: 'Aguardando separação/entrega',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Entregas Hoje',
      value: entregasHoje,
      description: 'Talões em entrega hoje',
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Custo Total',
      value: toBRL(totalCusto),
      description: 'Compras externas no período',
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Receita Total',
      value: toBRL(totalReceita),
      description: 'Valor repassado às obras',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ]

  const obrasAtivas = obras.filter(o => o.ativo)
  const produtosAtivos = produtos.filter(p => p.ativo)
  const produtosBaixoEstoque = produtos.filter(p => p.ativo && (p.estoque || 0) <= 10)

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Visão geral do sistema PLS Obras</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {card.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-blue-600" />
              Obras Ativas ({obrasAtivas.length})
            </CardTitle>
            <CardDescription>
              Últimas movimentações por obra
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {obrasAtivas.slice(0, 3).map((obra) => {
                const taloesObra = taloes.filter(t => t.obraId === obra.id && !['Concluído', 'Devolvido Total'].includes(t.status))
                const valorTotal = taloes
                  .filter(t => t.obraId === obra.id)
                  .reduce((sum, t) => sum + valorTotalTalao(t), 0)
                
                return (
                  <div key={obra.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{obra.nome}</p>
                      <p className="text-sm text-gray-600">{obra.cidade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{taloesObra.length} talões abertos</p>
                      <p className="text-xs text-gray-500">{toBRL(valorTotal)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-green-600" />
              Produtos - Baixo Estoque ({produtosBaixoEstoque.length})
            </CardTitle>
            <CardDescription>
              Produtos com estoque baixo (≤ 10)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {produtosBaixoEstoque.slice(0, 3).map((produto) => (
                <div key={produto.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium">{produto.nome}</p>
                    <p className="text-sm text-gray-600">{produto.categoria}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">{produto.estoque || 0} {produto.unidade}</p>
                    <p className="text-xs text-gray-500">{produto.sku}</p>
                  </div>
                </div>
              ))}
              {produtosBaixoEstoque.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Todos os produtos com estoque adequado
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Undo2 className="h-5 w-5 mr-2 text-orange-600" />
              Devoluções Hoje ({devolucoesHoje})
            </CardTitle>
            <CardDescription>
              Devoluções registradas hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {devolucoes
                .filter(d => d.data.split('T')[0] === new Date().toISOString().split('T')[0])
                .slice(0, 3)
                .map((devolucao) => {
                  const talao = taloes.find(t => t.id === devolucao.talaoId)
                  const item = talao?.itens.find(i => i.id === devolucao.itemTalId)
                  const obra = obras.find(o => o.id === talao?.obraId)
                  
                  return (
                    <div key={devolucao.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium">{talao?.numero}</p>
                        <p className="text-sm text-gray-600">{obra?.nome}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{devolucao.qtd} devolvido(s)</p>
                        <p className="text-xs text-gray-500">{item?.descricaoLivre}</p>
                      </div>
                    </div>
                  )
                })}
              {devolucoesHoje === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma devolução hoje
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Status dos Talões */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Talões</CardTitle>
          <CardDescription>
            Distribuição dos talões por status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['A separar', 'Em entrega', 'Concluído', 'Devolvido Parcial', 'Devolvido Total'].map(status => {
              const count = taloes.filter(t => t.status === status).length
              const percentage = taloes.length > 0 ? (count / taloes.length * 100).toFixed(1) : '0'
              
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'A separar': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  case 'Em entrega': return 'bg-blue-100 text-blue-800 border-blue-200'
                  case 'Concluído': return 'bg-green-100 text-green-800 border-green-200'
                  case 'Devolvido Parcial': return 'bg-orange-100 text-orange-800 border-orange-200'
                  case 'Devolvido Total': return 'bg-red-100 text-red-800 border-red-200'
                  default: return 'bg-gray-100 text-gray-800 border-gray-200'
                }
              }
              
              return (
                <div key={status} className={`p-4 rounded-lg border ${getStatusColor(status)}`}>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm font-medium">{status}</div>
                  <div className="text-xs opacity-75">{percentage}% do total</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard