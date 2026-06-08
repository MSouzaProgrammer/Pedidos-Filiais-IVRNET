package com.ivr.pedidosfiliais.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ivr.pedidosfiliais.interfaces.RelatorioPedidoResponse;
import com.ivr.pedidosfiliais.services.RelatorioService;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    private final RelatorioService relatorioService;

    // Injeta o serviço que criámos no passo anterior
    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @GetMapping("/distribuicao")
    public ResponseEntity<List<RelatorioPedidoResponse>> obterRelatorioDistribuicao(
            @RequestParam("inicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam("fim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        
        // Chama a lógica do Service passando as datas recebidas do Front-end
        List<RelatorioPedidoResponse> dadosRelatorio = relatorioService.gerarRelatorioPorPeriodo(dataInicio, dataFim);
        
        // Devolve a lista em formato JSON com o status HTTP 200 (OK)
        return ResponseEntity.ok(dadosRelatorio);
    }
}
