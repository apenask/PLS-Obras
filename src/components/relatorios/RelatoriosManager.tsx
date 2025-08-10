import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart3, Download, FileText, Calendar } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatDate, toBRL, qtdLiquidaItem, valorTotalTalao } from '@/lib/helpers'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'

const RelatoriosManager: React.FC = () => {
  const { obras, taloes, compras, devolucoes } = useStore()
  const [obraFilter, setObraFilter] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const filteredTaloes = taloes.filter(talao => {
    const matchesObra = !obraFilter || obraFilter === '__ALL_OBRAS__' || talao.obraId === obraFilter
    const matchesData = (!dataInicio || talao.criadoEm >= dataInicio) && 
                       (!dataFim || talao.criadoEm <= dataFim)
    return matchesObra && matchesData
  })

  const filteredDevolucoes = devolucoes.filter(devolucao => {
    const matchesData = (!dataInicio || devolucao.data >= dataInicio) && 
                       (!dataFim || devolucao.data <= dataFim)
    return matchesData
  })

  // Cálculos do resumo
  const resumoPorObra = obras.map(obra => {
    const taloesObra = filteredTaloes.filter(t => t.obraId === obra.id)
    
    let totalEstoque = 0
    let totalComprasExternas = 0
    let totalDevolvido = 0
    
    taloesObra.forEach(talao => {
      talao.itens.forEach(item => {
        const qtdLiquida = qtdLiquidaItem(item)
        const preco = item.precoUnit || 0
        const valorItem = qtdLiquida * preco
        
        if (item.origem === 'estoque') {
          totalEstoque += valorItem
        } else {
          totalComprasExternas += valorItem
        }
        
        totalDevolvido += (item.qtdDevolvida || 0) * preco
      })
    })
    
    return {
      obra,
      totalEstoque,
      totalComprasExternas,
      totalGeral: totalEstoque + totalComprasExternas,
      totalDevolvido,
      qtdTaloes: taloesObra.length
    }
  })

  const totalGeral = resumoPorObra.reduce((sum, item) => ({
    totalEstoque: sum.totalEstoque + item.totalEstoque,
    totalComprasExternas: sum.totalComprasExternas + item.totalComprasExternas,
    totalGeral: sum.totalGeral + item.totalGeral,
    totalDevolvido: sum.totalDevolvido + item.totalDevolvido,
    qtdTaloes: sum.qtdTaloes + item.qtdTaloes
  }), { totalEstoque: 0, totalComprasExternas: 0, totalGeral: 0, totalDevolvido: 0, qtdTaloes: 0 })

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new()
    
    const resumoData = resumoPorObra.map(item => ({
      'Obra': item.obra.nome,
      'Cidade': item.obra.cidade,
      'Qtd Talões': item.qtdTaloes,
      'Total Estoque': item.totalEstoque,
      'Total Compras Externas': item.totalComprasExternas,
      'Total Geral': item.totalGeral,
      'Total Devolvido': item.totalDevolvido,
      'Líquido': item.totalGeral - item.totalDevolvido
    }))
    
    const wsResumo = XLSX.utils.json_to_sheet(resumoData)
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo por Obra')
    
    const taloesData = filteredTaloes.map(talao => {
      const obra = obras.find(o => o.id === talao.obraId)
      return {
        'Número': talao.numero,
        'Obra': obra?.nome,
        'Solicitante': talao.solicitante,
        'Status': talao.status,
        'Data': formatDate(talao.criadoEm),
        'Valor Total': valorTotalTalao(talao)
      }
    })
    
    const wsTaloes = XLSX.utils.json_to_sheet(taloesData)
    XLSX.utils.book_append_sheet(wb, wsTaloes, 'Talões')
    
    const devolucoesData = filteredDevolucoes.map(devolucao => {
      const talao = taloes.find(t => t.id === devolucao.talaoId)
      const item = talao?.itens.find(i => i.id === devolucao.itemTalId)
      const obra = obras.find(o => o.id === talao?.obraId)
      
      return {
        'Data': formatDate(devolucao.data),
        'Talão': talao?.numero,
        'Obra': obra?.nome,
        'Item': item?.descricaoLivre,
        'Quantidade': devolucao.qtd,
        'Motivo': devolucao.motivo,
        'Valor': (item?.precoUnit || 0) * devolucao.qtd
      }
    })
    
    const wsDevol = XLSX.utils.json_to_sheet(devolucoesData)
    XLSX.utils.book_append_sheet(wb, wsDevol, 'Devoluções')
    
    XLSX.writeFile(wb, `relatorio-obras-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(20)
    doc.text('Relatório de Obras', 20, 20)
    
    doc.setFontSize(12)
    doc.text(`Período: ${dataInicio ? formatDate(dataInicio) : 'Início'} até ${dataFim ? formatDate(dataFim) : 'Hoje'}`, 20, 35)
    
    let y = 50
    
    doc.setFontSize(16)
    doc.text('Resumo Geral', 20, y)
    y += 15
    
    doc.setFontSize(12)
    doc.text(`Total de Talões: ${totalGeral.qtdTaloes}`, 20, y)
    y += 10
    doc.text(`Total Estoque: ${toBRL(totalGeral.totalEstoque)}`, 20, y)
    y += 10
    doc.text(`Total Compras Externas: ${toBRL(totalGeral.totalComprasExternas)}`, 20, y)
    y += 10
    doc.text(`Total Geral: ${toBRL(totalGeral.totalGeral)}`, 20, y)
    y += 10
    doc.text(`Total Devolvido: ${toBRL(totalGeral.totalDevolvido)}`, 20, y)
    y += 20
    
    doc.setFontSize(16)
    doc.text('Resumo por Obra', 20, y)
    y += 15
    
    resumoPorObra.forEach(item => {
      if (y > 250) {
        doc.addPage()
        y = 20
      }
      
      doc.setFontSize(14)
      doc.text(item.obra.nome, 20, y)
      y += 10
      
      doc.setFontSize(10)
      doc.text(`Talões: ${item.qtdTaloes} | Total: ${toBRL(item.totalGeral)} | Devolvido: ${toBRL(item.totalDevolvido)}`, 25, y)
      y += 15
    })
    
    doc.save(`relatorio-obras-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="mr-3 h-8 w-8 text-blue-600" />
              Relatórios
            </h1>
            <p className="text-muted-foreground mt-2">Análises e relatórios do sistema</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={exportToExcel} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Button onClick={exportToPDF} variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6">
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
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              placeholder="Data início"
            />
            <span className="text-gray-400">até</span>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              placeholder="Data fim"
            />
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Talões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGeral.qtdTaloes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{toBRL(totalGeral.totalEstoque)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Compras Externas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{toBRL(totalGeral.totalComprasExternas)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Devolvido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{toBRL(totalGeral.totalDevolvido)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo por Obra */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Resumo por Obra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-muted-foreground">Obra</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Cidade</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Talões</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Estoque</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Compras Ext.</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Total</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Devolvido</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Líquido</th>
                </tr>
              </thead>
              <tbody>
                {resumoPorObra.map(item => (
                  <tr key={item.obra.id} className="border-b transition-colors hover:bg-muted">
                    <td className="p-2 font-medium">{item.obra.nome}</td>
                    <td className="p-2">{item.obra.cidade}</td>
                    <td className="p-2 text-right">{item.qtdTaloes}</td>
                    <td className="p-2 text-right">{toBRL(item.totalEstoque)}</td>
                    <td className="p-2 text-right">{toBRL(item.totalComprasExternas)}</td>
                    <td className="p-2 text-right font-medium">{toBRL(item.totalGeral)}</td>
                    <td className="p-2 text-right text-red-600">{toBRL(item.totalDevolvido)}</td>
                    <td className="p-2 text-right font-medium text-green-600">
                      {toBRL(item.totalGeral - item.totalDevolvido)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Talões Concluídos */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Talões Concluídos no Período ({filteredTaloes.filter(t => t.status === 'Concluído').length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-muted-foreground">Número</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Obra</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Solicitante</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Data</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredTaloes.filter(t => t.status === 'Concluído').map(talao => {
                  const obra = obras.find(o => o.id === talao.obraId)
                  return (
                    <tr key={talao.id} className="border-b transition-colors hover:bg-muted">
                      <td className="p-2 font-medium">{talao.numero}</td>
                      <td className="p-2">{obra?.nome}</td>
                      <td className="p-2">{talao.solicitante}</td>
                      <td className="p-2">{formatDate(talao.criadoEm)}</td>
                      <td className="p-2 text-right">{toBRL(valorTotalTalao(talao))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Devoluções */}
      <Card>
        <CardHeader>
          <CardTitle>Devoluções no Período ({filteredDevolucoes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-muted-foreground">Data</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Talão</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Obra</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Item</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Qtd</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Motivo</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Valor</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevolucoes.map(devolucao => {
                  const talao = taloes.find(t => t.id === devolucao.talaoId)
                  const item = talao?.itens.find(i => i.id === devolucao.itemTalId)
                  const obra = obras.find(o => o.id === talao?.obraId)
                  const valor = (item?.precoUnit || 0) * devolucao.qtd
                  
                  return (
                    <tr key={devolucao.id} className="border-b transition-colors hover:bg-muted">
                      <td className="p-2">{formatDate(devolucao.data)}</td>
                      <td className="p-2 font-medium">{talao?.numero}</td>
                      <td className="p-2">{obra?.nome}</td>
                      <td className="p-2">{item?.descricaoLivre}</td>
                      <td className="p-2 text-right">{devolucao.qtd}</td>
                      <td className="p-2">{devolucao.motivo || '-'}</td>
                      <td className="p-2 text-right text-red-600">{toBRL(valor)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RelatoriosManager
