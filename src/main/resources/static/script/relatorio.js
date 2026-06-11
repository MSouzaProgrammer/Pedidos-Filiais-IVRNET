import { requestBack } from './funcoes.js';
export function exibirRelatorio() {
    const btnFiltro = document.getElementById("btnFiltro");
    const tabelaBody = document.getElementById("produtosRelatorios");
    const dataInicioInput = document.getElementById("dataInicioInput");
    const dataFimInput = document.getElementById("dataFimInput");
    if (btnFiltro) {
        btnFiltro.addEventListener('click', async () => {
            const dataInicio = dataInicioInput?.value;
            const dataFim = dataFimInput?.value;
            if (!dataInicio || !dataFim) {
                alert("Por favor, selecione as datas!");
                return;
            }
            const urlComFiltro = `api/relatorios/distribuicao?inicio=${dataInicio}&fim=${dataFim}`;
            const response = await requestBack(urlComFiltro, "GET", null);
            const dadosRelatorio = await response.json();
            if (dadosRelatorio && Array.isArray(dadosRelatorio)) {
                tabelaBody.innerHTML = "";
                dadosRelatorio.forEach(item => {
                    const novaLinha = tabelaBody.insertRow(-1);
                    novaLinha.innerHTML = `
                        <td class="text-left">${item.nomeProduto}</td>
                        <td class="text-center">${item.undMedida || 'UND'}</td> 
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
    const btnExportar = document.getElementById("btnExportarExcel");
    if (btnExportar) {
        btnExportar.addEventListener("click", () => {
            const dataInicioInput = document.getElementById("dataInicioInput");
            const dataFimInput = document.getElementById("dataFimInput");
            const tabelaBody = document.getElementById("produtosRelatorios");
            if (!tabelaBody || tabelaBody.rows.length === 0) {
                alert("Não há dados na tabela para exportar! Gere o relatório primeiro.");
                return;
            }
            const formatarDataBr = (dataStr) => {
                if (!dataStr)
                    return "";
                const [ano, mes, dia] = dataStr.split("-");
                return `${dia}/${mes}/${ano}`;
            };
            const periodoTexto = `Período Solicitado: ${formatarDataBr(dataInicioInput?.value)} até ${formatarDataBr(dataFimInput?.value)}`;
            // Guarda o total de linhas para sabermos exatamente qual será a última
            const totalLinhas = tabelaBody.rows.length;
            // 1. Início da montagem do HTML - Mantendo seu layout e estilo azul
            let htmlExcel = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <style>
                    /* Força o Excel a colar as bordas e respeitar os estilos de contorno */
                    table { border-collapse: collapse; }
                    td, th { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; vertical-align: middle; }
                    
                    /* Cabeçalho de Identificação */
                    .titulo-empresa { font-size: 20pt; font-weight: bold; color: #0056B3; letter-spacing: 0.5px; }
                    .destaque-logo { color: #0056B3; font-size: 22pt; } 
                    .subtitulo-empresa { font-size: 11pt; color: #0056B3; height: 22px; font-weight: bold; }
                    .periodo-empresa { font-size: 10pt; font-style: italic; color: #64748B; height: 22px; }
                    
                    /* Base do estilo do Cabeçalho da Tabela */
                    .th-header { background-color: #1A2B4C; color: #FFFFFF; font-weight: bold; text-align: center; height: 32px; }
                    
                    /* Formatações de Célula no Excel */
                    .td-texto { mso-number-format: "\\@"; } 
                    .td-numero { mso-number-format: "\\#\\,\\#\\#0"; } 
                </style>
            </head>
            <body>
                <table style="border-collapse: collapse;">
                    <colgroup>
                        <col width="320"> <col width="80">  <col width="110"> <col width="160"> <col width="150"> <col width="150"> <col width="150"> </colgroup>
                    <tbody>
                        <tr style="height: 55px;">
                            <td colspan="7" class="titulo-empresa" style="vertical-align: middle; border: none;">
                                <span class="destaque-logo">■</span> IVRNET Pedidos
                            </td>
                        </tr>
                        <tr><td colspan="7" class="subtitulo-empresa" style="border: none;">CONSOLIDADO DE DISTRIBUIÇÃO DE ESTOQUE POR FILIAIS</td></tr>
                        <tr><td colspan="7" class="periodo-empresa" style="border: none;">${periodoTexto}</td></tr>
                        <tr style="height: 15px;"><td colspan="7" style="border: none;"></td></tr> 
                        
                        <tr>
                            <th class="th-header" style="text-align: left; padding-left: 5px; border-top: 1.5pt solid black; border-left: 1.5pt solid black; border-bottom: .5pt solid black; border-right: .5pt solid black;">Nome do Produto</th>
                            <th class="th-header" style="border-top: 1.5pt solid black; border-left: .5pt solid black; border-bottom: .5pt solid black; border-right: .5pt solid black;">Unid.</th>
                            <th class="th-header" style="border-top: 1.5pt solid black; border-left: .5pt solid black; border-bottom: .5pt solid black; border-right: .5pt solid black;">Qtd Total</th>
                            <th class="th-header" style="border-top: 1.5pt solid black; border-left: .5pt solid black; border-bottom: .5pt solid black; border-right: .5pt solid black;">📍 Bonito/Bodoquena</th>
                            <th class="th-header" style="border-top: 1.5pt solid black; border-left: .5pt solid black; border-bottom: .5pt solid black; border-right: .5pt solid black;">📍 Aquidauana</th>
                            <th class="th-header" style="border-top: 1.5pt solid black; border-left: .5pt solid black; border-bottom: .5pt solid black; border-right: .5pt solid black;">📍 Dois Irmãos</th>
                            <th class="th-header" style="border-top: 1.5pt solid black; border-left: .5pt solid black; border-bottom: .5pt solid black; border-right: 1.5pt solid black;">📍 Jardim/Nioaque</th>
                        </tr>
            `;
            // 2. Injeta os dados com o Zebrado e aplicando a Borda Grossa apenas nas extremidades
            Array.from(tabelaBody.rows).forEach((row, index) => {
                const celulas = row.cells;
                const corFundo = index % 2 === 0 ? "#FFFFFF" : "#F2F5F9";
                // 🌟 Descobre se é a última linha de dados para fechar o contorno grosso embaixo
                const ehUltimaLinha = index === totalLinhas - 1;
                const bordaBaixo = ehUltimaLinha ? "1.5pt solid black" : ".5pt solid black";
                if (celulas.length >= 7) {
                    htmlExcel += `
                        <tr style="background-color: ${corFundo}; height: 26px; color: #000000;">
                            <td class="td-texto" style="text-align: left; padding-left: 5px; border-top: .5pt solid black; border-left: 1.5pt solid black; border-right: .5pt solid black; border-bottom: ${bordaBaixo};">${celulas[0].textContent?.trim() || ""}</td>
                            
                            <td class="td-texto" style="text-align: center; border-top: .5pt solid black; border-left: .5pt solid black; border-right: .5pt solid black; border-bottom: ${bordaBaixo};">${celulas[1].textContent?.trim() || ""}</td>
                            <td class="td-numero" style="text-align: center; font-weight: bold; border-top: .5pt solid black; border-left: .5pt solid black; border-right: .5pt solid black; border-bottom: ${bordaBaixo};">${celulas[2].textContent?.trim() || "0"}</td>
                            <td class="td-numero" style="text-align: center; border-top: .5pt solid black; border-left: .5pt solid black; border-right: .5pt solid black; border-bottom: ${bordaBaixo};">${celulas[3].textContent?.trim() || "0"}</td>
                            <td class="td-numero" style="text-align: center; border-top: .5pt solid black; border-left: .5pt solid black; border-right: .5pt solid black; border-bottom: ${bordaBaixo};">${celulas[4].textContent?.trim() || "0"}</td>
                            <td class="td-numero" style="text-align: center; border-top: .5pt solid black; border-left: .5pt solid black; border-right: .5pt solid black; border-bottom: ${bordaBaixo};">${celulas[5].textContent?.trim() || "0"}</td>
                            
                            <td class="td-numero" style="text-align: center; border-top: .5pt solid black; border-left: .5pt solid black; border-right: 1.5pt solid black; border-bottom: ${bordaBaixo};">${celulas[6].textContent?.trim() || "0"}</td>
                        </tr>
                    `;
                }
            });
            htmlExcel += `
                    </tbody>
                </table>
            </body>
            </html>
            `;
            // 3. Dispara o arquivo para o navegador baixar
            const blob = new Blob([htmlExcel], { type: "application/vnd.ms-excel;charset=utf-8" });
            const urlUrl = URL.createObjectURL(blob);
            const linkDownload = document.createElement("a");
            const dataHoje = new Date().toISOString().split('T')[0];
            linkDownload.href = urlUrl;
            linkDownload.download = `IVRNET_Relatorio_Estoque_${dataHoje}.xls`;
            document.body.appendChild(linkDownload);
            linkDownload.click();
            document.body.removeChild(linkDownload);
        });
    }
}
