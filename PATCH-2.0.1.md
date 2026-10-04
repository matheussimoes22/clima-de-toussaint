# Patch 2.0.1 — 04/10/2026

- Indicador Web/Android e versão nos ajustes mobile e no painel desktop.
- Android configurado em retrato; versionCode 2, assinatura de desenvolvimento preservada.
- Referências fixas sem data (37 °C/-1 °C com deslocamento regional) separadas dos recordes reais. Referências preservadas em initialReferences; recordes com data ou importados permanecem intactos. A coleta inicial considera ontem e as horas transcorridas de hoje, sem reconstruir um histórico anterior à instalação.
- Coleta das horas já ocorridas ao reabrir e atualização dos recordes na previsão e na virada da hora.
- Chuva e tempestade animadas para datas do mês atual real na página visível; demais datas estáticas. Movimento reduzido respeitado.
- Remoção do fundo retangular do ornamento do cabeçalho.
- Cancelamento de transições do calendário ao sair da tela e reposicionamento ao redimensionar.
- Calendário e Lua atualizados na virada do dia; próxima fase lunar atravessa o fim da fase atual.
- Fechamento captura a transformação visível quando interrompe uma expansão; reabertura limpa a animação de fechamento.
- Cache web atualizado e inclusão de favicon, splash e módulo de versão no precache.

Validação: suíte existente e regressões do patch passaram; build Android concluído; atualização instalada no Moto G200 sem desinstalação. Versão instalada confirmada por dumpsys e registro migrado confirmado no armazenamento. Avaliação visual final das animações no aparelho ainda depende do teste de uso.

Distribuição: fontes e APK pela Release v2.0.1 do GitHub. O ZIP web deve ser enviado ao projeto existente no Netlify; publicar o código no GitHub não confirma esse deploy manual.
