/*
  Saint Paul Jr · inscritos da calculadora "5 números" (index.html)

  Cada pessoa que coloca o e-mail na calculadora vira uma linha na planilha:
  data, nome, e-mail, link da análise (abre a calculadora com os números dela)
  e os números que ela preencheu.

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
*/

const PLANILHA_ID = '1JVRTraqi1MAjUGyXELMW-cSLGBXY34TRmfjrQZSnsL8';
const ABA = 'Inscritos 5 números';

const COLUNAS = [
  ['data', 'Data'],
  ['nome', 'Nome'],
  ['email', 'E-mail'],
  ['link', 'Link da análise'],
  ['fat', 'Faturamento do mês'],
  ['vendas', 'Vendas no mês'],
  ['ticket', 'Ticket médio'],
  ['cv', 'Custo variável por venda'],
  ['margem', 'Margem de contribuição'],
  ['cf', 'Custos fixos'],
  ['pe', 'Ponto de equilíbrio'],
  ['folga', 'Folga do faturamento'],
  ['mkt', 'Marketing e vendas'],
  ['novos', 'Clientes novos'],
  ['cac', 'CAC'],
  ['base', 'Clientes do período'],
  ['volta', 'Voltaram a comprar'],
  ['rec', 'Taxa de recompra'],
  ['compras', 'Compras para se pagar'],
];

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (!p.email) return resposta('sem e-mail');

  const trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    const planilha = SpreadsheetApp.openById(PLANILHA_ID);
    const aba = planilha.getSheetByName(ABA) || planilha.insertSheet(ABA);
    if (aba.getLastRow() === 0) {
      aba.appendRow(COLUNAS.map(c => c[1]));
      aba.setFrozenRows(1);
      aba.getRange(1, 1, 1, COLUNAS.length).setFontWeight('bold');
    }
    const linha = COLUNAS.map(([chave]) => {
      if (chave === 'data') return new Date();
      const v = p[chave] == null ? '' : String(p[chave]).slice(0, 2000);
      if (v !== '' && !isNaN(Number(v)) && chave !== 'nome' && chave !== 'email') return Number(v);
      return /^[=+\-@]/.test(v) ? "'" + v : v; // evita que texto vire fórmula
    });
    aba.appendRow(linha);
  } finally {
    trava.releaseLock();
  }
  return resposta('ok');
}

function resposta(texto) {
  return ContentService.createTextOutput(texto);
}
