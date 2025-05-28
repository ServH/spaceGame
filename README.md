# Space Game - Galcon Inspired RTS

🚀 **Versión 1.3** - Un juego de estrategia en tiempo real inspirado en Galcon, desarrollado con HTML5, CSS3 y JavaScript vanilla.

## 🆕 **NUEVAS CARACTERÍSTICAS V1.3**

### 🎯 **Sistema de Modos de Juego**
- **Selector de Modo**: Interfaz elegante para elegir entre diferentes modos
- **Arquitectura Modular**: Sistema extensible para agregar nuevos modos fácilmente
- **Configuraciones Dinámicas**: Cada modo ajusta velocidades y reglas automáticamente

### 🎮 **Tres Modos de Juego Disponibles**

#### 🟢 **Modo Clásico**
- Gameplay original y equilibrado
- Sin límite de tiempo
- Victoria por conquista total

#### ⚡ **Modo Blitz (90 segundos)**
- **Producción 3x más rápida** - Acción constante
- **Flotas 2.5x más rápidas** - Ataques dinámicos  
- **Conquista 2x más rápida** - Sin esperas largas
- **15 naves iniciales** - Partida agresiva desde el inicio
- **Múltiples condiciones de victoria**:
  - 🏆 **Victoria económica** - Ratio 3:1 de naves + mayoría de planetas
  - 👑 **Dominación** - Control del 75% de planetas
  - ⏰ **Victoria por tiempo** - Mayoría al final del tiempo
  - 🎯 **Conquista total** - Eliminar completamente al enemigo

#### 👑 **Modo Rey de la Colina**
- **Planeta central** marcado con corona dorada
- **Control por 30 segundos** para ganar
- **Barra de progreso visual** alrededor del planeta
- **Ritmo acelerado** (producción 2x, velocidad 2x)
- **IA especializada** que ataca/defiende la colina

### 🤖 **IA Adaptativa Mejorada**
- **3 estrategias dinámicas** que cambian según la situación:
  - **Blitz**: Agresivo y expansivo (inicio)
  - **Economic**: Defensivo si está adelante  
  - **Pressure**: Máxima agresión (final de partida)
- **Análisis de estado del juego** en tiempo real
- **Toma de decisiones estratégicas** basada en contexto

### ⏱️ **Sistema de Cronómetro Visual**
- **Cuenta regresiva** con efectos visuales
- **Barra de progreso** que cambia de color según el tiempo
- **Advertencias** en los últimos 30 segundos
- **Integración** perfecta con los modos de tiempo

### 🏆 **Sistema de Victoria Múltiple**
- **Detección automática** de diferentes tipos de victoria
- **Condiciones configurables** por modo de juego
- **Pantalla de victoria mejorada** con estadísticas detalladas
- **Información contextual** sobre cómo se ganó

## 🎮 **Cómo Jugar**

### **Al Iniciar**
1. **Selecciona tu modo** de juego favorito
2. **Lee la descripción** de cada modo para entender las reglas
3. **Presiona "Comenzar Partida"** para iniciar

### **Controles (Sin Cambios)**
**Ratón (Drag & Drop):**
- Arrastra desde uno de tus planetas (verdes) al destino
- Suelta para enviar naves automáticamente

**Teclado:**
- Presiona la tecla de tu planeta origen
- Presiona la tecla del planeta destino
- Las naves se envían automáticamente

### **Estrategias por Modo**

#### **Clásico** 🟢
- Enfócate en expansión gradual
- Construye economía antes de atacar
- Defiende planetas grandes

#### **Blitz** ⚡
- ¡Actúa RÁPIDO! Solo tienes 90 segundos
- Aprovecha la producción acelerada
- Busca victorias económicas tempranas
- Controla el 75% de planetas para dominación

#### **Rey de la Colina** 👑
- Identifica el planeta con la corona dorada
- Lucha por el control del centro
- Defiende la colina una vez que la conquistes
- 30 segundos de control = victoria

## 🏗️ **Arquitectura V1.3**

### **Nuevos Módulos Especializados**
```
js/
├── gameModes.js          # Sistema de modos configurables
├── victoryConditions.js  # Múltiples condiciones de victoria
├── enhancedAI.js         # IA adaptativa con estrategias
├── gameTimer.js          # Cronómetro visual
├── kingOfHill.js         # Sistema Rey de la Colina
├── modeSelector.js       # Interfaz de selección de modos
└── [archivos existentes...]
```

### **Flujo de Inicialización**
1. **Sistemas V1.3** se inicializan primero
2. **Selector de Modo** se muestra al usuario
3. **Configuraciones** se aplican según el modo elegido
4. **Juego principal** inicia con la configuración correcta

### **Sistema de Balance Dinámico**
- **CONFIG.BALANCE**: Multiplicadores configurables
- **Aplicación automática**: Los modos modifican velocidades al vuelo
- **Valores efectivos**: Sistema que preserva configuración original

## 🐛 **Herramientas de Debug V1.3**

Abre la consola del navegador (F12) y usa:

```javascript
// Información del modo actual
GameDebug.logGameMode()

// Estrategia actual de la IA
GameDebug.logAIStrategy()

// Estado de condiciones de victoria
GameDebug.logVictoryConditions()

// Cambiar modo durante la partida
GameDebug.switchMode('blitz')

// Forzar fin de tiempo
GameDebug.forceTimeUp()

// Controlar la colina manualmente
GameDebug.setKingOfHillControl('player')

// Herramientas originales
GameDebug.logPlanetStats()
GameDebug.logFleetStats()
GameDebug.givePlayerShips(0, 50)
```

## ✅ **Características Implementadas**

### **V1.0 - Base Completa**
- ✅ Sistema de planetas con capacidades variables
- ✅ Generación automática de naves
- ✅ Mecánica de conquista y combate
- ✅ Controles drag & drop y teclado
- ✅ IA estratégica básica
- ✅ Interfaz responsive

### **V1.2 - Animaciones**
- ✅ Sistema de animaciones suaves
- ✅ Efectos visuales mejorados
- ✅ Transiciones de conquista

### **V1.3 - Galcon Fast-Paced Features**
- ✅ **Sistema completo de modos de juego**
- ✅ **Modo Blitz** con partidas de 90 segundos
- ✅ **Modo Rey de la Colina** con planeta central
- ✅ **IA adaptativa** con 3 estrategias dinámicas
- ✅ **Cronómetro visual** con efectos
- ✅ **Múltiples condiciones de victoria**
- ✅ **Selector de modo** con interfaz elegante
- ✅ **Sistema de balance** configurable por modo

## 🔧 **Configuración Avanzada**

El juego es altamente configurable. Para desarrolladores:

```javascript
// Crear un nuevo modo de juego
GameModes.modes.CUSTOM = {
    id: 'custom',
    name: 'Mi Modo',
    description: 'Modo personalizado',
    duration: 60000, // 1 minuto
    settings: {
        production: 2.0,
        fleetSpeed: 1.5,
        conquest: 1.0,
        initialShips: 12,
        kingOfHill: false,
        victoryConditions: ['total_conquest', 'domination']
    }
};

// Aplicar configuración personalizada
CONFIG.applyBalance({
    PRODUCTION_MULTIPLIER: 4.0,
    FLEET_SPEED_MULTIPLIER: 3.0,
    CONQUEST_SPEED_MULTIPLIER: 2.0,
    INITIAL_SHIPS: 20
});
```

## 🎯 **Mejoras Aplicadas de Sugerencias**

### **Robustez y Validaciones**
- ✅ Validación de entrada en sistemas críticos
- ✅ Manejo de casos edge en funciones matemáticas
- ✅ Control de errores en DOM y eventos
- ✅ Limpieza adecuada de recursos

### **Arquitectura Mejorada**
- ✅ **Modularidad avanzada**: Sistemas independientes y reutilizables
- ✅ **Separación de configuración**: CONFIG centralizado con balance dinámico
- ✅ **Documentación**: Comentarios JSDoc en funciones críticas

### **UX/UI Mejoradas**
- ✅ **Feedback visual**: Indicadores claros de modo y estado
- ✅ **Responsive design**: Adaptación a diferentes pantallas
- ✅ **Cancelación**: Sistema de restart mejorado con selección de modo

## 🚀 **Control de Versiones Mejorado**

Para evitar problemas futuros, ahora usamos:

### **Estructura de Ramas**
- `main` - Versión estable y probada
- `funcional` - Backup de última versión funcionando
- `v1.3-development` - Desarrollo de nuevas características
- `feature/*` - Ramas para características específicas

### **Flujo de Trabajo**
1. **Desarrollo** en ramas específicas
2. **Testing** en rama de desarrollo
3. **Validación** completa antes de merge
4. **Backup** de versión funcional
5. **Deploy** a main solo cuando esté 100% estable

## 🎮 **Próximas Características**

### **V1.4 - Polish & Balance**
- [ ] Efectos de sonido básicos
- [ ] Partículas visuales mejoradas
- [ ] Balance fino de velocidades por modo
- [ ] Más opciones de configuración

### **V1.5 - Expansion**
- [ ] Modo Teams (2v2)
- [ ] Planetas especiales con bonificaciones
- [ ] Sistema de puntuación y rankings
- [ ] Modo Tournament

### **V2.0 - Advanced Features**
- [ ] Multijugador online
- [ ] Editor de mapas
- [ ] Replays de partidas
- [ ] Estadísticas avanzadas

## 📋 **Registro de Cambios V1.3**

### **Nuevos Archivos**
- `js/gameModes.js` - Sistema modular de modos
- `js/victoryConditions.js` - Múltiples condiciones de victoria
- `js/enhancedAI.js` - IA adaptativa con estrategias
- `js/gameTimer.js` - Cronómetro visual con efectos
- `js/kingOfHill.js` - Sistema Rey de la Colina
- `js/modeSelector.js` - Interfaz de selección elegante

### **Archivos Actualizados**
- `js/game.js` - Integración completa con v1.3 systems
- `js/gameEngine.js` - Soporte para múltiples victorias y IA mejorada
- `js/ui.js` - Pantalla de victoria mejorada e indicadores de modo
- `js/config.js` - Sistema de balance dinámico
- `index.html` - Inclusión de todos los scripts v1.3

### **Mejoras de Arquitectura**
- Sistema modular completamente extensible
- Separación clara de responsabilidades
- Validación robusta de entrada
- Manejo adecuado de errores
- Limpieza automática de recursos

## 🤝 **Contribuir**

### **Principios de Desarrollo V1.3**
1. **Modularidad**: Cada sistema es independiente
2. **Configurabilidad**: Todo parametrizable externamente  
3. **Extensibilidad**: Fácil agregar nuevos modos/características
4. **Robustez**: Validación y manejo de errores en todo
5. **Performance**: Optimizado para 60fps estables

### **Agregar Nuevos Modos**
```javascript
// 1. Definir en gameModes.js
GameModes.modes.MI_MODO = {
    id: 'mi_modo',
    name: 'Mi Modo Especial',
    // ... configuración
};

// 2. Agregar lógica específica si es necesario
// 3. Actualizar victoryConditions.js si requiere nuevas victorias
// 4. Testing completo
```

## 📄 **Licencia**

Este proyecto es de código abierto y está disponible bajo licencia MIT.

---

## 🎊 **¡V1.3 COMPLETADO!**

**Space Conquest ahora es un verdadero Galcon moderno:**
- ⚡ **Partidas rápidas** e intensas de 90 segundos
- 👑 **Múltiples modos** con mecánicas únicas  
- 🤖 **IA inteligente** que se adapta a tu estilo
- 🏆 **Victorias diversas** que mantienen la emoción
- 🎮 **Interfaz pulida** y fácil de usar

**¡Que disfrutes conquistando el espacio a alta velocidad!** 🌌⚡