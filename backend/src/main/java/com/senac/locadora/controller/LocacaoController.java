package com.senac.locadora.controller;

import com.senac.locadora.model.*;
import com.senac.locadora.repository.*;
import org.springframework.web.bind.annotation.*;

import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/locacoes")
public class LocacaoController {

    private final LocacaoRepository locacaoRepository;
    private final VeiculoRepository veiculoRepository;
    private final ClienteRepository clienteRepository;
    private final SeguroRepository seguroRepository;

    public LocacaoController(LocacaoRepository locacaoRepository, VeiculoRepository veiculoRepository,
                              ClienteRepository clienteRepository, SeguroRepository seguroRepository) {
        this.locacaoRepository = locacaoRepository;
        this.veiculoRepository = veiculoRepository;
        this.clienteRepository = clienteRepository;
        this.seguroRepository = seguroRepository;
    }

    @GetMapping
    public List<Locacao> listar() {
        return locacaoRepository.findAll();
    }

    // Cria uma nova locação com validações de disponibilidade e cálculo do período.
    @PostMapping
    public Locacao criar(@RequestBody LocacaoRequest req) {
        Veiculo veiculo = veiculoRepository.findById(req.veiculoId)
                .orElseThrow(() -> new RuntimeException("Veículo não encontrado"));
        Cliente cliente = clienteRepository.findById(req.clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        if (req.dataInicio == null || req.dataFimPrevista == null || !req.dataFimPrevista.isAfter(req.dataInicio)) {
            throw new RuntimeException("A data de fim prevista deve ser posterior à data de início");
        }

        if ("MANUTENCAO".equalsIgnoreCase(veiculo.getStatus())) {
            throw new RuntimeException("Veículo em manutenção não pode ser alugado");
        }

        boolean possuiConflito = locacaoRepository.findAllByVeiculoIdAndStatus(veiculo.getId(), "ATIVA")
                .stream()
                .anyMatch(existente ->
                        req.dataInicio.isBefore(existente.getDataFimPrevista()) &&
                        req.dataFimPrevista.isAfter(existente.getDataInicio()));

        if (possuiConflito) {
            throw new RuntimeException("Veículo já possui uma locação ativa no período informado");
        }

        long dias = ChronoUnit.DAYS.between(req.dataInicio, req.dataFimPrevista);
        double valorTotal = veiculo.getCategoria().getValorDiaria() * dias;

        Locacao locacao = new Locacao();
        locacao.setVeiculo(veiculo);
        locacao.setCliente(cliente);
        locacao.setDataInicio(req.dataInicio);
        locacao.setDataFimPrevista(req.dataFimPrevista);
        locacao.setStatus("ATIVA");

        if (req.seguroId != null) {
            Seguro seguro = seguroRepository.findById(req.seguroId)
                    .orElseThrow(() -> new RuntimeException("Seguro não encontrado"));
            locacao.setSeguro(seguro);
            valorTotal += seguro.getValorDiaria() * dias;
        }

        locacao.setValorTotal(valorTotal);

        veiculo.setStatus("ALUGADO");
        veiculoRepository.save(veiculo);

        return locacaoRepository.save(locacao);
    }

    // Finaliza a locação e libera o veículo novamente.
    @PatchMapping("/{id}/finalizar")
    public Locacao finalizar(@PathVariable Long id, @RequestBody FinalizarRequest req) {
        Locacao locacao = locacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Locação não encontrada"));

        locacao.setDataFimReal(req.dataFimReal);
        locacao.setStatus("FINALIZADA");

        Veiculo veiculo = locacao.getVeiculo();
        veiculo.setStatus("DISPONIVEL");
        veiculoRepository.save(veiculo);

        return locacaoRepository.save(locacao);
    }

    public static class FinalizarRequest {
        public java.time.LocalDate dataFimReal;
    }
}
