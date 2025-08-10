# PLS Obras - Talão Digital & Compras Externas

Sistema desktop para gerenciamento de obras com talões digitais e controle de compras externas, desenvolvido com Tauri + React + SQLite.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Tauri (Rust) 
- **UI**: Tailwind CSS + shadcn/ui
- **Banco**: SQLite com migrations
- **Autenticação**: Sistema próprio com hash de senhas
- **Relatórios**: PDF generation + Excel export
- **Recursos nativos**: Impressão, OCR, Auto-update

## 🏗️ Arquitetura

- **Offline-first**: Funciona sem internet
- **Sync opcional**: Integração com Supabase
- **Modular**: Componentes organizados por domínio
- **Seguro**: Criptografia do banco de dados
- **Auditável**: Logs de todas as operações

## 📦 Instalação

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Ou usando Tauri
npm run tauri dev
```

### Build de Produção

```bash
# Build da aplicação
npm run build

# Gerar instalador .msi/.exe
npm run tauri build
```

O instalador será gerado em `src-tauri/target/release/bundle/`

## 🔧 Configuração

### Banco de Dados

O SQLite é criado automaticamente em `%APPDATA%/pls-obras/pls_obras.db`

### Usuário Padrão

- **Email**: admin@pls.com  
- **Senha**: admin123
- **Perfil**: Administrador

### Sincronização Supabase (Opcional)

1. Crie um projeto no Supabase
2. Configure as variáveis em Configurações:
   - URL do Supabase
   - Chave da API
3. Execute a sincronização manual

## 📊 Funcionalidades

### ✅ Implementadas

- [x] Sistema de Login com autenticação
- [x] Dashboard com KPIs básicos  
- [x] CRUD completo de Obras
- [x] Interface responsiva e moderna
- [x] Navegação por sidebar
- [x] Estrutura do banco SQLite

### 🔄 Em Desenvolvimento

- [ ] CRUD de Produtos e Categorias
- [ ] CRUD de Fornecedores  
- [ ] Sistema de Talões Digitais
- [ ] Gerencimento de Compras Externas
- [ ] Cálculo automático de Mark-up
- [ ] Sistema de Rateio de Itens
- [ ] Captura de Assinaturas
- [ ] Geração de PDF com QR Code
- [ ] Sistema de Anexos
- [ ] Relatórios completos
- [ ] Sincronização Supabase
- [ ] OCR para busca em anexos
- [ ] Auto-update

## 🗂️ Estrutura do Projeto

```
src/
├── components/
│   ├── auth/           # Autenticação
│   ├── dashboard/      # Dashboard e KPIs
│   ├── layout/         # Layout e navegação
│   ├── obras/          # Gerenciamento de obras
│   └── ui/            # Componentes base (shadcn/ui)
├── lib/               # Utilitários e helpers
└── App.tsx           # Componente principal

src-tauri/
├── src/
│   ├── commands.rs    # Comandos Tauri (API)
│   ├── database.rs    # Inicialização do banco
│   └── main.rs       # Entry point
└── Cargo.toml        # Dependências Rust
```

## 🎯 Roadmap

### Fase 1 - MVP ✅
- Sistema básico de login
- Dashboard inicial  
- CRUD de obras
- Estrutura do banco

### Fase 2 - Funcionalidades Core 🔄
- Sistema completo de talões
- Compras externas
- Mark-up automático
- Relatórios básicos

### Fase 3 - Recursos Avançados ⏳
- Assinaturas digitais
- OCR em anexos
- Sincronização Supabase
- Auto-update

### Fase 4 - Otimizações ⏳
- Performance
- Testes automatizados
- Documentação completa
- Deploy automatizado

## 🐛 Debug

Para debug do backend Rust:
```bash
npm run tauri dev -- --verbose
```

Para debug do frontend:
```bash
npm run dev
```

Logs são salvos em:
- Windows: `%APPDATA%/com.pls.obras/logs/`
- Consulte também o DevTools do navegador

## 📝 Licença

Projeto proprietário - PLS Team

## 🤝 Contribuição

Este é um projeto interno. Para contribuições:

1. Crie uma branch para sua feature
2. Implemente com testes
3. Documente as mudanças
4. Abra Pull Request

---

**PLS Obras v1.0** - Sistema profissional para gerenciamento de obras e controle de materiais.