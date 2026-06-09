'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    
    const resultado = await signIn('credentials', {
      email: email,
      password: password,
      redirect: false,
    });

    if (resultado?.error) {
      setErro('Credenciais inválidas. Tente novamente.');
    } else {
      router.push('/Menu');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans antialiased text-slate-800">
  <div className="w-full max-w-[440px] rounded-2xl border border-slate-200 bg-white p-8 shadow-xl transition-all duration-200 hover:shadow-2xl">
    
    <div className="mb-6 text-center">
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
        Mundo CRUD
      </h2>
      <p className="mt-2 text-sm font-medium text-slate-500">
        Acesse sua conta para gerenciar o painel
      </p>
    </div>

    {erro && (
      <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700 animate-fadeIn">
        <span>⚠️</span>
        <p>{erro}</p>
      </div>
    )}

    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          E-mail
        </label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="seu@email.com"
          required 
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Senha
        </label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="••••••••"
          required 
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
        />
      </div>

      <button 
        type="submit" 
        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all mt-2"
      >
        Entrar
      </button>
    </form>
    <Link className="text-sm font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent" href="/Cadastro">Cadastro</Link>
  </div>
</div>
  );
}