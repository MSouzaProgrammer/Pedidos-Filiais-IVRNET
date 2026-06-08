import { requestBack } from './funcoes.js';
declare const lucide: any;
declare const XLSX: any;

export function exibirRelatorio() {
    const btnFiltro = document.getElementById("btnFiltro") as HTMLButtonElement;

    // Captura o tbody usando o tipo correto que vimos antes (HTMLTableSectionElement)
    const tabelaBody = document.getElementById("produtosRelatorios") as HTMLTableSectionElement;

    // Captura os inputs de data da sua tela HTML
    const dataInicioInput = document.getElementById("dataInicioInput") as HTMLInputElement;
    const dataFimInput = document.getElementById("dataFimInput") as HTMLInputElement;

    if (btnFiltro) {
        btnFiltro.addEventListener('click', async () => {
            const dataInicio = dataInicioInput?.value;
            const dataFim = dataFimInput?.value;

            if (!dataInicio || !dataFim) {
                alert("Por favor, selecione as datas!");
                return;
            }

            const urlComFiltro = `api/relatorios/distribuicao?inicio=${dataInicio}&fim=${dataFim}`;

            // 1. Faz a requisição (guarda o "embrulho" do Response)
            const response = await requestBack(urlComFiltro, "GET", null);

            // 2. 🌟 O SEGREDO ESTÁ AQUI: Extrai os dados de verdade do embrulho!
            // Se a sua função 'requestBack' já devolve o response puro do fetch, fazemos assim:
            const dadosRelatorio = await response.json();

            // Vamos dar um log para ver a lista de produtos linda e mastigada no console
            console.log("DADOS REAIS:", dadosRelatorio);

            // 3. Agora sim, varre os dados reais para desenhar na tabela
            if (dadosRelatorio && Array.isArray(dadosRelatorio)) {
                tabelaBody.innerHTML = ""; // Limpa as linhas antigas

                dadosRelatorio.forEach(item => {
                    const novaLinha = tabelaBody.insertRow(-1);
                    novaLinha.innerHTML = `
                        <td class="text-left">${item.nomeProduto}</td>
                        <td class="text-center"><strong>${item.quantidadeTotal}</strong></td>
                        <td class="col-filial">${item.distribuicaoFiliais["Bonito/Bodoquena"] || 0}</td>
                        <td class="col-filial">${item.distribuicaoFiliais["Aquidauana"] || 0}</td>
                        <td class="col-filial">${item.distribuicaoFiliais["Dois Irmãos"] || 0}</td>
                        <td class="col-filial">${item.distribuicaoFiliais["Jardim/Nioaque"] || 0}</td>
                    `;
                });
            }
        });
    }
}

export function excel() {
    const btnExportar = document.getElementById("btnExportarExcel") as HTMLButtonElement;

    if (btnExportar) {
        btnExportar.addEventListener("click", () => {
            const tabela = document.querySelector(".tabela-relatorio") as HTMLTableElement;

            if (!tabela) {
                alert("Não há dados na tabela para exportar!");
                return;
            }

            // 1. Converte a tabela HTML para um objeto de aba (Worksheet)
            const ws = XLSX.utils.table_to_sheet(tabela);

            // 2. 🌟 AJUSTE AUTOMÁTICO DE LARGURA DAS COLUNAS (Evita o texto cortado)
            // Varre a tabela para descobrir qual o maior texto de cada coluna e ajusta o tamanho
            const colunasLargura = [{ wch: 30 }, { wch: 12 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
            ws['!cols'] = colunasLargura;

            // 3. 🌟 ESTILIZAÇÃO DAS CÉLULAS (Cores, Fontes e Alinhamentos)
            // Vamos passar por todas as células da planilha aplicando o design executivo
            for (let cellRef in ws) {
                // Ignora propriedades internas que começam com '!'
                if (cellRef[0] === '!') continue;

                const celula = ws[cellRef];
                
                // Descobre a linha da célula (ex: 'A1' -> linha 1, 'B5' -> linha 5)
                const numeroLinha = parseInt(cellRef.replace(/[^0-9]/g, ''), 10);

                // Se for a linha 1, é o CABEÇALHO (THEAD)
                if (numeroLinha === 1) {
                    celula.s = {
                        fill: { fgColor: { rgb: "1E293B" } }, // Fundo Slate Escuro (Estilo Dark do seu app)
                        font: { name: "Arial", size: 11, bold: true, color: { rgb: "FFFFFF" } }, // Texto Branco
                        alignment: { vertical: "center", horizontal: "center", wrapText: true },
                        border: { bottom: { style: "medium", color: { rgb: "334155" } } }
                    };
                } else {
                    // Caso contrário, são as linhas de DADOS (TBODY)
                    const ehColunaProduto = cellRef.startsWith('A'); // Coluna A é o nome do produto
                    
                    celula.s = {
                        font: { name: "Arial", size: 10, color: { rgb: "334155" } },
                        alignment: { 
                            vertical: "center", 
                            // Alinha o produto à esquerda e o resto (números) ao centro
                            horizontal: ehColunaProduto ? "left" : "center" 
                        },
                        border: {
                            bottom: { style: "thin", color: { rgb: "E2E8F0" } } // Linha divisória sutil cinza
                        }
                    };

                    // Se for a coluna "Qtd Total" (Coluna B), vamos deixar o número em negrito
                    if (cellRef.startsWith('B')) {
                        celula.s.font.bold = true;
                    }
                }
            }

            // 4. Cria o livro e adiciona a aba estilizada
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Distribuição de Estoque");

            // 5. Dispara o download
            const dataHoje = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, `Relatorio_Estoque_Consolidado_${dataHoje}.xlsx`);
        });
    }
}