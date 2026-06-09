import Link from "next/link"
export default async function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 font-sans antialiased text-slate-800">
  <div className="w-full max-w-3xl text-center space-y-8 animate-fadeIn">
    
    <div className="space-y-4">
      <p className="mx-auto w-fit rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
        Plataforma Geográfica Global
      </p>
      
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent">
        Explore e Gerencie o Mundo em um Só Lugar
      </h1>
      
      <p className="mx-auto max-w-xl text-base md:text-lg font-medium text-slate-500 leading-relaxed">
        Uma estrutura inteligente em cascata para organizar continentes, países e cidades com integração em tempo real à API externa REST Countries.
      </p>
    </div>

    <section className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
      <Link 
        href="/Login" 
        className="w-full sm:w-auto min-w-[140px] text-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
      >
        Acessar Painel
      </Link>
      
      <Link 
        href="/Cadastro" 
        className="w-full sm:w-auto min-w-[140px] text-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all"
      >
        Criar Conta
      </Link>
    </section>

  </div>
</main>
  );
}
