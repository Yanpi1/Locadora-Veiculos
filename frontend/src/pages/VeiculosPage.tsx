import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Veiculo, Categoria } from '../types';

export default function VeiculosPage() {
  const [lista, setLista] = useState<Veiculo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState({ placa: '', modelo: '', ano: '', categoriaId: '' });

  async function carregar() {
    setLista(await api.listarVeiculos());
    setCategorias(await api.listarCategorias());
  }
  useEffect(() => { carregar(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.criarVeiculo({
      placa: form.placa, modelo: form.modelo, ano: Number(form.ano), categoriaId: Number(form.categoriaId),
    });
    setForm({ placa: '', modelo: '', ano: '', categoriaId: '' });
    carregar();
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Veículos</h1>
        <p>Frota da locadora.</p>
      </div>
      <div className="card">
        <form className="grid-form" onSubmit={handleSubmit}>
          <input placeholder="Placa" value={form.placa} onChange={e => setForm({ ...form, placa: e.target.value.toUpperCase() })} required />
          <input placeholder="Modelo" value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} required />
          <input type="number" placeholder="Ano" value={form.ano} onChange={e => setForm({ ...form, ano: e.target.value })} required />
          <select value={form.categoriaId} onChange={e => setForm({ ...form, categoriaId: e.target.value })} required>
            <option value="">Categoria</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <button type="submit" className="btn-primary">Adicionar</button>
        </form>
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Placa</th><th>Modelo</th><th>Ano</th><th>Categoria</th><th>Status</th></tr></thead>
          <tbody>
            {lista.map(v => (
              <tr key={v.id}>
                <td>{v.placa}</td><td>{v.modelo}</td><td>{v.ano}</td><td>{v.categoria?.nome}</td><td><span className={`tag tag-vehicle-${v.status.toLowerCase()}`}>{v.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
