#!/usr/bin/env node
// Verificador dos casos de teste — autor: MatheusCosta.
//
// Esta entrega contém SOMENTE os casos de teste: o jogo não existe, então todo teste
// precisa FALHAR, e pelo motivo certo (a asserção não bate ou o elemento não foi encontrado).
// Um teste que passa sem o jogo, ou que quebra por erro do próprio teste, é reprovado aqui.
//
// Uso:  node scripts/verificar-testes.mjs [--completo]
//   --completo  também reprova se algum caso da tabela do PLANEJAMENTO.md estiver sem teste.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';
import { tmpdir } from 'node:os';

const MOTIVOS_CERTOS = [/^AssertionError/, /^TestingLibraryElementError/, /^Error: expect\(/, /^JestExtendError/];
const limpar = (s) => String(s ?? '').replace(/\x1b\[[0-9;]*m/g, '').trim();
const resumo = (s) => limpar(s).split('\n')[0].slice(0, 150);

function idsDoPlano(raiz) {
  const arquivo = join(raiz, 'PLANEJAMENTO.md');
  if (!existsSync(arquivo)) return new Set();
  const achados = readFileSync(arquivo, 'utf8').matchAll(/^\| (CT-[A-Z]{2}-\d{2}) \|/gm);
  return new Set([...achados].map((m) => m[1]));
}

function rodarJest(raiz) {
  const bin = join(raiz, 'node_modules', '.bin', process.platform === 'win32' ? 'jest.cmd' : 'jest');
  if (!existsSync(bin)) return { erro: 'Jest não instalado: rode `npm install` antes.' };
  const pasta = mkdtempSync(join(tmpdir(), 'verificar-'));
  const saida = join(pasta, 'resultado.json');
  spawnSync(bin, ['--json', `--outputFile=${saida}`], { cwd: raiz, encoding: 'utf8', timeout: 170_000 });
  const ok = existsSync(saida);
  const json = ok ? JSON.parse(readFileSync(saida, 'utf8')) : null;
  rmSync(pasta, { recursive: true, force: true });
  return ok ? { json } : { erro: 'O Jest não gerou resultado (rode `npm test` para ver o motivo).' };
}

export function verificar(raiz, { completo = false } = {}) {
  const exec = rodarJest(raiz);
  if (exec.erro) return { ok: false, texto: exec.erro };

  const plano = idsDoPlano(raiz);
  const problemas = [];
  const aprovados = [];
  const cobertos = new Set();

  for (const arq of exec.json.testResults ?? []) {
    const nome = relative(raiz, arq.name);
    if (!arq.assertionResults?.length) {
      if (arq.status === 'failed') problemas.push(`${nome}: arquivo não carrega — ${resumo(arq.message)}`);
      continue;
    }
    for (const t of arq.assertionResults) {
      const id = (t.title.match(/^(CT-[A-Z]{2}-\d{2})\b/) ?? [])[1];
      const rotulo = `${nome} › ${t.title}`;
      if (!id) { problemas.push(`${rotulo}: o título precisa começar com um ID CT-XX-NN`); continue; }
      if (plano.size && !plano.has(id)) problemas.push(`${rotulo}: ${id} não está na tabela do PLANEJAMENTO.md`);
      cobertos.add(id);
      if (['skipped', 'pending', 'todo'].includes(t.status)) { problemas.push(`${rotulo}: skip/todo não é permitido`); continue; }
      if (t.status === 'passed') { problemas.push(`${rotulo}: PASSOU sem o jogo existir, então não verifica nada`); continue; }
      const motivo = resumo(t.failureMessages?.[0]);
      if (MOTIVOS_CERTOS.some((re) => re.test(motivo))) aprovados.push(`${id} falha pelo motivo certo`);
      else problemas.push(`${rotulo}: falha pelo motivo ERRADO (bug no teste) — ${motivo}`);
    }
  }

  const semTeste = [...plano].filter((id) => !cobertos.has(id));
  if (completo && semTeste.length) problemas.push(`casos do plano sem teste: ${semTeste.join(', ')}`);

  const linhas = [
    `Casos OK: ${aprovados.length} | Problemas: ${problemas.length} | Casos do plano sem teste: ${semTeste.length}/${plano.size}`,
    ...(problemas.length ? ['', 'PROBLEMAS:', ...problemas.map((p) => `  ✗ ${p}`)] : []),
  ];
  return { ok: problemas.length === 0, texto: linhas.join('\n') };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop())) {
  const res = verificar(process.cwd(), { completo: process.argv.includes('--completo') });
  console.log(res.texto);
  process.exit(res.ok ? 0 : 1);
}
