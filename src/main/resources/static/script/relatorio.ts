import { requestBack } from './funcoes.js';

declare const ExcelJS: any;
declare const saveAs: any;
declare const lucide: any;

export function exibirRelatorio() {
    const btnFiltro = document.getElementById("btnFiltro") as HTMLButtonElement;
    const tabelaBody = document.getElementById("produtosRelatorios") as HTMLTableSectionElement;
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
                        <td class="col-filial">${item.distribuicaoFiliais["Bonito"] || 0}</td>
                        <td class="col-filial">${item.distribuicaoFiliais["Aquidauana"] || 0}</td>
                        <td class="col-filial">${item.distribuicaoFiliais["Dois Irmãos"] || 0}</td>
                        <td class="col-filial">${item.distribuicaoFiliais["Jardim/Nioaque"] || 0}</td>
                        <td class="col-filial">${item.distribuicaoFiliais["Bodoquena"] || 0}</td>
                    `;
                });
            }
        });
    }
}

export function excel() {
    const btnExportar = document.getElementById("btnExportarExcel") as HTMLButtonElement;

    if (btnExportar) {
        btnExportar.addEventListener("click", async () => {
            console.log("Gerando Relatório - Layout Empresarial Premium v2!"); 
            
            const dataInicioInput = document.getElementById("dataInicioInput") as HTMLInputElement;
            const dataFimInput = document.getElementById("dataFimInput") as HTMLInputElement;
            const tabelaBody = document.getElementById("produtosRelatorios") as HTMLTableSectionElement;

            if (!tabelaBody || tabelaBody.rows.length === 0) {
                alert("Não há dados na tabela para exportar! Gere o relatório primeiro.");
                return;
            }

            const formatarDataBr = (dataStr: string) => {
                if (!dataStr) return "";
                const [ano, mes, dia] = dataStr.split("-");
                return `${dia}/${mes}/${ano}`;
            };

            const periodoTexto = `Período Solicitado: ${formatarDataBr(dataInicioInput?.value)} até ${formatarDataBr(dataFimInput?.value)}`;

            const workbook = new ExcelJS.Workbook(); 
            const worksheet = workbook.addWorksheet('Relatório');

            worksheet.views = [{ showGridLines: false }];

            worksheet.addRow([]).height = 10; 

            // Alterado de G2 para H2 para cobrir todas as 8 colunas
            const rowEmpresa = worksheet.addRow(['', 'IVRNET PEDIDOS']);
            worksheet.mergeCells('B2:H2');
            rowEmpresa.getCell(2).font = { name: 'Segoe UI', size: 18, bold: true, color: { argb: 'FF1A2B4C' } };
            rowEmpresa.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
            rowEmpresa.height = 25;

            // Alterado de G3 para H3
            const rowTitulo = worksheet.addRow(['', 'RELATÓRIO DE MOVIMENTAÇÃO DE PRODUTOS POR FILIAIS']);
            worksheet.mergeCells('B3:H3');
            rowTitulo.getCell(2).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF475569' } };
            rowTitulo.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
            rowTitulo.height = 18;

            // Alterado de G4 para H4
            const rowPeriodo = worksheet.addRow(['', periodoTexto]);
            worksheet.mergeCells('B4:H4');
            rowPeriodo.getCell(2).font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF8E9BAE' } };
            rowPeriodo.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
            rowPeriodo.height = 18;

            const rowSeparador = worksheet.addRow([]);
            rowSeparador.height = 10;
            // 🚀 CORREÇÃO AQUI: For indo até 8 (Bodoquena)
            for (let i = 1; i <= 8; i++) {
                worksheet.getCell(5, i).border = { bottom: { style: 'medium', color: { argb: 'FF0056B3' } } };
            }

            worksheet.addRow([]).height = 15;

            try {
                const urlLogo = './img/logo.png';
                const res = await fetch(urlLogo);
                const blob = await res.blob();
                const base64Text = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve((reader.result as string).split(',')[1]); 
                    reader.readAsDataURL(blob);
                });

                const imageId = workbook.addImage({ base64: base64Text, extension: 'png' });

                worksheet.addImage(imageId, {
                    tl: { col: 0.2, row: 0.2 },
                    ext: { width: 190, height: 110 } 
                });
            } catch (error) {
                console.warn("Sem logo disponível", error);
            }

            // 🚀 CORREÇÃO AQUI: Adicionado Bodoquena no array de cabeçalhos do Excel
            const cabecalho = [
                "Nome do Produto", 
                "Unid.", 
                "Qtd Total", 
                "📍 Bonito", 
                "📍 Aquidauana", 
                "📍 Dois Irmãos", 
                "📍 Jardim/Nioaque",
                "📍 Bodoquena"
            ];
            const headerRow = worksheet.addRow(cabecalho);
            headerRow.height = 30;

            headerRow.eachCell((cell: any, colNumber: number) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A2B4C' } };
                cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
                cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 ? 'left' : 'center', wrapText: true };
                
                cell.border = {
                    top: { style: 'medium', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    left: colNumber === 1 ? { style: 'medium', color: { argb: 'FF000000' } } : { style: 'thin', color: { argb: 'FF000000' } },
                    right: colNumber === 8 ? { style: 'medium', color: { argb: 'FF000000' } } : { style: 'thin', color: { argb: 'FF000000' } } // Mudou limite de borda pra 8
                };
            });

            const rowsHtml = Array.from(tabelaBody.rows);
            rowsHtml.forEach((rowHtml, index) => {
                const celulas = (rowHtml as HTMLTableRowElement).cells;
                // 🚀 CORREÇÃO AQUI: Esperando no mínimo 8 células agora
                if (celulas.length >= 8) {
                    const dataRow = worksheet.addRow([
                        celulas[0].textContent?.trim() || "",
                        celulas[1].textContent?.trim() || "",
                        Number(celulas[2].textContent?.trim() || 0),
                        Number(celulas[3].textContent?.trim() || 0),
                        Number(celulas[4].textContent?.trim() || 0),
                        Number(celulas[5].textContent?.trim() || 0),
                        Number(celulas[6].textContent?.trim() || 0),
                        Number(celulas[7].textContent?.trim() || 0) // Lendo o dado do Bodoquena HTML
                    ]);
                    
                    dataRow.height = 24;
                    const isLastRow = index === rowsHtml.length - 1;
                    const isOddRow = index % 2 !== 0;

                    dataRow.eachCell((cell: any, colNumber: number) => {
                        cell.font = { name: 'Segoe UI', size: 10, bold: colNumber === 3, color: { argb: 'FF000000' } };
                        cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 ? 'left' : 'center' };
                        
                        if (isOddRow) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4F7FA' } };
                        }

                        if (colNumber !== 1 && colNumber !== 2) {
                            cell.numFmt = '#,##0';
                        }

                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FF000000' } },
                            bottom: isLastRow ? { style: 'medium', color: { argb: 'FF000000' } } : { style: 'thin', color: { argb: 'FF000000' } },
                            left: colNumber === 1 ? { style: 'medium', color: { argb: 'FF000000' } } : { style: 'thin', color: { argb: 'FF000000' } },
                            right: colNumber === 8 ? { style: 'medium', color: { argb: 'FF000000' } } : { style: 'thin', color: { argb: 'FF000000' } } // Borda final da direita na 8
                        };
                    });
                }
            });

            worksheet.columns = [
                { width: 38 }, // A - Produto (e parte da logo)
                { width: 10 }, // B - Unid
                { width: 14 }, // C - Qtd Total 
                { width: 18 }, // D - Bonito
                { width: 18 }, // E - Aquidauana
                { width: 18 }, // F - Dois Irmãos
                { width: 18 }, // G - Jardim
                { width: 18 }  // H - Bodoquena 
            ];

            const buffer = await workbook.xlsx.writeBuffer();
            const dataHoje = new Date().toISOString().split('T')[0];
            saveAs(new Blob([buffer]), `Relatorio_Empresarial_${dataHoje}.xlsx`);
        });
    }
}