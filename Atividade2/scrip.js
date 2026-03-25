const date = new Date;
var ano = date.getFullYear();
var mes = date.getMonth();
var totalDias = new Date(ano, mes + 1, 0).getDate();
var DatasTarefas = {};
function passarmes(){
    if(mes < 11){mes++;}
    TabeladosDias();
}
function voltarmes(){
    if(mes > 0){mes--;}
    TabeladosDias();
}
function TabeladosDias() {
    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    totalDias = new Date(ano, mes + 1, 0).getDate();

    let boxDias = `<div class="m-3 grid grid-cols-2 sm:grid-cols-7 border-t border-l">`;
    
    for (let i = 1; i <= totalDias; i++) {
        let tarefaExibicao = "";
        if (DatasTarefas[mes] && DatasTarefas[mes][i]) {
            tarefaExibicao = `<p class="text-blue-600 font-bold text-xs mt-1">${DatasTarefas[mes][i]}</p>`;
        }

        const diaDaSemana = diasSemana[new Date(ano, mes, i).getDay()];

        boxDias += `
            <div class="border-r border-b p-2 min-h-[80px]">
                <div class="flex justify-between items-start">
                    <span class="font-bold text-gray-700">${i}</span>
                    <small class="text-gray-400 text-[10px] uppercase">${diaDaSemana}</small>
                </div>
                <div class="mt-1">
                    ${tarefaExibicao || '<small class="text-gray-300 italic">Vazio</small>'}
                </div>
            </div>`;
    }

    boxDias += `</div>
    <div class="flex gap-2 m-3">
        <button class="px-4 py-2 border rounded hover:bg-gray-100" onclick="voltarmes()"> < Anterior </button>
        <button class="px-4 py-2 border rounded hover:bg-gray-100" onclick="passarmes()"> Próximo > </button>
        <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" onclick="chamaCriarTarefa()"> + Nova Tarefa </button>
    </div>`;

    document.getElementById("TabelaDias").innerHTML = boxDias;
}

function chamaCriarTarefa() {
    var formulario = `<form name="tarefa" action="javascript:;" onsubmit="criartarefa()" class="m-4">
            Data: <input type="date" name="Data"><br>
            Tarefa <input type="text" name="Tarefa"><br>
            <input type="submit" value="Submit">
        </form>`
    document.getElementById("TabelaDias").innerHTML = formulario;
}

function criartarefa() {
    const dataInput = document.forms["tarefa"]["Data"].value;
    const tarefaTexto = document.forms["tarefa"]["Tarefa"].value;
    if (!dataInput || !tarefaTexto) return alert("Preencha todos os campos!");
    const dataObjeto = new Date(dataInput + "T00:00:00");
    const m = dataObjeto.getMonth(); // 0-11
    const d = dataObjeto.getDate();  // 1-31
    if (!DatasTarefas[m]) {
        DatasTarefas[m] = {};
    }
    DatasTarefas[m][d] = tarefaTexto;
    TabeladosDias();
}