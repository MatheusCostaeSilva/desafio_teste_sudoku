# desafio_teste_sudoku

Desafio de testes: casos de teste para testar Sudoku binário de tamanho **6 × 6**, com **casos de teste em JavaScript para testar JavaScript** (Jest + Testing Library).

## Identificação

**Autor:** MatheusCosta

## Como rodar

Requisitos: Node.js 18 ou superior.

```bash
npm install                 # instala as dependências
npm test                    # roda todos os casos de teste
npm run verificar           # confere o motivo de cada falha e o ID de cada teste
npm run verificar:completo  # idem + confere que todo caso do plano tem teste
npx jest tests/<arquivo>.spec.js -t "CT-XX-NN"   # um caso só
```

## Como os testes funcionam

**Situação atual:** esta entrega contém somente os casos de teste. O sudoku binário ainda não está implementado, então **todos os testes falham de propósito**, e pelo motivo certo (o elemento ou valor esperado ainda não existe). O `npm run verificar` confere isso e reprova qualquer teste que passe sem o jogo.

- **Ferramentas:** [Jest](https://jestjs.io) executa; [Testing Library](https://testing-library.com) (`dom`, `user-event`, `jest-dom`) simula o jogador; o [jsdom](https://github.com/jsdom/jsdom) faz o papel do navegador.
- **Testes de interface:** cada teste abre o `index.html` por `abrirJogo(params)` (em `tests/helpers.js`), clica como um jogador e confere o que aparece na tela. Nenhum teste chama função interna do jogo.
- **Elementos da tela:** localizados por `data-testid` (contrato na seção 3 do `PLANEJAMENTO.md`).
- **Sem depender de sorte:** os cenários são montados por parâmetros de URL. O tempo usa relógio falso (`jest.useFakeTimers()`).
- **Rastreabilidade:** o título de cada teste começa com o ID do caso (`CT-XX-NN`), o mesmo da tabela abaixo e do `PLANEJAMENTO.md`.

## Casos de teste (28)

| ID | Cenário | Arquivo | Resultado esperado |
|---|---|---|---|
| CT-SB-01 | Tamanho da grade | `grade.spec.js` | 36 casas; não existem `casa-6-0` nem `casa-0-6` |
| CT-SB-02 | Estado inicial | `grade.spec.js` | Tudo vazio, sem travada/conflito; relógio 0; status vazio; 3 dicas |
| CT-SB-03 | Casas travadas | `grade.spec.js` | A grade é igual ao puzzle e as casas com dígito são `travada` |
| CT-SB-04 | Ciclo do clique | `grade.spec.js` | `0`, depois `1`, depois vazia |
| CT-SB-05 | Travada não muda | `grade.spec.js` | Continuam `1` e `0`; grade igual ao puzzle |
| CT-SB-06 | Relógio | `grade.spec.js` | Antes = 0; depois ≥ 2 e crescendo |
| CT-SB-07 | Trinca horizontal | `regras.spec.js` | Conflito exatamente em 2-1, 2-2, 2-3 |
| CT-SB-08 | Trinca vertical | `regras.spec.js` | Conflito exatamente nessas três |
| CT-SB-09 | Dois iguais seguidos | `regras.spec.js` | Nenhum conflito; status vazio |
| CT-SB-10 | Três iguais separados | `regras.spec.js` | Nenhum conflito |
| CT-SB-11 | Excesso na linha | `regras.spec.js` | Conflito em 0-0, 0-2, 0-4, 0-5 |
| CT-SB-12 | Excesso na coluna | `regras.spec.js` | Conflito em 0-0, 2-0, 4-0, 5-0 |
| CT-SB-13 | Linha equilibrada | `regras.spec.js` | Nenhum conflito; status vazio |
| CT-SB-14 | Linhas completas iguais | `regras.spec.js` | Conflito nas 12 casas das duas linhas |
| CT-SB-15 | Colunas completas iguais | `regras.spec.js` | Conflito nas 12 casas das duas colunas |
| CT-SB-16 | Linhas iguais incompletas | `regras.spec.js` | Nenhum conflito |
| CT-SB-17 | Corrigir tira o conflito | `regras.spec.js` | Antes 3 conflitos; depois nenhum |
| CT-SB-18 | Status de erro | `regras.spec.js` | `Há regras quebradas.` enquanto existir; vazio depois |
| CT-SB-19 | Vitória | `partida.spec.js` | Grade = solução; `Resolvido! Parabéns.`; relógio para; clique não altera |
| CT-SB-20 | 36 preenchidas com erro | `partida.spec.js` | Sem vazias; há conflito; status de erro; sem vitória |
| CT-SB-21 | Apagar | `partida.spec.js` | Grade volta ao puzzle; relógio ≥ 3 (não zerou) |
| CT-SB-22 | Dica | `partida.spec.js` | 0-0 recebe o valor da solução com `data-dica`; 2 dicas restantes |
| CT-SB-23 | Dica pula preenchidas | `partida.spec.js` | 0-1 recebe a dica; 0-0 não é dica |
| CT-SB-24 | Dica travada | `partida.spec.js` | 0-0 não muda e sobrevive ao apagar; 5-5 volta a vazio |
| CT-SB-25 | Limite de dicas | `partida.spec.js` | 0 restantes; botão desabilitado; 0-0, 0-1, 0-2 com a solução |
| CT-SB-26 | Outro puzzle | `partida.spec.js` | Puzzle diferente com 10–14 travadas; nada preenchido; relógio 0; 3 dicas |
| CT-SB-27 | Outro nunca repete | `partida.spec.js` | Cada puzzle é diferente do anterior |
| CT-SB-28 | Puzzle novo é coerente | `partida.spec.js` | 36 casas, nenhum conflito, status vazio |

## Estrutura

```
desafio_teste_sudoku/
├── index.html                    esqueleto da tela (elementos fixos do contrato)
├── js/main.js                    ponto de entrada do jogo (vazio nesta entrega)
├── tests/helpers.js              abrirJogo(), cenários fixos e atalhos
├── tests/*.spec.js               casos de teste
├── scripts/verificar-testes.mjs  verificador (npm run verificar)
├── .github/workflows/testes.yml  integração contínua
└── PLANEJAMENTO.md               regras, contrato e tabela de casos
```
