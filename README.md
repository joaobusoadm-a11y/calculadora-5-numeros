# Calculadora "5 números" · Saint Paul Jr

Calculadora gratuita: ticket médio, margem de contribuição, ponto de equilíbrio, CAC e taxa de recompra.
Publicada pelo GitHub Pages a partir da branch `main`.

- `index.html`: a página inteira, no mesmo desenho do site da Saint Paul Jr (cabeçalho, capa em grade com a rede, seções areia, chamada escura, rodapé e botão de WhatsApp), sem depender de outros arquivos.
- `planilha.gs`: código do Apps Script que grava os inscritos na planilha. A URL dele fica em `ENDPOINT_URL`, no `index.html`.
  Cada linha nova entra formatada (data, R$, %, inteiros). Para arrumar a aba inteira, rode `formatarPlanilha` no editor do Apps Script.
  Se mudar o script: Implantar > Gerenciar implantações > editar > Nova versão (a URL continua a mesma).
