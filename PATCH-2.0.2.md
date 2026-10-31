# Patch 2.0.2 — estabilização Web e Android

Versão da interface e versionName Android: 2.0.2. versionCode: 3. Mantida a assinatura de desenvolvimento para atualizar a 2.0.1 sem desinstalação.

## Correções

- Avisos mobile passam a ocupar espaço no layout; não cobrem o título, o calendário ou os ajustes. A lista tem limite de altura com rolagem quando há vários avisos.
- Avisos dispensados ficam dispensados nas duas apresentações durante a sessão, inclusive ao trocar idioma; a identificação considera dia, localidade e tipo de aviso.
- Midinváerne pode ocupar duas linhas, sem corte nem compressão horizontal. O nome completo permanece no texto e na descrição acessível.
- Histórico guarda o tipo e os parâmetros do painel. Avançar reconstrói seu conteúdo no idioma e calendário atuais, sem duplicar entradas nem reaproveitar HTML antigo.
- Datas élficas usam dias civis em UTC para a contagem, eliminando diferenças entre meia-noite e meio-dia em fusos com horário de verão.
- O destaque de Lua de Sangue na tela Hoje segue os mesmos critérios de céu e horário dos ícones/alertas.
- Bloqueio do getter localStorage não impede a inicialização. Preferências usam padrões e recordes continuam disponíveis em memória quando não é possível persistir.
- Toques no grid são bloqueados durante a passagem de mês; controladores descartados não podem navegar novamente.
- Fechamento cancela as animações internas e de abertura. O painel fechado fica invisível e seus ícones deixam de animar. Fechamentos interrompidos por navegação não executam um Voltar tardio.
- O botão de fechar responde no início do toque para acompanhar melhor a expansão; chamadas posteriores em painel já fechado são ignoradas.
- A faixa da tela Hoje se chama “Previsão horária de hoje”, indicando corretamente que cobre 00h–23h. Nos detalhes de um dia, “Previsão horária”.
- O controle de calendário élfico mobile recebe nome acessível. A documentação deixa de anunciar uma interface de diário inexistente.
- Cache PWA e indicadores de versão atualizados para 2.0.2. Mantidas as correções já validadas de recordes, chuva no mês atual, modo retrato e botão Voltar.

## Verificação

- Sintaxe e suíte completa, incluindo regressões das versões 2.0.1 e 2.0.2.
- Regressões de storage completamente bloqueado, datas em America/New_York, Europe/Lisbon e America/Sao_Paulo, histórico PT/EN, Lua de Sangue encoberta, cancelamento de fechamento e cliques durante transição.
- Prévia local no navegador com mobile e desktop: aviso fora do conteúdo, PT/EN clicáveis, nome completo em janeiro e card reconstruído em inglês.
- Build Web, sincronização Capacitor e assembleDebug.
- Atualização no Moto G200/Android 12: mesmos máximos e mínimos nas nove localidades após instalar por cima da 2.0.1; versão visível 2.0.2; nome completo em janeiro; nenhum transbordamento vertical nos cards medidos; grade futura sem animações; painel ensolarado com animações quando aberto e zero animações quando fechado.

As evidências do aparelho ficam localmente em qa-patch-2.0.2; não devem ser publicadas indiscriminadamente, pois capturas Android podem conter notificações pessoais. Não foi feita uma medição de FPS/bateria nem um teste de longa duração. A publicação no GitHub e o deploy Netlify são etapas separadas da preparação deste patch.
