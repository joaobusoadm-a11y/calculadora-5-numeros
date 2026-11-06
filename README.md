# Calculadora "5 números" · Saint Paul Jr

Calculadora gratuita: ticket médio, margem de contribuição, ponto de equilíbrio, CAC e taxa de recompra.
Publicada pelo GitHub Pages a partir da branch `main`.

- `index.html`: a página inteira, no desenho do site da Saint Paul Jr, sem depender de outros arquivos e sem links para o site. A calculadora é um cartão na capa, com uma pergunta por etapa. As etapas são independentes (qualquer ordem, sem precisar preencher para avançar); quando as 5 estão respondidas, o pedido de e-mail aparece no próprio cartão.
- `planilha.gs`: código do Apps Script que grava os inscritos na planilha. A URL dele fica em `ENDPOINT_URL`, no `index.html`.
  Cada linha nova entra formatada (data, R$, %, inteiros). Para arrumar a aba inteira, rode `formatarPlanilha` no editor do Apps Script.
  Se mudar o script: Implantar > Gerenciar implantações > editar > Nova versão (a URL continua a mesma).
