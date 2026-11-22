// As três regras do sudoku binário e a marcação de conflitos (CT-SB-07 a 18).
import { abrirJogo, casa, emConflito, casasEmConflito, status, definir, definirLinha, definirColuna, GRADE_VAZIA, STATUS_ERRO } from './helpers.js';

const idsEmConflito = () => casasEmConflito().map((e) => e.getAttribute('data-testid').replace('casa-', '')).sort();

test('CT-SB-07 três zeros seguidos na horizontal ficam em conflito', async () => {
  const user = await abrirJogo({ grade: GRADE_VAZIA });
  await definirLinha(user, 2, '.000..');
  expect(idsEmConflito()).toEqual(['2-1', '2-2', '2-3']);
});

test('CT-SB-08 três uns seguidos na vertical ficam em conflito', async () => {
  const user = await abrirJogo({ grade: GRADE_VAZIA });
  await definirColuna(user, 4, '.111..');
  expect(idsEmConflito()).toEqual(['1-4', '2-4', '3-4']);
});

test('CT-SB-09 dois iguais seguidos ainda são permitidos', async () => {
  const user = await abrirJogo({ grade: GRADE_VAZIA });
  await definirLinha(user, 0, '001...');
  expect(casasEmConflito()).toHaveLength(0);
  expect(status()).toBeEmptyDOMElement();
});

test('CT-SB-10 três zeros não vizinhos na mesma linha são permitidos', async () => {
  const user = await abrirJogo({ grade: GRADE_VAZIA });
  await definirLinha(user, 0, '0.0.0.');
  expect(casasEmConflito()).toHaveLength(0);
});

test('CT-SB-11 quatro zeros na mesma linha (sem trinca) ficam em conflito', async () => {
  const user = await abrirJogo({ grade: GRADE_VAZIA });
  await definirLinha(user, 0, '0.0.00'); // 4 zeros: 0-0, 0-2, 0-4, 0-5
  expect(idsEmConflito()).toEqual(['0-0', '0-2', '0-4', '0-5']);
});

test('CT-SB-12 quatro uns na mesma coluna (sem trinca) ficam em conflito', async () => {
  const user = await abrirJogo({ grade: GRADE_VAZIA });
  await definirColuna(user, 0, '1.1.11'); // 4 uns: 0-0, 2-0, 4-0, 5-0
  expect(idsEmConflito()).toEqual(['0-0', '2-0', '4-0', '5-0']);
});

test('CT-SB-13 uma linha completa e equilibrada não gera conflito', async () => {
  const user = await abrirJogo({ grade: GRADE_VAZIA });
  await definirLinha(user, 0, '010011'); // 3 zeros, 3 uns, sem trinca
  expect(casasEmConflito()).toHaveLength(0);
  expect(status()).toBeEmptyDOMElement();
});

test('CT-SB-14 duas linhas completas iguais ficam em conflito (12 casas)', async () => {
  const user = await abrirJogo({ grade: GRADE_VAZIA });
  await definirLinha(user, 0, '010011');
  await definirLinha(user, 1, '010011');
  const esperado = [];
  for (const l of [0, 1]) for (let c = 0; c < 6; c++) esperado.push(`${l}-${c}`);
  expect(idsEmConflito()).toEqual(esperado.sort());
});

test('CT-SB-15 duas colunas completas iguais ficam em conflito (12 casas)', async () => {
  const user = await abrirJogo({ grade: GRADE_VAZIA });
  await definirColuna(user, 0, '010011');
  await definirColuna(user, 1, '010011');
  const esperado = [];
  for (const c of [0, 1]) for (let l = 0; l < 6; l++) esperado.push(`${l}-${c}`);
  expect(idsEmConflito()).toEqual(esperado.sort());
});

test('CT-SB-16 linhas iguais mas incompletas não são conflito', async () => {
  const user = await abrirJogo({ grade: GRADE_VAZIA });
  await definirLinha(user, 0, '01001.');
  await definirLinha(user, 1, '01001.');
  expect(casasEmConflito()).toHaveLength(0);
});

test('CT-SB-17 corrigir a casa faz o conflito sumir', async () => {
  const user = await abrirJogo({ grade: GRADE_VAZIA });
  await definirLinha(user, 2, '.000..');
  expect(casasEmConflito()).toHaveLength(3);
  await user.click(casa(2, 3)); // 0 → 1: a trinca some
  expect(casasEmConflito()).toHaveLength(0);
  expect(emConflito(2, 1)).toBe(false);
});

test('CT-SB-18 o status avisa enquanto houver regra quebrada', async () => {
  const user = await abrirJogo({ grade: GRADE_VAZIA });
  expect(status()).toBeEmptyDOMElement();
  await definirLinha(user, 2, '.000..');
  expect(status()).toHaveTextContent(STATUS_ERRO);
  await user.click(casa(2, 3));
  expect(status()).toBeEmptyDOMElement();
});
