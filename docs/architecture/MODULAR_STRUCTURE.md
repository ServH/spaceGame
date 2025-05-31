# 🏗️ SPACE GAME - MODULAR ARCHITECTURE DOCUMENTATION

## 📋 **Estructura Modular /src/**

### **🎯 Filosofía de Organización**
La nueva arquitectura organiza el código por **funcionalidad y responsabilidad**, facilitando:
- **Mantenimiento**: Cada módulo tiene una responsabilidad clara
- **Testing**: Módulos independientes pueden testearse por separado
- **Escalabilidad**: Fácil añadir nuevas features sin afectar otras
- **Colaboración**: Desarrolladores pueden trabajar en módulos específicos

---

## 📁 **Estructura de Directorios**

```
src/
├── config/          # Configuración del juego
│   ├── config.js         # Configuración core (canvas, planetas, etc.)
│   └── balanceConfig.js  # Balance y Energy Fuel System
├── core/            # Motor principal del juego
│   ├── gameEngine.js     # Loop principal, estado, control
│   └── utils.js          # Utilidades matemáticas comunes
├── entities/        # Entidades de juego
│   ├── planet.js         # Clase Planet con building system
│   └── fleet.js          # FleetManager y clase Fleet
├── input/           # Sistema de entrada modular
│   ├── uiFeedback.js     # Tooltips y notificaciones
│   ├── mouseHandler.js   # Eventos mouse y drag & drop
│   ├── keyboardHandler.js # Sistema SELECT + TARGET
│   └── inputManager.js   # Coordinador del input
├── systems/         # Sistemas de juego (migración gradual)
│   └── (pendiente)       # ai.js, resourceManager.js, buildings.js
└── ui/              # Interfaz de usuario
    └── (pendiente)       # animations.js, ui.js, resourceUI.js
```

---

## 🔗 **Dependencias y Carga**

### **Orden de Carga Optimizado**
```html
<!-- 1. Configuración base -->
<script src="src/config/config.js"></script>
<script src="src/config/balanceConfig.js"></script>

<!-- 2. Utilidades core -->
<script src="src/core/utils.js"></script>
<script src="src/core/gameEngine.js"></script>

<!-- 3. Entidades de juego -->
<script src="src/entities/planet.js"></script>
<script src="src/entities/fleet.js"></script>

<!-- 4. Sistema input modular -->
<script src="src/input/uiFeedback.js"></script>
<script src="src/input/mouseHandler.js"></script>
<script src="src/input/keyboardHandler.js"></script>
<script src="src/input/inputManager.js"></script>

<!-- 5. Sistemas legacy (migración gradual) -->
<script src="js/resourceManager.js"></script>
<script src="js/ai.js"></script>
<!-- etc. -->
```

### **Mapa de Dependencias**
```
config/config.js
├── NO dependencies
└── Provides: CONFIG global

core/utils.js
├── NO dependencies
└── Provides: Utils global

core/gameEngine.js
├── Depends: CONFIG, Utils
└── Provides: GameEngine global

input/inputManager.js
├── Depends: CONFIG, Utils, GameEngine
├── Uses: UIFeedback, MouseHandler, KeyboardHandler
└── Coordinates: All input functionality
```

---

## 🎮 **Módulos Input System**

### **inputManager.js - Coordinador Principal**
- **Responsabilidad**: Coordinar todos los módulos de input
- **API Pública**: selectPlanet(), attemptFleetSend(), showFeedback()
- **Inicialización**: init() inicializa todos los sub-módulos
- **Compatibilidad**: Mantiene API backward-compatible

### **mouseHandler.js - Eventos Mouse**
- **Responsabilidad**: Gestión completa de eventos mouse
- **Funcionalidades**: Click, right-click, drag & drop, hover
- **Drag System**: Línea verde direccional con flecha
- **SVG Coordinates**: Conversión precisa mouse → SVG

### **keyboardHandler.js - Sistema Teclado**
- **Responsabilidad**: Sistema SELECT + TARGET keyboard
- **Funcionalidades**: Selección planetas, targeting, debug keys
- **Prevención**: No interfiere con input fields del navegador
- **Debug**: Ctrl+K para debug keyboard status

### **uiFeedback.js - Retroalimentación Visual**
- **Responsabilidad**: Tooltips, notificaciones, feedback
- **Tooltips**: Información detallada de planetas y costes
- **Notifications**: Sistema animado de mensajes
- **CSS Injection**: Manejo propio de estilos de animación

---

## 🎯 **Entidades de Juego**

### **planet.js - Clase Planet**
- **Responsabilidad**: Lógica y visual de planetas
- **Building System**: Integrado con visual indicators
- **Tooltip Info**: Información completa para UI
- **Resource Management**: Generación metal/energy
- **Visual Updates**: SVG updates y building indicators

### **fleet.js - Sistema de Flotas**
- **FleetManager**: Gestión global de flotas
- **Fleet Class**: Lógica individual de cada flota
- **Movement**: Interpolación suave con animación
- **Energy Integration**: Compatible con Energy Fuel System
- **Visual Effects**: Trails y arrival animations

---

## ⚙️ **Configuración Centralizada**

### **config.js - Configuración Core**
- **Game Settings**: Canvas, planetas, fleets, AI
- **Energy Calculations**: Fórmulas de coste energético
- **Keyboard Assignments**: Sistema de asignación teclas
- **Visual Settings**: Colores, tamaños, efectos
- **Debug Utilities**: Herramientas de testing

### **balanceConfig.js - Balance del Juego**
- **Energy Fuel System**: Configuración completa
- **Resource Generation**: Metal/energy por planeta
- **Building Costs**: Costes y beneficios de edificios
- **Victory Conditions**: Solo conquest victory
- **Fast Game Mode**: Configuración fast-paced legacy

---

## 🛠️ **Debug y Development Tools**

### **debugModular - Herramientas Modulares**
```javascript
debugModular.listModules()     // Lista todos los módulos por categoría
debugModular.checkIntegrity()  // Verifica módulos críticos
```

### **debugInput - Input System Debug**
```javascript
debugInput.status()         // Estado del input manager
debugInput.keyboard()       // Test sistema keyboard
debugInput.moduleStats()    // Estadísticas de modularización
```

### **Performance Monitoring**
- Load time tracking por módulo
- System integrity verification
- Module dependency analysis

---

## 🚀 **Extensibilidad para Action 03**

### **Extension Points Identificados**
- **src/systems/**: Para nuevos sistemas de juego
- **src/ui/**: Para componentes UI avanzados
- **src/config/**: Para nuevas configuraciones
- **src/entities/**: Para nuevas entidades de juego

### **Plugin Architecture Ready**
- Módulos independientes fáciles de extender
- APIs well-defined para nuevas features
- Configuration system flexible
- Event system preparado para inter-module communication

### **Migration Path**
- Sistemas legacy en /js/ pueden migrarse gradualmente
- Backward compatibility mantenida durante transición
- Testing independiente de cada módulo
- Documentation automática de dependencies

---

## 📊 **Benefits de la Arquitectura Modular**

### **Development**
- **Faster Development**: Desarrolladores pueden trabajar en módulos específicos
- **Easier Testing**: Cada módulo puede testearse independientemente
- **Better Debugging**: Problemas localizados en módulos específicos
- **Code Reuse**: Módulos reutilizables para nuevas features

### **Maintenance**
- **Clear Responsibilities**: Cada archivo tiene una función específica
- **Easier Refactoring**: Cambios localizados en módulos
- **Better Documentation**: Estructura auto-documentada
- **Reduced Complexity**: Menor complejidad cognitiva por módulo

### **Scalability**
- **Easy Feature Addition**: Nuevos módulos sin afectar existentes
- **Team Collaboration**: Múltiples desarrolladores sin conflictos
- **Performance Optimization**: Optimizaciones granulares por módulo
- **Future-Proof**: Arquitectura preparada para crecimiento

---

Esta arquitectura modular proporciona una base sólida y extensible para el continued development del Space Game, facilitando tanto el mantenimiento actual como la evolución futura hacia Action 03 y beyond.