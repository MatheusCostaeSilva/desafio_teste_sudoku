// Grade, preenchimento e casas travadas (CT-SB-01 a 06). O jogo não existe: estes testes falham de propósito.
import { abrirJogo, screen, casa, todasAsCasas, valorDe, lerGrade, lerTravadas, relogio, status, definir, GRADE_VAZIA, PUZZLES, N } from './helpers.js';

test('CT-SB-01 a grade tem 6 linhas × 6 colunas (36 casas)', async () => {
  await abrirJogo({ grade: GRADE_VAZIA });
  expect(todasAsCasas()).toHaveLength(36);
  expect(screen.queryByTestId('casa-6-0')).toBeNull();
  expect(screen.queryByTestId('casa-0-6')).toBeNull();
  for (let l = 0; l < N; l++) for (let c = 0; c < N; c++) expect(casa(l, c)).toBeInTheDocument();
});

test('CT-SB-02 estado inicial da grade vazia', async () => {
  await abrirJogo({ grade: GRADE_VAZIA });
  expect(lerGrade()).toBe(GRADE_VAZIA);
  expect(todasAsCasas().filter((e) => e.getAttribute('data-travada') === 'true')).toHaveLength(0);
  expect(todasAsCasas().filter((e) => e.getAttribute('data-conflito') === 'true')).toHaveLength(0);
  expect(relogio()).toHaveTextContent(/^0$/);
  expect(status()).toBeEmptyDOMElement();
  expect(screen.getByTestId('dicas-restantes')).toHaveTextContent(/^3$/);
});

test('CT-SB-03 os dígitos do puzzle viram casas travadas', async () => {
  await abrirJogo({ grade: PUZZLES.P1.grade });
  expect(lerGrade()).toBe(PUZZLES.P1.grade);
  expect(lerTravadas()).toBe(PUZZLES.P1.grade);
});

test('CT-SB-04 o clique alterna vazia → 0 → 1 → vazia', async () => {
  const user = await abrirJogo({ grade: GRADE_VAZIA });
  await user.click(casa(3, 2));
  expect(valorDe(3, 2)).toBe('0');
  await user.click(casa(3, 2));
  expect(valorDe(3, 2)).toBe('1');
  await user.click(casa(3, 2));
  expect(valorDe(3, 2)).toBe('');
});

test('CT-SB-05 casa travada não muda com o clique', async () => {
  const user = await abrirJogo({ grade: PUZZLES.P1.grade });
  // 0-4 é fixa com 1; 1-3 é fixa com 0
  await user.click(casa(0, 4));
  await user.click(casa(1, 3));
  expect(valorDe(0, 4)).toBe('1');
  expect(valorDe(1, 3)).toBe('0');
  expect(lerGrade()).toBe(PUZZLES.P1.grade);
});

test('CT-SB-06 o relógio só começa no primeiro clique em uma casa', async () => {
  jest.useFakeTimers();
  try {
    const user = await abrirJogo({ grade: PUZZLES.P1.grade }, { advanceTimers: jest.advanceTimersByTime });
    jest.advanceTimersByTime(3000);
    expect(relogio()).toHaveTextContent(/^0$/);
    await user.click(casa(0, 0));
    jest.advanceTimersByTime(3000);
    const depois = Number(relogio().textContent);
    expect(depois).toBeGreaterThanOrEqual(2);
    jest.advanceTimersByTime(2000);
    expect(Number(relogio().textContent)).toBeGreaterThan(depois);
  } finally {
    jest.useRealTimers();
  }
});
