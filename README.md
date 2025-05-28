# Space Game - Galcon Inspired RTS

🚀 Un juego de estrategia en tiempo real inspirado en Galcon, desarrollado con HTML5, CSS3 y JavaScript vanilla.

## 🎮 Características

### ✅ **Versión 1.0 - Base Completa**

**Core Gameplay:**
- ✅ Sistema de planetas con capacidades variables (6-8 planetas)
- ✅ Generación automática de naves basada en tamaño del planeta
- ✅ Mecánica de conquista y combate
- ✅ Condiciones de victoria (controlar todos los planetas)

**Controles:**
- ✅ **Drag & Drop**: Arrastra desde tu planeta a otro para enviar naves
- ✅ **Teclado**: Selecciona planeta origen (tecla) → planeta destino (tecla)
- ✅ Asignación aleatoria de teclas a planetas (sin repetición)
- ✅ Indicadores visuales de teclas asignadas

**IA:**
- ✅ IA estratégica con múltiples comportamientos (expandir, atacar, reforzar)
- ✅ Toma de decisiones cada 3 segundos
- ✅ Evaluación táctica de objetivos

**Visual & UI:**
- ✅ Gráficos vectoriales SVG
- ✅ Interfaz limpia con estadísticas en tiempo real
- ✅ Efectos visuales para conquista y combate
- ✅ Responsive design

**Arquitectura:**
- ✅ Código modular y mantenible
- ✅ Sistema de configuración centralizado
- ✅ Motor de juego optimizado
- ✅ Herramientas de debug integradas

## 🕹️ Cómo Jugar

### Objetivo
Conquista todos los planetas del mapa para ganar la partida.

### Controles

**Ratón (Drag & Drop):**
1. Haz clic y arrastra desde uno de tus planetas (verdes)
2. Suelta sobre el planeta destino
3. Se enviarán naves automáticamente

**Teclado:**
1. Presiona la tecla de tu planeta origen (mostrada sobre cada planeta)
2. Presiona la tecla del planeta destino
3. Las naves se envían automáticamente

### Mecánicas

**Planetas:**
- Cada planeta tiene una capacidad máxima de naves
- Los planetas más grandes generan naves más rápido
- Planetas verdes = tuyos, rojos = IA, grises = neutrales

**Combate:**
- Si atacas un planeta neutral, inicias su conquista (tarda 2 segundos)
- Si atacas un planeta enemigo, combates: más naves gana
- Si refuerzas tu planeta, simplemente añades naves

**Estrategia:**
- Planetas grandes son más valiosos (producen más naves)
- Expándete rápido para ganar ventaja económica
- Defiende tus planetas clave
- Observa los movimientos de la IA

## 🏗️ Arquitectura del Código

```
spaceGame/
├── index.html              # Punto de entrada
├── css/
│   └── styles.css          # Estilos responsivos
├── js/
│   ├── config.js           # Configuración centralizada
│   ├── utils.js            # Funciones utilitarias
│   ├── planet.js           # Clase Planet y lógica
│   ├── fleet.js            # Sistema de flotas
│   ├── gameEngine.js       # Motor principal del juego
│   ├── input.js            # Gestión de input (mouse/teclado)
│   ├── ai.js               # Inteligencia artificial
│   ├── ui.js               # Gestión de interfaz
│   └── game.js             # Controlador principal
```

### Principios de Diseño

1. **Modularidad**: Cada archivo tiene una responsabilidad específica
2. **Configurabilidad**: Parámetros centralizados en `config.js`
3. **Reutilización**: Funciones utilitarias compartidas
4. **Performance**: Optimizado para 60fps
5. **Mantenibilidad**: Código limpio y bien comentado

## 🛠️ Configuración

El juego es altamente configurable editando `js/config.js`:

```javascript
// Ejemplo: Cambiar dificultad de la IA
CONFIG.AI.DECISION_INTERVAL = 2000; // IA más rápida
CONFIG.AI.AGGRESSION = 0.9;         // IA más agresiva

// Ejemplo: Cambiar balance del juego
CONFIG.PLANETS.PRODUCTION_BASE = 1.0;     // Producción más rápida
CONFIG.FLEET.SPEED = 120;                 // Naves más rápidas
```

## 🐛 Debug Tools

Abre la consola del navegador (F12) y usa:

```javascript
// Ver estadísticas de planetas
GameDebug.logPlanetStats();

// Ver flotas en movimiento
GameDebug.logFleetStats();

// Cambiar velocidad de IA
GameDebug.setAISpeed(1000); // 1 segundo

// Dar naves al jugador
GameDebug.givePlayerShips(0, 10); // 10 naves al planeta 0

// Ganar inmediatamente
GameDebug.winGame();
```

## 🚀 Próximas Características

### Versión 1.1 - Polish & Balance
- [ ] Animaciones mejoradas
- [ ] Efectos de partículas
- [ ] Sonidos básicos
- [ ] Balance de gameplay
- [ ] Más opciones de configuración

### Versión 1.2 - Features Avanzadas
- [ ] Diferentes tipos de naves
- [ ] Planetas especiales
- [ ] Modo multijugador local
- [ ] Sistema de puntuación
- [ ] Diferentes mapas

### Versión 2.0 - Expansión
- [ ] Modo "Rey de la Colina"
- [ ] Equipos
- [ ] Torneos
- [ ] Editor de mapas
- [ ] Multijugador online

## 📋 Registro de Cambios

### Versión 1.0.0 (28/05/2025)
- ✅ Implementación base completa
- ✅ Sistema de drag & drop funcional
- ✅ Control por teclado implementado
- ✅ IA estratégica básica
- ✅ Sistema de conquista y combate
- ✅ UI responsive y funcional
- ✅ Arquitectura modular establecida

## 🤝 Contribuir

El proyecto sigue estos principios:
1. **Archivos pequeños**: Máximo 200 líneas por archivo
2. **Funciones focalizadas**: Una responsabilidad por función
3. **Configuración externa**: Sin números mágicos en el código
4. **Performance first**: Optimizado para ser fluido
5. **Código limpio**: Comentarios y nombres descriptivos

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo licencia MIT.

---

**¡Que disfrutes conquistando el espacio!** 🌌
