import { useState } from 'react';
import LocacoesPage from './pages/LocacoesPage';
import VeiculosPage from './pages/VeiculosPage';
import CategoriasPage from './pages/CategoriasPage';
import ClientesPage from './pages/ClientesPage';
import SegurosPage from './pages/SegurosPage';
import MultasPage from './pages/MultasPage';
import ManutencaoPage from './pages/ManutencaoPage';

type Aba = 'locacoes' | 'veiculos' | 'categorias' | 'clientes' | 'seguros' | 'multas' | 'manutencao';

const NAV_ITEMS: { id: Aba; label: string; icon: string }[] = [
  { id: 'locacoes', label: 'Locações', icon: '🔑' },
  { id: 'veiculos', label: 'Veículos', icon: '🚗' },
  { id: 'categorias', label: 'Categorias', icon: '🏷️' },
  { id: 'clientes', label: 'Clientes', icon: '🧑' },
  { id: 'seguros', label: 'Seguros', icon: '🛡️' },
  { id: 'multas', label: 'Multas', icon: '⚠️' },
  { id: 'manutencao', label: 'Manutenção', icon: '🔧' },
];

export default function App() {
  const [aba, setAba] = useState<Aba>('locacoes');

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">RV</span>
          <div>
            <div className="brand-name">RodaViva</div>
            <div className="brand-sub">Locadora de veículos</div>
          </div>
        </div>

        <nav className="side-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={'side-link' + (aba === item.id ? ' active' : '')}
              onClick={() => setAba(item.id)}
            >
              <span className="side-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">UC9 · Manutenção de sistemas<br/>Senac DF</div>
      </aside>

      <div className="content">
        {aba === 'locacoes' && <LocacoesPage />}
        {aba === 'veiculos' && <VeiculosPage />}
        {aba === 'categorias' && <CategoriasPage />}
        {aba === 'clientes' && <ClientesPage />}
        {aba === 'seguros' && <SegurosPage />}
        {aba === 'multas' && <MultasPage />}
        {aba === 'manutencao' && <ManutencaoPage />}
      </div>
    </div>
  );
}
