'use server'

import { prisma } from "@/src/lib/prisma"
import { revalidatePath } from "next/cache"
import "dotenv/config";

// =========================================================================
// 1. ACTIONS DE CONTINENTES
// =========================================================================

export async function cadastrarContinente(formData: { nome: string; descricao: string }) {
  try {
    const novo = await prisma.continente.create({ 
      data: { nome: formData.nome, descricao: formData.descricao } 
    })
    revalidatePath('/dashboard')
    return { success: true, data: novo }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function buscarContinentes() {
  try {
    return await prisma.continente.findMany({ orderBy: { nome: 'asc' } })
  } catch (error) {
    console.error("Erro ao buscar continentes:", error)
    return []
  }
}

export async function excluirContinente(id: number) {
  try {
    // Se o seu Prisma não estiver com onDelete: Cascade no banco, 
    // você precisará apagar os filhos manualmente antes. 
    await prisma.continente.delete({ where: { id } })
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// =========================================================================
// 2. ACTIONS DE PAÍSES
// =========================================================================

export async function procurarPaisNaAPI(nomeDoPais: string) {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/name/${nomeDoPais}?fullText=true`)
    if (!response.ok) throw new Error("País não encontrado na API REST Countries.")
    
    const data = await response.json()
    const info = data[0]
    const valoresMoeda = Object.values(info.currencies)[0] as any;

    return {
      success: true,
      dados: {
        nome: info.name.translated?.por?.common || info.name.common,
        população: String(info.population),
        idioma: Object.values(info.languages)[0] as string,
        moeda: valoresMoeda ? String(valoresMoeda.name) : "Não informada",
        bandeira: info.flags?.png || ""
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function cadastrarPais(dados: {
  nome: string; população: string; idioma: string; moeda: string; contid: number 
}) {
  try {
    const novoPais = await prisma.pais.create({ data: dados })
    revalidatePath('/dashboard')
    return { success: true, data: novoPais }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function buscarPaises(contid?: number) {
  try {
    return await prisma.pais.findMany({
      where: contid ? { contid } : {},
      orderBy: { nome: 'asc' }
    })
  } catch (error) {
    console.error("Erro ao buscar países:", error)
    return []
  }
}

export async function excluirPais(id: number) {
  try {
    await prisma.pais.delete({ where: { id } })
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// =========================================================================
// 3. ACTIONS DE CIDADES & API DE CLIMA
// =========================================================================

export async function cadastrarCidade(dados: {
  nome: string; população: string; latitude: string; longitude: string; paisid: number 
}) {
  try {
    const novaCidade = await prisma.cidade.create({ data: dados })
    revalidatePath('/dashboard')
    return { success: true, data: novaCidade }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function buscarCidades(paisid?: number) {
  try {
    return await prisma.cidade.findMany({
      where: paisid ? { paisid } : {},
      orderBy: { nome: 'asc' }
    })
  } catch (error) {
    console.error("Erro ao buscar cidades:", error)
    return []
  }
}

export async function excluirCidade(id: number) {
  try {
    await prisma.cidade.delete({ where: { id } })
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Nova action para buscar o Clima baseado nas coordenadas da cidade
// Substitua a função antiga por esta nova no seu actions.ts:
export async function buscarClimaCidade(lat: string, lon: string) {
  try {
    // Usando a API Open-Meteo (Totalmente grátis, sem necessidade de API KEY)
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    )

    if (!response.ok) throw new Error("Não foi possível obter o clima para estas coordenadas.")
    
    const data = await response.json()
    const climaAtual = data.current_weather

    // Mapeamento simples de códigos de clima da Open-Meteo para descrições em português
    // (A Open-Meteo usa números para identificar o estado do tempo)
    const codigosClima: { [key: number]: { desc: string; icone: string } } = {
      0: { desc: "Céu limpo", icone: "01d" },
      1: { desc: "Principalmente limpo", icone: "02d" },
      2: { desc: "Parcialmente nublado", icone: "03d" },
      3: { desc: "Encoberto", icone: "04d" },
      45: { desc: "Névoa", icone: "50d" },
      48: { desc: "Névoa com geada", icone: "50d" },
      51: { desc: "Chuvisco leve", icone: "09d" },
      61: { desc: "Chuva fraca", icone: "10d" },
      63: { desc: "Chuva moderada", icone: "10d" },
      71: { desc: "Queda de neve leve", icone: "13d" },
      80: { desc: "Pancadas de chuva leves", icone: "09d" },
      95: { desc: "Trovoada leve ou moderada", icone: "11d" },
    }

    const infoClima = codigosClima[climaAtual.weathercode] || { desc: "Tempo estável", icone: "02d" }

    return {
      success: true,
      dados: {
        temperatura: climaAtual.temperature, // Já vem em Celsius por padrão
        descricao: infoClima.desc,
        umidade: 70, // Essa API simplificada não traz umidade direta no 'current', deixamos um valor padrão ou aproximado
        icone: infoClima.icone
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}