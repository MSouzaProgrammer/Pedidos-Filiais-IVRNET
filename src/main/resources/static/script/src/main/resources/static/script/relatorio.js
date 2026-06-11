"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.exibirRelatorio = exibirRelatorio;
exports.excel = excel;
const funcoes_js_1 = require("./funcoes.js");
const ExcelJS = __importStar(require("exceljs")); // 🌟 CORRIGIDO: Importa tudo como o objeto ExcelJS
const file_saver_1 = require("file-saver");
function exibirRelatorio() {
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
            const response = await (0, funcoes_js_1.requestBack)(urlComFiltro, "GET", null);
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
function excel() {
    const btnExportar = document.getElementById("btnExportarExcel");
    if (btnExportar) {
        btnExportar.addEventListener("click", async () => {
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
            // 1. Instanciar o Workbook de forma correta usando o namespace
            const workbook = new ExcelJS.Workbook(); // 🌟 CORRIGIDO
            const worksheet = workbook.addWorksheet('Distribuição');
            // 2. Título Principal
            const r1 = worksheet.addRow(['■ IVRNET Pedidos']);
            worksheet.mergeCells('A1:G1');
            r1.getCell(1).font = { name: 'Segoe UI', size: 20, bold: true, color: { argb: 'FF0056B3' } };
            r1.height = 35;
            // Subtítulo
            const r2 = worksheet.addRow(['CONSOLIDADO DE DISTRIBUIÇÃO DE ESTOQUE POR FILIAIS']);
            worksheet.mergeCells('A2:G2');
            r2.getCell(1).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF0056B3' } };
            r2.height = 20;
            // Período
            const r3 = worksheet.addRow([periodoTexto]);
            worksheet.mergeCells('A3:G3');
            r3.getCell(1).font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF64748B' } };
            r3.height = 20;
            // Linha em branco de espaço
            worksheet.addRow([]);
            // 3. Cabeçalho da Tabela (Linha 5)
            const cabecalho = [
                "Nome do Produto",
                "Unid.",
                "Qtd Total",
                "📍 Bonito/Bodoquena",
                "📍 Aquidauana",
                "📍 Dois Irmãos",
                "📍 Jardim/Nioaque"
            ];
            const headerRow = worksheet.addRow(cabecalho);
            headerRow.height = 32;
            // 🌟 CORRIGIDO: Parâmetros tipados explicitamente para o TS não reclamar
            headerRow.eachCell((cell, colNumber) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A2B4C' } };
                cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
                cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 ? 'left' : 'center', wrapText: true };
                cell.border = {
                    top: { style: 'medium', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    left: colNumber === 1 ? { style: 'medium', color: { argb: 'FF000000' } } : { style: 'thin', color: { argb: 'FF000000' } },
                    right: colNumber === 7 ? { style: 'medium', color: { argb: 'FF000000' } } : { style: 'thin', color: { argb: 'FF000000' } }
                };
            });
            // 4. Injetar as linhas de dados da tabela HTML
            const rowsHtml = Array.from(tabelaBody.rows);
            rowsHtml.forEach((rowHtml, index) => {
                const celulas = rowHtml.cells;
                if (celulas.length >= 7) {
                    const dataRow = worksheet.addRow([
                        celulas[0].textContent?.trim() || "",
                        celulas[1].textContent?.trim() || "",
                        Number(celulas[2].textContent?.trim() || 0),
                        Number(celulas[3].textContent?.trim() || 0),
                        Number(celulas[4].textContent?.trim() || 0),
                        Number(celulas[5].textContent?.trim() || 0),
                        Number(celulas[6].textContent?.trim() || 0)
                    ]);
                    dataRow.height = 26;
                    const isLastRow = index === rowsHtml.length - 1;
                    const isOddRow = index % 2 !== 0;
                    // 🌟 CORRIGIDO: Parâmetros tipados explicitamente aqui também
                    dataRow.eachCell((cell, colNumber) => {
                        cell.font = { name: 'Segoe UI', size: 10, bold: colNumber === 3, color: { argb: 'FF000000' } };
                        cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 ? 'left' : 'center' };
                        if (isOddRow) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F5F9' } };
                        }
                        if (colNumber !== 1 && colNumber !== 2) {
                            cell.numFmt = '#,##0';
                        }
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FF000000' } },
                            bottom: isLastRow ? { style: 'medium', color: { argb: 'FF000000' } } : { style: 'thin', color: { argb: 'FF000000' } },
                            left: colNumber === 1 ? { style: 'medium', color: { argb: 'FF000000' } } : { style: 'thin', color: { argb: 'FF000000' } },
                            right: colNumber === 7 ? { style: 'medium', color: { argb: 'FF000000' } } : { style: 'thin', color: { argb: 'FF000000' } }
                        };
                    });
                }
            });
            // 5. Configurar a largura das colunas
            worksheet.columns = [
                { width: 38 }, // A - Produto
                { width: 10 }, // B - Unid
                { width: 14 }, // C - Qtd Total
                { width: 22 }, // D - Bonito
                { width: 18 }, // E - Aquidauana
                { width: 18 }, // F - Dois Irmãos
                { width: 18 } // G - Jardim
            ];
            // 6. Gerar o Buffer binário e salvar
            const buffer = await workbook.xlsx.writeBuffer();
            const dataHoje = new Date().toISOString().split('T')[0];
            (0, file_saver_1.saveAs)(new Blob([buffer]), `IVRNET_Relatorio_Estoque_${dataHoje}.xlsx`);
        });
    }
}
//# sourceMappingURL=relatorio.js.map