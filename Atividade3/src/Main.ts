import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

interface filme{
    nome:string
    ano:Date
    genero:string
    duracao:number
    avaliacao:number
}

class Catalogo{
    filmes:filme[] = []
    Adicionar(nome:string,ano:Date,genero:string,duracao:number,avaliacao:number) {
        let filme: filme = {nome:nome,ano:ano,genero:genero,duracao:duracao,avaliacao:avaliacao}
        this.filmes.push(filme)
    }
    listar(){
        for(const x of this.filmes){
            console.log(x.nome)
        } 
    }
    listarEspecifico(chave:string){
        for(const x of this.filmes){
            if(chave.toLowerCase() == x.nome.toLowerCase() || chave.toLowerCase() == x.genero.toLowerCase()){
                console.log(x.nome)
            }
        } 
    }
    deletar(chave:string){
        let Indice = 0
        for(const x of this.filmes){
            if(chave.toLowerCase() == x.nome.toLowerCase()){
                this.filmes.splice(Indice,1)
                break
            }
            Indice++
        }
    }
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//


function validaAno(ano:String):boolean{
        const partes = ano.split("-") ?? []
        if(partes.length != 3){
            return false
        };

        for (const elemento of partes) {
            if (isNaN(parseInt(elemento))){
                return false
            }
        }

        if(!partes[0] || !partes[1] || !partes[2] || partes[0].length != 4 || partes[1].length != 2 || partes[2].length != 2){
            return false
        }

        if((parseInt(partes[0]) < 1888 || parseInt(partes[0]) > new Date().getFullYear()) || (parseInt(partes[1]) < 1 || parseInt(partes[1]) > 12) || (parseInt(partes[2]) < 1 || parseInt(partes[2]) > 31)){
            return false
        }
        
        return true;
    }

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//

var saida:boolean = true
const CatalogoMain = new Catalogo()
const rl = readline.createInterface({ input, output });
while(saida){
    const answer = await rl.question(`===========================================================================\n1 inserir \n2 listar \n3 listar especifico \n4 deletar \n5 sair\n===========================================================================\n`);
    if(answer == "1"){
        const nome = await rl.question("Nome do filme: ");
        const ano = await rl.question("Ano do filme: \nOBS:insira no formato AAAA-MM-DD:");
        if (ano !== undefined && !validaAno(ano)) {
            console.log("Data inválida! Use o formato AAAA-MM-DD.");
            continue; 
        }
        const genero = await rl.question("Gênero do filme: ");
        const duracao = parseInt(await rl.question("Duração do filme (em minutos): "));
        const avaliacao = parseFloat(await rl.question("Avaliação do filme (0-10): "));
        if(nome == "" || genero == "" || isNaN(duracao) || isNaN(avaliacao)){
            console.log("Entrada inválida, tente novamente.")
            continue
        }else{
            CatalogoMain.Adicionar(nome, new Date(ano), genero, duracao, avaliacao);

        }
        
    }
    if(answer == "2"){
        console.log(`============================================================================\nLista de filmes:`);
        CatalogoMain.listar();
        console.log(`============================================================================\n`);
    }
    if(answer == "3"){
        const chave = await rl.question("Digite o nome ou gênero do filme: ");
        CatalogoMain.listarEspecifico(chave);
    }
    if(answer == "4"){
        const chave = await rl.question("Digite o nome do filme a ser deletado: ");
        CatalogoMain.deletar(chave);
    }
    if(answer == "5"){
        saida = false
    }
    if(answer == "dev"){
        CatalogoMain.Adicionar("O Poderoso Chefão", new Date("1972-03-24"), "Drama", 175, 9.2);
        CatalogoMain.Adicionar("O Senhor dos Anéis: O Retorno do Rei", new Date("2003-12-17"), "Fantasia", 201, 8.9);
        CatalogoMain.Adicionar("Pulp Fiction: Tempo de Violência", new Date("1994-10-14"), "Drama", 154, 8.9);
        CatalogoMain.Adicionar("A Origem", new Date("2010-07-16"), "Ficção Científica", 148, 8.8);
        CatalogoMain.Adicionar("Matrix", new Date("1999-03-31"), "Ficção Científica", 136, 8.7);
    }
    if(answer != "1" && answer != "2" && answer != "3" && answer != "4" && answer != "5"){
        console.log("Opção inválida, tente novamente.")
    }
}
rl.close();