# Archivos Eliminados Durante Refactor

Estos archivos fueron eliminados/consolidados durante la reorganización modular:

## Archivos Obsoletos
- `js/gameStubs.js` - Código stub innecesario
- `js/gameMenu.js` - Funcionalidad no usada
- `js/gameModes.js` - Funcionalidad no implementada
- `js/uiExtensions.js` - Funcionalidad básica

## Archivos Consolidados
- `js/balance.js` → `src/config/balanceConfig.js`
- `js/enhancedAI.js` → `src/systems/ai.js`
- `js/input.js` → modularizado en `src/input/`

## Archivos Migrados
- `js/*.js` → `src/*/` según funcionalidad
- `*.md` → `docs/` organizados por categoría