package com.ivr.pedidosfiliais.services;

import org.springframework.stereotype.Service;

import com.ivr.pedidosfiliais.interfaces.RegistroBrutoRelatorio;
import com.ivr.pedidosfiliais.interfaces.RelatorioPedidoResponse;
import com.ivr.pedidosfiliais.repository.ProdutoPedidoRepository;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RelatorioService {

    private final ProdutoPedidoRepository produtoPedidoRepository;

    public RelatorioService(ProdutoPedidoRepository produtoPedidoRepository) {
        this.produtoPedidoRepository = produtoPedidoRepository;
    }

    public List<RelatorioPedidoResponse> gerarRelatorioPorPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        List<RegistroBrutoRelatorio> registrosBrutos = produtoPedidoRepository.buscarDadosBrutosRelatorioPorData(dataInicio, dataFim);

        // Agrupamos apenas pelo nome do produto
        Map<String, List<RegistroBrutoRelatorio>> agrupados = registrosBrutos.stream()
            .collect(Collectors.groupingBy(RegistroBrutoRelatorio::getName));

        List<RelatorioPedidoResponse> listaRelatorioFinal = new ArrayList<>();

        for (Map.Entry<String, List<RegistroBrutoRelatorio>> entry : agrupados.entrySet()) {
            List<RegistroBrutoRelatorio> itensDoGrupo = entry.getValue();
            RegistroBrutoRelatorio primeiroItem = itensDoGrupo.get(0); 

            Map<String, Integer> distribuicao = new HashMap<>();
            distribuicao.put("Bonito/Bodoquena", 0);
            distribuicao.put("Aquidauana", 0);
            distribuicao.put("Dois Irmãos", 0);
            distribuicao.put("Jardim/Nioaque", 0);

            int somaQuantidadeTotal = 0;

            for (RegistroBrutoRelatorio item : itensDoGrupo) {
                int numeroFilial = item.getFilial();
                int qtdEnviada = item.getQuantEnviada() != null ? item.getQuantEnviada() : 0;

                if (numeroFilial == 1) {
                    distribuicao.put("Bonito/Bodoquena", distribuicao.get("Bonito/Bodoquena") + qtdEnviada);
                } else if (numeroFilial == 2) {
                    distribuicao.put("Aquidauana", distribuicao.get("Aquidauana") + qtdEnviada);
                } else if (numeroFilial == 3) {
                    distribuicao.put("Dois Irmãos", distribuicao.get("Dois Irmãos") + qtdEnviada);
                } else if (numeroFilial == 4) {
                    distribuicao.put("Jardim/Nioaque", distribuicao.get("Jardim/Nioaque") + qtdEnviada);
                }

                somaQuantidadeTotal += qtdEnviada;
            }

            // Só adiciona se a quantidade for maior que zero
            if (somaQuantidadeTotal > 0) {
                // 🌟 ATUALIZADO: Agora incluindo o primeiroItem.getUndMedida()
                listaRelatorioFinal.add(new RelatorioPedidoResponse(
                    primeiroItem.getName(),
                    primeiroItem.getUndMedida(), 
                    somaQuantidadeTotal,
                    distribuicao
                ));
            }
        }

        // Ordena a lista do MAIOR para o MENOR com base na 'quantidadeTotal'
        listaRelatorioFinal.sort((a, b) -> b.quantidadeTotal().compareTo(a.quantidadeTotal()));

        return listaRelatorioFinal;
    }
}