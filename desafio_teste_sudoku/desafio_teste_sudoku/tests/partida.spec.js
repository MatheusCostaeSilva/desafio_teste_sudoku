// Vitória, apagar, dicas e outro puzzle (CT-SB-19 a 28).
import { abrirJogo, screen, casa, valorDe, lerGrade, lerTravadas, casasEmConflito, todasAsCasas, relogio, status, definir, resolverPuzzle, PUZZLES, STATUS_VITORIA, STATUS_ERRO } from './helpers.js';

afterEach(() => {
  jest.useRealTimers();
});

test('CT-SB-19 resolver o puzzle mostra a vitória, trava a grade e para o relógio', async () => {
  jest.useFakeTimers();
  const user = await abrirJogo({ grade: PUZZLES.P1.grade }, { advanceTimers: jest.advanceTimersByTime });
  await resolverPuzzle(user, 'P1');
  expect(lerGrade()).toBe(PUZZLES.P1.solucao);
  expect(status()).toHaveTextContent(STATUS_VITORIA);
  const parado = relogio().textContent;
  jest.advanceTimersByTime(5000);
  expect(relogio()).toHaveTextContent(new RegExp(`^${parado}$`));
  await user.click(casa(0, 0)); // depois de vencer, nada muda
  expect(lerGrade()).toBe(PUZZLES.P1.solucao);
});

test('CT-SB-20 36 casas preenchidas com regra quebrada não é vitória', async () => {
  const user = await abrirJogo({ grade: PUZZLES.P1.grade });
  await resolverPuzzle(user, 'P1', ['5-5']); // deixa 5-5 de fora
  const errado = PUZZLES.P1.solucao[35] === '0' ? 1 : 0;
  await definir(user, 5, 5, errado);
  expect(lerGrade()).not.toContain('.');
  expect(casasEmConflito().length).toBeGreaterThan(0);
  expect(status()).toHaveTextContent(STATUS_ERRO);
  expect(status()).not.toHaveTextContent(STATUS_VITORIA);
});

test('CT-SB-21 apagar remove só o que o jogador preencheu e não zera o relógio', async () => {
  jest.useFakeTimers();
  const user = await abrirJogo({ grade: PUZZLES.P1.grade }, { advanceTimers: jest.advanceTimersByTime });
  await definir(user, 0, 0, 1);
  await definir(user, 5, 5, 0);
  jest.advanceTimersByTime(4000);
  await user.click(screen.getByTestId('btn-apagar'));
  expect(lerGrade()).toBe(PUZZLES.P1.grade);
  expect(Number(relogio().textContent)).toBeGreaterThanOrEqual(3);
});

test('CT-SB-22 a dica preenche a primeira casa vazia com o valor da solução', async () => {
  const user = await abrirJogo({ grade: PUZZLES.P1.grade });
  await user.click(screen.getByTestId('btn-dica'));
  // primeira casa vazia do P1 é 0-0, e a solução tem 1 ali
  expect(valorDe(0, 0)).toBe(PUZZLES.P1.solucao[0]);
  expect(casa(0, 0)).toHaveAttribute('data-dica', 'true');
  expect(screen.getByTestId('dicas-restantes')).toHaveTextContent(/^2$/);
});

test('CT-SB-23 a dica pula casas que o jogador já preencheu', async () => {
  const user = await abrirJogo({ grade: PUZZLES.P1.grade });
  await definir(user, 0, 0, Number(PUZZLES.P1.solucao[0])); // jogador preenche 0-0
  await user.click(screen.getByTestId('btn-dica'));
  expect(valorDe(0, 1)).toBe(PUZZLES.P1.solucao[1]);
  expect(casa(0, 1)).toHaveAttribute('data-dica', 'true');
  expect(casa(0, 0)).not.toHaveAttribute('data-dica', 'true');
});

test('CT-SB-24 casa de dica não muda no clique e sobrevive ao apagar', async () => {
  const user = await abrirJogo({ grade: PUZZLES.P1.grade });
  await user.click(screen.getByTestId('btn-dica'));
  await user.click(casa(0, 0));
  expect(valorDe(0, 0)).toBe(PUZZLES.P1.solucao[0]);
  await definir(user, 5, 5, 1);
  await user.click(screen.getByTestId('btn-apagar'));
  expect(valorDe(0, 0)).toBe(PUZZLES.P1.solucao[0]);
  expect(valorDe(5, 5)).toBe('');
});

test('CT-SB-25 só existem 3 dicas por puzzle', async () => {
  const user = await abrirJogo({ grade: PUZZLES.P1.grade });
  const botao = screen.getByTestId('btn-dica');
  for (let i = 0; i < 3; i++) await user.click(botao);
  expect(screen.getByTestId('dicas-restantes')).toHaveTextContent(/^0$/);
  expect(botao).toBeDisabled();
  expect(valorDe(0, 0)).toBe(PUZZLES.P1.solucao[0]);
  expect(valorDe(0, 1)).toBe(PUZZLES.P1.solucao[1]);
  expect(valorDe(0, 2)).toBe(PUZZLES.P1.solucao[2]);
});

test('CT-SB-26 outro puzzle troca a grade, zera o que foi feito, o relógio e as dicas', async () => {
  jest.useFakeTimers();
  const user = await abrirJogo({ grade: PUZZLES.P1.grade }, { advanceTimers: jest.advanceTimersByTime });
  await definir(user, 0, 0, 1);
  await user.click(screen.getByTestId('btn-dica'));
  jest.advanceTimersByTime(3000);
  await user.click(screen.getByTestId('btn-outro'));
  expect(lerTravadas()).not.toBe(PUZZLES.P1.grade);
  const fixas = lerTravadas().replace(/\./g, '').length;
  expect(fixas).toBeGreaterThanOrEqual(10);
  expect(fixas).toBeLessThanOrEqual(14);
  expect(lerGrade()).toBe(lerTravadas()); // nada preenchido pelo jogador
  expect(relogio()).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('dicas-restantes')).toHaveTextContent(/^3$/);
});

test('CT-SB-27 outro puzzle nunca repete o puzzle atual', async () => {
  const user = await abrirJogo({ grade: PUZZLES.P1.grade });
  let anterior = lerTravadas();
  for (let i = 0; i < 12; i++) {
    await user.click(screen.getByTestId('btn-outro'));
    const atual = lerTravadas();
    expect(atual).not.toBe(anterior);
    anterior = atual;
  }
});

test('CT-SB-28 o puzzle novo traz casas travadas coerentes (nenhuma já em conflito)', async () => {
  const user = await abrirJogo({ grade: PUZZLES.P1.grade });
  await user.click(screen.getByTestId('btn-outro'));
  expect(todasAsCasas()).toHaveLength(36);
  expect(casasEmConflito()).toHaveLength(0);
  expect(status()).toBeEmptyDOMElement();
});
