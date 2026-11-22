// Utilitários dos testes de interface do Sudoku binário (autor: MatheusCosta).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

/** Abre a página como o jogador abriria. `params` são os parâmetros de URL do contrato. */
export async function abrirJogo(params = {}, opcoesUser = {}) {
  window.history.replaceState({}, '', '/?' + new URLSearchParams(params));
  document.body.innerHTML = corpo;
  jest.resetModules();
  await import('../js/main.js');
  return userEvent.setup(opcoesUser);
}

export { screen };

export const N = 6;
export const STATUS_VITORIA = 'Resolvido! Parabéns.';
export const STATUS_ERRO = 'Há regras quebradas.';

/** Grade vazia: serve para testar as regras casa por casa. */
export const GRADE_VAZIA = '.'.repeat(36);

/** Banco de puzzles (todos com solução única, conferida por um solver). Formato: 36 caracteres, linha por linha. */
export const PUZZLES = {
  P1: { grade: '....1....0...10.1.1......10..0...1..', solucao: '100110011001010011101100110010001101' },
  P2: { grade: '01........0..0........10....00.1.0..', solucao: '010110100101001011110010101100011001' },
  P3: { grade: '.1......1..0....0..01.011........1.1', solucao: '010110101010010101101001110010001101' },
  P4: { grade: '.11...1..1..11.......0........1.0.0.', solucao: '011010100101110010001011001101110100' },
  P5: { grade: '..1...0.1..1....0...0......1..1..11.', solucao: '011010011001100101110010001101100110' },
};

export const casa = (l, c) => screen.getByTestId(`casa-${l}-${c}`);
export const todasAsCasas = () => screen.getAllByTestId(/^casa-\d+-\d+$/);
export const valorDe = (l, c) => casa(l, c).getAttribute('data-valor');
export const emConflito = (l, c) => casa(l, c).getAttribute('data-conflito') === 'true';
export const casasEmConflito = () => todasAsCasas().filter((e) => e.getAttribute('data-conflito') === 'true');
export const relogio = () => screen.getByTestId('relogio');
export const status = () => screen.getByTestId('status');

/** Lê a grade inteira: 36 caracteres com '.' para casa vazia (mesmo formato do parâmetro `grade`). */
export const lerGrade = () => {
  let s = '';
  for (let l = 0; l < N; l++) for (let c = 0; c < N; c++) s += valorDe(l, c) === '' ? '.' : valorDe(l, c);
  return s;
};

/** Mapa das casas travadas (fixas): '.' onde o jogador pode mexer. */
export const lerTravadas = () => {
  let s = '';
  for (let l = 0; l < N; l++) for (let c = 0; c < N; c++) s += casa(l, c).getAttribute('data-travada') === 'true' ? valorDe(l, c) : '.';
  return s;
};

/** O clique alterna vazia → 0 → 1 → vazia. Esta função parte de uma casa vazia. */
export async function definir(user, l, c, valor) {
  await user.click(casa(l, c));
  if (valor === 1) await user.click(casa(l, c));
}

/** Define várias casas de uma vez: `definirLinha(user, 0, '010011')` preenche a linha 0 (use '.' para pular). */
export async function definirLinha(user, l, texto) {
  for (let c = 0; c < texto.length; c++) if (texto[c] !== '.') await definir(user, l, c, Number(texto[c]));
}

/** Define uma coluna de cima para baixo. */
export async function definirColuna(user, c, texto) {
  for (let l = 0; l < texto.length; l++) if (texto[l] !== '.') await definir(user, l, c, Number(texto[l]));
}

/** Preenche com a solução todas as casas vazias do puzzle (menos as listadas em `exceto`, como "l-c"). */
export async function resolverPuzzle(user, nome, exceto = []) {
  const { grade, solucao } = PUZZLES[nome];
  for (let i = 0; i < 36; i++) {
    const l = Math.floor(i / N);
    const c = i % N;
    if (grade[i] !== '.' || exceto.includes(`${l}-${c}`)) continue;
    await definir(user, l, c, Number(solucao[i]));
  }
}
