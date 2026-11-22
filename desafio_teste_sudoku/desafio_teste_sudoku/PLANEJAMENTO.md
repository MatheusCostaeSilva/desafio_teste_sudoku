# Planejamento — desafio_teste_sudoku

Sudoku binário (Takuzu / Binairo) de **6 × 6**. A entrega são **casos de teste de interface escritos em JavaScript, para testar JavaScript** (Jest + Testing Library). O jogo em si não faz parte desta entrega, por isso todos os testes falham de propósito, e pelo motivo certo.

**Autor:** MatheusCosta

---

## 1. Regras do jogo (o que os testes verificam)

- **Grade 6 × 6** (linhas e colunas `0..5`). Cada casa fica vazia, `0` ou `1`.
- Algumas casas já vêm preenchidas (**travadas**) e não mudam.
- **Regra 1 — equilíbrio:** cada linha e cada coluna completa tem **três 0 e três 1**. Mais de três iguais na mesma linha/coluna já é erro, mesmo incompleta.
- **Regra 2 — sem trinca:** não pode haver **três iguais seguidos**, na horizontal ou na vertical.
- **Regra 3 — sem repetição:** duas linhas **completas** não podem ser iguais; duas colunas **completas** também não.
- **Preencher:** o clique numa casa alterna **vazia → 0 → 1 → vazia**.
- **Conflitos aparecem na hora** (`data-conflito="true"`):
  - trinca → as casas da sequência de 3 ou mais iguais;
  - excesso (mais de três 0 ou mais de três 1 na linha/coluna) → todas as casas daquele dígito na linha/coluna;
  - linhas (ou colunas) completas iguais → todas as casas das duas linhas (ou colunas).
- **Status:** vazio quando tudo certo; `Há regras quebradas.` enquanto existir conflito; `Resolvido! Parabéns.` ao vencer.
- **Relógio:** conta segundos a partir do primeiro clique em uma casa; para na vitória.
- **Vitória:** 36 casas preenchidas e nenhuma regra quebrada. A grade trava e o relógio para.
- **Apagar:** remove só o que o jogador preencheu (travadas e dicas ficam). **Não** zera o relógio.
- **Dica (3 por puzzle):** preenche a **primeira casa vazia** (leitura linha a linha) com o valor da solução, marca `data-dica="true"` e trava a casa. Ao chegar a 0 dicas o botão desabilita. Apagar mantém as dicas.
- **Outro puzzle:** troca por outro do banco (**sempre diferente do atual**), zera o preenchimento, o relógio e as dicas.
- Todo puzzle do banco tem **solução única** e entre 10 e 14 casas travadas.

## 2. Stack e comandos

| Item | Escolha |
|---|---|
| Entrega | Somente casos de teste (`tests/`). `js/main.js` fica vazio |
| Executor | Jest 29 com `babel-jest` |
| Testes de interface | Testing Library (`dom`, `user-event`, `jest-dom`) |
| "Navegador" | jsdom |
| Node | 18 ou superior |
| CI | GitHub Actions: `npm ci` + `npm run verificar:completo` |

```bash
npm install
npm test                     # todos falham, de propósito
npm run verificar            # confere o motivo de cada falha e o ID do plano
npm run verificar:completo   # idem + acusa caso do plano sem teste
```

Os testes só enxergam o jogo pela tela (`getByTestId`, cliques, atributos). O tempo usa relógio falso (`jest.useFakeTimers()`). Nada depende de sorte: o puzzle vem por parâmetro de URL.

## 3. Contrato de interface

| data-testid | O que é |
|---|---|
| `grade` | A grade |
| `casa-L-C` | Cada casa (ex.: `casa-2-5`). `data-valor` = `""` \| `0` \| `1`; `data-travada="true"` nas fixas; `data-conflito="true"` quando quebra regra; `data-dica="true"` nas casas de dica |
| `relogio` | Segundos de jogo (só o número) |
| `dicas-restantes` | Dicas que ainda podem ser usadas (3, 2, 1, 0) |
| `btn-apagar` | Apaga o que o jogador preencheu |
| `btn-dica` | Pede uma dica (`disabled` quando acabam) |
| `btn-outro` | Troca por outro puzzle do banco |
| `status` | Vazio, `Há regras quebradas.` ou `Resolvido! Parabéns.` |

| Parâmetro de URL | Exemplo | Efeito |
|---|---|---|
| `grade` | `?grade=....1....0...10.1.1......10..0...1..` | 36 caracteres, linha por linha: `0`, `1` ou `.` (vazia). Dígitos viram casas travadas |

Para testar as regras casa por casa usa-se a grade vazia: `?grade=` + 36 pontos.

### Banco de puzzles (todos conferidos por um solver: solução única)

| Nome | Puzzle | Solução |
|---|---|---|
| P1 | `....1....0...10.1.1......10..0...1..` | `100110011001010011101100110010001101` |
| P2 | `01........0..0........10....00.1.0..` | `010110100101001011110010101100011001` |
| P3 | `.1......1..0....0..01.011........1.1` | `010110101010010101101001110010001101` |
| P4 | `.11...1..1..11.......0........1.0.0.` | `011010100101110010001011001101110100` |
| P5 | `..1...0.1..1....0...0......1..1..11.` | `011010011001100101110010001101100110` |

Solução de P1 em grade:

```
1 0 0 1 1 0
0 1 1 0 0 1
0 1 0 0 1 1
1 0 1 1 0 0
1 1 0 0 1 0
0 0 1 1 0 1
```

## 4. Casos de teste

| ID | Cenário | Passos | Resultado esperado | Arquivo |
|---|---|---|---|---|
| CT-SB-01 | Tamanho da grade | Abrir com grade vazia | 36 casas; não existem `casa-6-0` nem `casa-0-6` | `grade.spec.js` |
| CT-SB-02 | Estado inicial | Abrir com grade vazia | Tudo vazio, sem travada/conflito; relógio 0; status vazio; 3 dicas | `grade.spec.js` |
| CT-SB-03 | Casas travadas | Abrir o P1 | A grade é igual ao puzzle e as casas com dígito são `travada` | `grade.spec.js` |
| CT-SB-04 | Ciclo do clique | Clicar 3 vezes em 3-2 | `0`, depois `1`, depois vazia | `grade.spec.js` |
| CT-SB-05 | Travada não muda | P1; clicar em 0-4 e 1-3 | Continuam `1` e `0`; grade igual ao puzzle | `grade.spec.js` |
| CT-SB-06 | Relógio | Relógio falso: +3 s sem clicar; clicar 0-0; +3 s; +2 s | Antes = 0; depois ≥ 2 e crescendo | `grade.spec.js` |
| CT-SB-07 | Trinca horizontal | Grade vazia; 0 em 2-1, 2-2 e 2-3 | Conflito exatamente em 2-1, 2-2, 2-3 | `regras.spec.js` |
| CT-SB-08 | Trinca vertical | 1 em 1-4, 2-4 e 3-4 | Conflito exatamente nessas três | `regras.spec.js` |
| CT-SB-09 | Dois iguais seguidos | Linha 0: `001...` | Nenhum conflito; status vazio | `regras.spec.js` |
| CT-SB-10 | Três iguais separados | Linha 0: `0.0.0.` | Nenhum conflito | `regras.spec.js` |
| CT-SB-11 | Excesso na linha | Linha 0: `0.0.00` (4 zeros) | Conflito em 0-0, 0-2, 0-4, 0-5 | `regras.spec.js` |
| CT-SB-12 | Excesso na coluna | Coluna 0: `1.1.11` (4 uns) | Conflito em 0-0, 2-0, 4-0, 5-0 | `regras.spec.js` |
| CT-SB-13 | Linha equilibrada | Linha 0: `010011` | Nenhum conflito; status vazio | `regras.spec.js` |
| CT-SB-14 | Linhas completas iguais | Linhas 0 e 1: `010011` | Conflito nas 12 casas das duas linhas | `regras.spec.js` |
| CT-SB-15 | Colunas completas iguais | Colunas 0 e 1: `010011` (de cima para baixo) | Conflito nas 12 casas das duas colunas | `regras.spec.js` |
| CT-SB-16 | Linhas iguais incompletas | Linhas 0 e 1: `01001.` | Nenhum conflito | `regras.spec.js` |
| CT-SB-17 | Corrigir tira o conflito | Trinca em 2-1..2-3; clicar 2-3 | Antes 3 conflitos; depois nenhum | `regras.spec.js` |
| CT-SB-18 | Status de erro | Criar e desfazer uma trinca | `Há regras quebradas.` enquanto existir; vazio depois | `regras.spec.js` |
| CT-SB-19 | Vitória | P1; preencher todas as vazias com a solução | Grade = solução; `Resolvido! Parabéns.`; relógio para; clique não altera | `partida.spec.js` |
| CT-SB-20 | 36 preenchidas com erro | P1 resolvido, mas 5-5 com o valor trocado | Sem vazias; há conflito; status de erro; sem vitória | `partida.spec.js` |
| CT-SB-21 | Apagar | P1; preencher 0-0 e 5-5; +4 s; apagar | Grade volta ao puzzle; relógio ≥ 3 (não zerou) | `partida.spec.js` |
| CT-SB-22 | Dica | P1; pedir dica | 0-0 recebe o valor da solução com `data-dica`; 2 dicas restantes | `partida.spec.js` |
| CT-SB-23 | Dica pula preenchidas | P1; jogador preenche 0-0 (certo); pedir dica | 0-1 recebe a dica; 0-0 não é dica | `partida.spec.js` |
| CT-SB-24 | Dica travada | P1; dica; clicar 0-0; preencher 5-5; apagar | 0-0 não muda e sobrevive ao apagar; 5-5 volta a vazio | `partida.spec.js` |
| CT-SB-25 | Limite de dicas | P1; pedir 3 dicas | 0 restantes; botão desabilitado; 0-0, 0-1, 0-2 com a solução | `partida.spec.js` |
| CT-SB-26 | Outro puzzle | P1; preencher, dica, +3 s; `btn-outro` | Puzzle diferente com 10–14 travadas; nada preenchido; relógio 0; 3 dicas | `partida.spec.js` |
| CT-SB-27 | Outro nunca repete | Clicar `btn-outro` 12 vezes | Cada puzzle é diferente do anterior | `partida.spec.js` |
| CT-SB-28 | Puzzle novo é coerente | `btn-outro` | 36 casas, nenhum conflito, status vazio | `partida.spec.js` |

## 5. Definição de pronto

- [x] Todos os casos da seção 4 têm teste em `tests/`, com o ID no título
- [x] Nenhum código do jogo em `js/` (só o `main.js` vazio)
- [x] `npm run verificar:completo` sem problemas
- [x] README com autor, como rodar e a tabela de casos
- [x] Repositório com o nome exato `desafio_teste_sudoku`
