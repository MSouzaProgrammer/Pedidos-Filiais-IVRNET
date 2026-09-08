package com.ivr.pedidosfiliais.services;


import com.ivr.pedidosfiliais.dto.response.EstoqueProdutoIXCDTO;
import com.ivr.pedidosfiliais.dto.response.EstoqueProdutosIXCResponse;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class IxcProdutoService {

    private static final String ENDPOINT_ESTOQUE =
            "/webservice/v1/estoque_produtos_almox_filial";

    private static final String FILIAL_MATRIZ = "1";
    private static final String ALMOX_MATRIZ = "1";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${ixc.url}")
    private String url;

    @Value("${ixc.usuario}")
    private String usuario;

    @Value("${ixc.token}")
    private String token;

    public IxcProdutoService(ObjectMapper objectMapper) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = objectMapper;
    }

    /**
     * Busca o estoque de TODOS os produtos no:
     *
     * Filial 1
     * Almoxarifado 1 - Matriz
     *
     * Faz apenas UMA chamada ao IXC.
     */
    public Map<Long, Long> buscarEstoquesMatriz() {

        String endpoint = url + ENDPOINT_ESTOQUE;

        String json = """
                {
                    "qtype": "estoque_produtos_almox_filial.id_filial",
                    "query": "1",
                    "oper": "=",
                    "page": "1",
                    "rp": "10000",
                    "sortname": "estoque_produtos_almox_filial.id",
                    "sortorder": "desc"
                }
                """;

        String credenciais = usuario + ":" + token;

        String basicAuth = Base64.getEncoder()
                .encodeToString(
                        credenciais.getBytes(StandardCharsets.UTF_8)
                );

        System.out.println("======================================");
        System.out.println("CONSULTANDO ESTOQUE DA MATRIZ NO IXC");
        System.out.println("Endpoint: " + endpoint);
        System.out.println("Filial: " + FILIAL_MATRIZ);
        System.out.println("Almoxarifado: " + ALMOX_MATRIZ);
        System.out.println("======================================");

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Authorization", "Basic " + basicAuth)
                .header("ixcsoft", "listar")
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        try {

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            System.out.println("STATUS IXC: " + response.statusCode());
            System.out.println("RESPOSTA IXC:");
            System.out.println(response.body());

            if (response.statusCode() < 200 ||
                    response.statusCode() >= 300) {

                throw new RuntimeException(
                        "Erro HTTP ao consultar IXC: "
                                + response.statusCode()
                                + " - "
                                + response.body()
                );
            }

            /*
             * Primeiro verificamos se o IXC devolveu um erro
             * dentro do JSON mesmo com HTTP 200.
             */
            JsonNode jsonNode =
                    objectMapper.readTree(response.body());

            if (jsonNode.has("type")
                    && "error".equalsIgnoreCase(
                            jsonNode.path("type").asText()
                    )) {

                throw new RuntimeException(
                        "IXC recusou a consulta: "
                                + jsonNode.path("message").asText()
                );
            }

            EstoqueProdutosIXCResponse dados =
                    objectMapper.readValue(
                            response.body(),
                            EstoqueProdutosIXCResponse.class
                    );

            if (dados == null ||
                    dados.registros() == null) {

                System.out.println(
                        "IXC não retornou registros."
                );

                return new HashMap<>();
            }

            Map<Long, Long> estoquePorProduto =
                    new HashMap<>();

            for (EstoqueProdutoIXCDTO registro :
                    dados.registros()) {

                /*
                 * Queremos SOMENTE:
                 *
                 * filial 1
                 * almoxarifado 1
                 */
                if (!FILIAL_MATRIZ.equals(
                        registro.id_filial())) {

                    continue;
                }

                if (!ALMOX_MATRIZ.equals(
                        registro.id_almox())) {

                    continue;
                }

                if ("N".equalsIgnoreCase(
                        registro.almox_ativo())) {

                    continue;
                }

                if (registro.id_produto() == null ||
                        registro.id_produto().isBlank()) {

                    continue;
                }

                long idProduto =
                        Long.parseLong(
                                registro.id_produto()
                        );

                long saldo = 0L;

                if (registro.saldo() != null &&
                        !registro.saldo().isBlank()) {

                    saldo = new BigDecimal(
                            registro.saldo()
                    ).longValue();
                }

                estoquePorProduto.put(
                        idProduto,
                        saldo
                );
            }

            System.out.println(
                    "Produtos com estoque encontrados: "
                            + estoquePorProduto.size()
            );

            return estoquePorProduto;

        } catch (InterruptedException e) {

            Thread.currentThread().interrupt();

            throw new RuntimeException(
                    "A consulta ao IXC foi interrompida.",
                    e
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Erro ao consultar estoque da Matriz no IXC.",
                    e
            );
        }
    }

    /**
     * Método opcional para buscar somente um produto.
     * Mantido para caso você precise dele em outra parte do sistema.
     */
    public Long buscarEstoqueMatriz(Long idProduto) {

        Map<Long, Long> estoques =
                buscarEstoquesMatriz();

        return estoques.getOrDefault(
                idProduto,
                0L
        );
    }
}