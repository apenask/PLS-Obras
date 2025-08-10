import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Building2, 
  Package, 
  Truck, 
  FileText, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  User,
  LogOut,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/useStore'

const Sidebar: React.FC = () => {
  const { currentUser, logout } = useStore()
  const location = useLocation()
  
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/obras', label: 'Obras', icon: Building2 },
    { path: '/produtos', label: 'Produtos', icon: Package },
    { path: '/fornecedores', label: 'Fornecedores', icon: Truck },
    { path: '/taloes', label: 'Talões', icon: FileText },
    { path: '/compras-externas', label: 'Compras Externas', icon: ShoppingCart },
    { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
    { path: '/config', label: 'Configurações', icon: Settings },
  ]

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">PLS Obras</h1>
        <p className="text-sm text-gray-400">Sistema de Talões Digitais</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-left ${
                  isActive 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center mb-4">
          <User className="h-8 w-8 text-gray-400 mr-3" />
          <div>
            <p className="text-sm font-medium">{currentUser?.nome}</p>
            <p className="text-xs text-gray-400">{currentUser?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
          onClick={logout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  )
}

export default Sidebar