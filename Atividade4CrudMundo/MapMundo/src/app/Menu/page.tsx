'use client'

import { useState, useEffect } from "react"
import { 
  buscarContinentes, cadastrarContinente, excluirContinente,
  buscarPaises, procurarPaisNaAPI, cadastrarPais, excluirPais,
  buscarCidades, cadastrarCidade, excluirCidade, buscarClimaCidade
} from "./actions"
import { signOut } from "next-auth/react"

export default function DashboardPage() {
  // Dados do Banco
  const [continentes, setContinentes] = useState<any[]>([])
  const [paises, setPaises] = useState<any[]>([])
  const [cidades, setCidades] = useState<any[]>([])

  // Seleções (Cascata)
  const [continenteSelecionado, setContinenteSelecionado] = useState<any | null>(null)
  const [paisSelecionado, setPaisSelecionado] = useState<any | null>(null)
  const [cidadeSelecionada, setCidadeSelecionada] = useState<any | null>(null)
  const [climaCidade, setClimaCidade] = useState<any | null>(null)

  // Formulários
  const [novoContNome, setNovoContNome] = useState("")
  const [novoContDesc, setNovoContDesc] = useState("")
  const [buscaPaisAPI, setBuscaPaisAPI] = useState("")
  const [paisBuscadoAPI, setPaisBuscadoAPI] = useState<any | null>(null)
  const [novaCidNome, setNovaCidNome] = useState("")
  const [novaCidPop, setNovaCidPop] = useState("")
  const [novaCidLat, setNovaCidLat] = useState("")
  const [novaCidLon, setNovaCidLon] = useState("")

  // ESTADOS PARA EXPANDIR / RETRAIR FORMULÁRIOS
  const [expandeFormContinente, setExpandeFormContinente] = useState(true)
  const [expandeFormPais, setExpandeFormPais] = useState(true)
  const [expandeFormCidade, setExpandeFormCidade] = useState(true)

  // ESTADOS DOS MODAIS CUSTOMIZADOS
  const [modalErro, setModalErro] = useState<{ visivel: boolean; mensagem: string }>({ visivel: false, mensagem: "" })
  const [modalDeletar, setModalDeletar] = useState<{ visivel: boolean; tipo: 'continente' | 'pais' | 'cidade' | null; id: number | null; texto: string }>({
    visivel: false, tipo: null, id: null, texto: ""
  })

  useEffect(() => { carregarContinentes() }, [])

  async function carregarContinentes() {
    const dados = await buscarContinentes()
    setContinentes(dados)
  }

  async function lidarComSelecaoContinente(continente: any) {
    setContinenteSelecionado(continente)
    setPaisSelecionado(null)
    setCidadeSelecionada(null)
    setClimaCidade(null)
    setCidades([])
    const dadosPaises = await buscarPaises(continente.id)
    setPaises(dadosPaises)
  }

  async function lidarComSelecaoPais(pais: any) {
    setPaisSelecionado(pais)
    setCidadeSelecionada(null)
    setClimaCidade(null)
    const dadosCidades = await buscarCidades(pais.id)
    setCidades(dadosCidades)
  }

  async function lidarComSelecaoCidade(cidade: any) {
    setCidadeSelecionada(cidade)
    setClimaCidade(null)
    const res = await buscarClimaCidade(cidade.latitude, cidade.longitude)
    if (res.success) {
      setClimaCidade(res.dados)
    } else {
      setModalErro({ visivel: true, mensagem: res.error || "Erro ao buscar clima." })
    }
  }

  function abrirModalDeletar(tipo: 'continente' | 'pais' | 'cidade', id: number, texto: string, e: React.MouseEvent) {
    e.stopPropagation()
    setModalDeletar({ visivel: true, tipo, id, texto })
  }

  async function confirmarExclusao() {
    const { tipo, id } = modalDeletar
    if (!tipo || !id) return

    let res: any = { success: false }

    if (tipo === 'continente') {
      res = await excluirContinente(id)
      if (res.success) {
        if (continenteSelecionado?.id === id) {
          setContinenteSelecionado(null); setPaises([]); setCidades([]); setClimaCidade(null)
        }
        carregarContinentes()
      }
    } else if (tipo === 'pais') {
      res = await excluirPais(id)
      if (res.success) {
        if (paisSelecionado?.id === id) { setPaisSelecionado(null); setCidades([]); setClimaCidade(null) }
        const dadosPaises = await buscarPaises(continenteSelecionado.id)
        setPaises(dadosPaises)
      }
    } else if (tipo === 'cidade') {
      res = await excluirCidade(id)
      if (res.success) {
        if (cidadeSelecionada?.id === id) { setCidadeSelecionada(null); setClimaCidade(null) }
        const dadosCidades = await buscarCidades(paisSelecionado.id)
        setCidades(dadosCidades)
      }
    }

    if (!res.success) {
      setModalErro({ visivel: true, mensagem: "Erro ao excluir elemento: " + res.error })
    }

    setModalDeletar({ visivel: false, tipo: null, id: null, texto: "" })
  }

  async function handleCampanhaContinente(e: React.FormEvent) {
    e.preventDefault()
    const res = await cadastrarContinente({ nome: novoContNome, descricao: novoContDesc })
    if (res.success) { setNovoContNome(""); setNovoContDesc(""); carregarContinentes() }
    else setModalErro({ visivel: true, mensagem: res.error })
  }

  async function handleProcurarPaisAPI() {
    const res = await procurarPaisNaAPI(buscaPaisAPI)
    if (res.success) setPaisBuscadoAPI(res.dados)
    else { setModalErro({ visivel: true, mensagem: "País não encontrado na API REST Countries!" }); setPaisBuscadoAPI(null) }
  }

  async function handleCadastrarPais() {
    if (!paisBuscadoAPI || !continenteSelecionado) return
    const res = await cadastrarPais({
      nome: paisBuscadoAPI.nome,
      população: paisBuscadoAPI.população,
      idioma: paisBuscadoAPI.idioma,
      moeda: paisBuscadoAPI.moeda,
      contid: continenteSelecionado.id
    })
    if (res.success) {
      setPaisBuscadoAPI(null); setBuscaPaisAPI("")
      const dadosPaises = await buscarPaises(continenteSelecionado.id)
      setPaises(dadosPaises)
    } else setModalErro({ visivel: true, mensagem: res.error })
  }

  async function handleCadastrarCidade(e: React.FormEvent) {
    e.preventDefault()
    const res = await cadastrarCidade({
      nome: novaCidNome,
      população: novaCidPop,
      latitude: novaCidLat,
      longitude: novaCidLon,
      paisid: paisSelecionado.id
    })
    if (res.success) {
      setNovaCidNome(""); setNovaCidPop(""); setNovaCidLat(""); setNovaCidLon("")
      const dadosCidades = await buscarCidades(paisSelecionado.id)
      setCidades(dadosCidades)
    } else setModalErro({ visivel: true, mensagem: res.error })
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 font-sans relative">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Mundo CRUD - Painel de Controle</h1>
        <p className="text-sm text-gray-500">Controle total Geográfico com APIs de Países e Clima</p>
        <button
  onClick={() => signOut({ callbackUrl: "/Login" })}
  className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-xs px-3 py-2 rounded transition-colors"
>
  Sair do Sistema 🚪
</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA 1: CONTINENTES */}
        <div className="bg-white p-4 rounded-lg shadow border space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <h2 className="text-xl font-bold text-indigo-700">1. Continentes</h2>
              {/* Botão de Retrair/Expandir */}
              <button 
                onClick={() => setExpandeFormContinente(!expandeFormContinente)} 
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded font-medium transition-colors"
              >
                {expandeFormContinente ? "🙈 Ocultar Form" : "➕ Novo Continente"}
              </button>
            </div>

            {/* Formulário com transição/recolhimento */}
            <div className={`overflow-hidden transition-all duration-300 ${expandeFormContinente ? 'max-h-[300px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
              <form onSubmit={handleCampanhaContinente} className="p-3 bg-gray-50 rounded border space-y-2 text-sm">
                <input type="text" placeholder="Nome" value={novoContNome} onChange={e => setNovoContNome(e.target.value)} className="w-full p-2 border rounded" required />
                <input type="text" placeholder="Descrição" value={novoContDesc} onChange={e => setNovoContDesc(e.target.value)} className="w-full p-2 border rounded" required />
                <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 font-medium">Salvar</button>
              </form>
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Lista Cadastrada:</p>
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {continentes.map(c => (
                <div key={c.id} onClick={() => lidarComSelecaoContinente(c)} className={`p-3 border rounded flex justify-between items-center cursor-pointer transition-all ${continenteSelecionado?.id === c.id ? 'bg-indigo-50 border-indigo-500' : 'hover:bg-gray-50'}`}>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{c.nome}</h3>
                    <p className="text-xs text-gray-500">{c.descricao}</p>
                  </div>
                  <button onClick={(e) => abrirModalDeletar('continente', c.id, `Deseja realmente excluir o continente "${c.nome}"? Todos os países e cidades vinculados serão apagados.`, e)} className="text-red-500 hover:text-red-700 p-1 font-bold text-sm ml-2">🗑️</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA 2: PAÍSES */}
        <div className={`bg-white p-4 rounded-lg shadow border space-y-4 transition-all ${!continenteSelecionado && 'opacity-40 pointer-events-none'}`}>
          <div>
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <h2 className="text-xl font-bold text-emerald-700">2. Países</h2>
              {continenteSelecionado && (
                <button 
                  onClick={() => setExpandeFormPais(!expandeFormPais)} 
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded font-medium transition-colors"
                >
                  {expandeFormPais ? "🙈 Ocultar Busca" : "🔍 Buscar API"}
                </button>
              )}
            </div>

            {/* Formulário com recolhimento */}
            <div className={`overflow-hidden transition-all duration-300 ${expandeFormPais && continenteSelecionado ? 'max-h-[300px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
              {continenteSelecionado && (
                <div className="p-3 bg-gray-50 rounded border space-y-2 text-sm">
                  <div className="flex gap-1">
                    <input type="text" placeholder="Buscar na REST Countries" value={buscaPaisAPI} onChange={e => setBuscaPaisAPI(e.target.value)} className="flex-1 p-2 border rounded" />
                    <button type="button" onClick={handleProcurarPaisAPI} className="bg-emerald-600 text-white px-3 rounded hover:bg-emerald-700">Buscar</button>
                  </div>
                  {paisBuscadoAPI && (
                    <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs space-y-1">
                      <span className="font-bold text-emerald-900">{paisBuscadoAPI.nome}</span>
                      <p>👥 Pop: {Number(paisBuscadoAPI.população).toLocaleString('pt-BR')}</p>
                      <button type="button" onClick={handleCadastrarPais} className="w-full mt-1 bg-emerald-700 text-white p-1 rounded font-semibold hover:bg-emerald-800">Confirmar e Gravar</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Lista Cadastrada:</p>
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {paises.map(p => (
                <div key={p.id} onClick={() => lidarComSelecaoPais(p)} className={`p-3 border rounded flex justify-between items-center cursor-pointer transition-all ${paisSelecionado?.id === p.id ? 'bg-emerald-50 border-emerald-500' : 'hover:bg-gray-50'}`}>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{p.nome}</h3>
                    <p className="text-[11px] text-gray-500">🗣️ {p.idioma} | 💰 {p.moeda}</p>
                  </div>
                  <button onClick={(e) => abrirModalDeletar('pais', p.id, `Deseja realmente excluir o país "${p.nome}" e todas as suas cidades vinculadas?`, e)} className="text-red-500 hover:text-red-700 p-1 font-bold text-sm ml-2">🗑️</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA 3: CIDADES */}
        <div className={`bg-white p-4 rounded-lg shadow border space-y-4 transition-all ${!paisSelecionado && 'opacity-40 pointer-events-none'}`}>
          <div>
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <h2 className="text-xl font-bold text-amber-700">3. Cidades</h2>
              {paisSelecionado && (
                <button 
                  onClick={() => setExpandeFormCidade(!expandeFormCidade)} 
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded font-medium transition-colors"
                >
                  {expandeFormCidade ? "🙈 Ocultar Form" : "➕ Nova Cidade"}
                </button>
              )}
            </div>

            {/* Formulário com recolhimento */}
            <div className={`overflow-hidden transition-all duration-300 ${expandeFormCidade && paisSelecionado ? 'max-h-[350px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
              {paisSelecionado && (
                <form onSubmit={handleCadastrarCidade} className="p-3 bg-gray-50 rounded border space-y-2 text-sm">
                  <input type="text" placeholder="Nome" value={novaCidNome} onChange={e => setNovaCidNome(e.target.value)} className="w-full p-2 border rounded" required />
                  <input type="number" placeholder="População" value={novaCidPop} onChange={e => setNovaCidPop(e.target.value)} className="w-full p-2 border rounded" required />
                  <div className="grid grid-cols-2 gap-1">
                    <input type="text" placeholder="Lat" value={novaCidLat} onChange={e => setNovaCidLat(e.target.value)} className="p-2 border rounded" required />
                    <input type="text" placeholder="Lon" value={novaCidLon} onChange={e => setNovaCidLon(e.target.value)} className="p-2 border rounded" required />
                  </div>
                  <button type="submit" className="w-full bg-amber-600 text-white p-2 rounded hover:bg-amber-700 font-medium">Salvar</button>
                </form>
              )}
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Lista Cadastrada:</p>
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {cidades.map(cid => (
                <div key={cid.id} onClick={() => lidarComSelecaoCidade(cid)} className={`p-3 border rounded flex justify-between items-center cursor-pointer transition-all ${cidadeSelecionada?.id === cid.id ? 'bg-amber-50 border-amber-500' : 'hover:bg-gray-50'}`}>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{cid.nome}</h3>
                    <p className="text-[11px] text-gray-500">👥 Pop: {Number(cid.população || 0).toLocaleString('pt-BR')}</p>
                  </div>
                  <button onClick={(e) => abrirModalDeletar('cidade', cid.id, `Deseja excluir a cidade de "${cid.nome}"?`, e)} className="text-red-500 hover:text-red-700 p-1 font-bold text-sm ml-2">🗑️</button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* BLOCO DA API DE CLIMA */}
      {cidadeSelecionada && climaCidade && (
        <div className="mt-6 bg-gradient-to-r from-blue-500 to-sky-600 text-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold bg-sky-700 px-2.5 py-1 rounded-full uppercase tracking-wider">Meteo API Ativa</span>
            <h3 className="text-2xl font-bold mt-2">Clima Atual em {cidadeSelecionada.nome}</h3>
            <p className="text-sm capitalize opacity-90 mt-0.5">{climaCidade.descricao}</p>
            <div className="flex gap-4 mt-3 text-sm opacity-80">
              <p>💧 Umidade estim.: {climaCidade.umidade}%</p>
              <p>📍 Coordenadas: {cidadeSelecionada.latitude}, {cidadeSelecionada.longitude}</p>
            </div>
          </div>
          <div className="text-center flex flex-col items-center">
            <img src={`https://openweathermap.org/img/wn/${climaCidade.icone}@2x.png`} alt="Icone do tempo" className="w-20 h-20 drop-shadow-md" />
            <span className="text-4xl font-extrabold -mt-2">{Math.round(climaCidade.temperatura)}°C</span>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {modalDeletar.visivel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl border p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{modalDeletar.texto}</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModalDeletar({ visivel: false, tipo: null, id: null, texto: "" })} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Cancelar</button>
              <button onClick={confirmarExclusao} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">Excluir Definitivamente</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ALERTA DE ERRO */}
      {modalErro.visivel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl border p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <span className="text-2xl">🛑</span>
              <h3 className="text-lg font-bold text-gray-800">Aviso do Sistema</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{modalErro.mensagem}</p>
            <div className="flex justify-end pt-2">
              <button onClick={() => setModalErro({ visivel: false, mensagem: "" })} className="px-5 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-md transition-colors">Entendido</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}