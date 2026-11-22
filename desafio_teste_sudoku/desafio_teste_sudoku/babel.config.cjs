// Usado só pelo Jest: transforma ES Modules em CommonJS, assim jest.resetModules()
// recarrega js/main.js a cada abrirJogo() e cada teste começa com um jogo novo.
module.exports = { presets: [['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }]] };
