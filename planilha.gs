/*
  Saint Paul Jr · inscritos da calculadora "5 números" (index.html)

  Cada pessoa que coloca o e-mail na calculadora vira uma linha na planilha:
  data, nome, e-mail, link da análise (abre a calculadora com os números dela)
  e os números que ela preencheu. Cada linha nova já entra formatada
  (data, R$, %, números inteiros).

  COMO LIGAR (uma vez só, com a conta dona da planilha):
  1. Abra a planilha:
     https://docs.google.com/spreadsheets/d/1JVRTraqi1MAjUGyXELMW-cSLGBXY34TRmfjrQZSnsL8/edit
  2. Menu Extensões > Apps Script. Apague o que estiver lá e cole este arquivo inteiro. Salve.
  3. Implantar > Nova implantação > tipo "App da Web".
       Executar como: Eu
       Quem pode acessar: Qualquer pessoa
     Clique em Implantar e autorize o acesso à planilha.
  4. Copie a "URL do app da Web" (termina em /exec) e cole em ENDPOINT_URL,
     no começo do <script> de index.html. Publique o site.
  5. Teste: preencha a calculadora no site com um e-mail seu e veja a linha aparecer.

  Se mudar este código depois: Implantar > Gerenciar implantações > editar > Nova versão.
  (A URL continua a mesma.)

  ARRUMAR A FORMATAÇÃO: aqui no editor, escolha formatarPlanilha e clique em Executar.
  Pode rodar quantas vezes quiser.
*/

const PLANILHA_ID = '1JVRTraqi1MAjUGyXELMW-cSLGBXY34TRmfjrQZSnsL8';
const ABA = 'Inscritos 5 números';

// Formatos (o separador de milhar e decimal segue o idioma da planilha: 1.234,56)
const F = {
  data: 'dd/mm/yyyy hh:mm',
  texto: '@',
  moeda: '"R$" #,##0.00;-"R$" #,##0.00',
  inteiro: '#,##0',
  pct: '0%',
};

// chave enviada pela calculadora, título da coluna, formato, largura em px
const COLUNAS = [
  ['data', 'Data', F.data, 130],
  ['nome', 'Nome', F.texto, 170],
  ['email', 'E-mail', F.texto, 230],
  ['link', 'Link da análise', F.texto, 160],
  ['fat', 'Faturamento do mês', F.moeda, 140],
  ['vendas', 'Vendas no mês', F.inteiro, 100],
  ['ticket', 'Ticket médio', F.moeda, 110],
  ['cv', 'Custo variável por venda', F.moeda, 120],
  ['margem', 'Margem de contribuição', F.pct, 115],
  ['cf', 'Custos fixos', F.moeda, 130],
  ['pe', 'Ponto de equilíbrio', F.moeda, 140],
  ['folga', 'Folga do faturamento', F.moeda, 140],
  ['mkt', 'Marketing e vendas', F.moeda, 130],
  ['novos', 'Clientes novos', F.inteiro, 95],
  ['cac', 'CAC', F.moeda, 100],
  ['base', 'Clientes do período', F.inteiro, 100],
  ['volta', 'Voltaram a comprar', F.inteiro, 100],
  ['rec', 'Taxa de recompra', F.pct, 100],
  ['compras', 'Compras para se pagar', F.inteiro, 105],
];

const COR = {
  petroleo: '#184848',
  areia: '#f8f5e6',
  branco: '#ffffff',
  linha: '#e3dfcf',
};

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (!p.email) return resposta('sem e-mail');

  const trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    const aba = pegarAba();
    if (aba.getLastRow() === 0) formatarAba(aba);
    const linha = COLUNAS.map(([chave]) => {
      if (chave === 'data') return new Date();
      const v = p[chave] == null ? '' : String(p[chave]).slice(0, 2000);
      if (v !== '' && !isNaN(Number(v)) && chave !== 'nome' && chave !== 'email') return Number(v);
      return /^[=+\-@]/.test(v) ? "'" + v : v; // evita que texto vire fórmula
    });
    aba.appendRow(linha);
    formatarLinhas(aba, aba.getLastRow(), 1);
  } finally {
    trava.releaseLock();
  }
  return resposta('ok');
}

function resposta(texto) {
  return ContentService.createTextOutput(texto);
}

function pegarAba() {
  const planilha = SpreadsheetApp.openById(PLANILHA_ID);
  return planilha.getSheetByName(ABA) || planilha.insertSheet(ABA);
}

/* Arruma a aba inteira: cabeçalho, larguras, formatos das linhas que já existem e faixas alternadas */
function formatarPlanilha() {
  formatarAba(pegarAba());
}

function formatarAba(aba) {
  const n = COLUNAS.length;

  // Cabeçalho na linha 1 (escreve os títulos se a aba estiver vazia ou desatualizada)
  aba.getRange(1, 1, 1, n).setValues([COLUNAS.map((c) => c[1])]);
  aba.getRange(1, 1, 1, n)
    .setBackground(COR.petroleo)
    .setFontColor(COR.branco)
    .setFontWeight('bold')
    .setFontSize(10)
    .setWrap(true)
    .setVerticalAlignment('middle')
    .setHorizontalAlignment('center');
  aba.setRowHeight(1, 44);
  aba.setFrozenRows(1);
  aba.setFrozenColumns(3); // data, nome e e-mail ficam à vista ao rolar para o lado

  COLUNAS.forEach((c, i) => aba.setColumnWidth(i + 1, c[3]));

  const ultima = aba.getLastRow();
  if (ultima > 1) formatarLinhas(aba, 2, ultima - 1);

  // Faixas alternadas (areia e branco)
  aba.getBandings().forEach((b) => b.remove());
  const linhas = Math.max(aba.getMaxRows(), 2);
  const faixa = aba.getRange(1, 1, linhas, n).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false);
  faixa.setHeaderRowColor(COR.petroleo).setFirstRowColor(COR.branco).setSecondRowColor(COR.areia);

  // Filtro no cabeçalho para ordenar e buscar
  if (!aba.getFilter()) aba.getRange(1, 1, linhas, n).createFilter();
}

/* Formatos de cada coluna nas linhas indicadas */
function formatarLinhas(aba, inicio, quantas) {
  const n = COLUNAS.length;
  const area = aba.getRange(inicio, 1, quantas, n);
  area.setNumberFormats(Array.from({ length: quantas }, () => COLUNAS.map((c) => c[2])));
  area.setVerticalAlignment('middle').setFontSize(10).setFontColor('#191818').setFontWeight('normal');
  aba.getRange(inicio, 1, quantas, 3).setHorizontalAlignment('left');
  aba.getRange(inicio, 4, quantas, 1).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  aba.getRange(inicio, 5, quantas, n - 4).setHorizontalAlignment('right');
}
