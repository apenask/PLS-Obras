import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { loadSeedData } from '@/seeds'
import LoginForm from '@/components/auth/LoginForm'
import Sidebar from '@/components/layout/Sidebar'
import Dashboard from '@/components/dashboard/Dashboard'
import ObrasManager from '@/components/obras/ObrasManager'
import ProdutosManager from '@/components/produtos/ProdutosManager'
import FornecedoresManager from '@/components/fornecedores/FornecedoresManager'
import TaloesManager from '@/components/taloes/TaloesManager'
import ComprasExternasManager from '@/components/compras/ComprasExternasManager'
import RelatoriosManager from '@/components/relatorios/RelatoriosManager'
import ConfiguracoesManager from '@/components/config/ConfiguracoesManager'

function App() {
  const { currentUser, loadFromStorage } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initApp = async () => {
      await loadFromStorage()
      loadSeedData()
      setLoading(false)
    }
    initApp()
  }, [loadFromStorage])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando PLS Obras...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <LoginForm />
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/obras" element={<ObrasManager />} />
            <Route path="/produtos" element={<ProdutosManager />} />
            <Route path="/fornecedores" element={<FornecedoresManager />} />
            <Route path="/taloes" element={<TaloesManager />} />
            <Route path="/compras-externas" element={<ComprasExternasManager />} />
            <Route path="/relatorios" element={<RelatoriosManager />} />
            <Route path="/config" element={<ConfiguracoesManager />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App