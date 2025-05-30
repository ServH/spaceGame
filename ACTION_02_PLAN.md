# Action 02: Sistema de Construcción Básico + Limpieza de Código 🏗️

## 🎯 **OBJETIVO PRINCIPAL**
Implementar el **Sistema de Construcción de Edificios** y **limpiar completamente el código** eliminando modos de juego innecesarios para enfocar el desarrollo en la experiencia clásica evolucionada.

---

## 📋 **SCOPE COMPLETO DEL ACTION 02**

### **PARTE A: LIMPIEZA DE CÓDIGO (Prioridad #1)**

#### **🗑️ Eliminar Modos de Juego Innecesarios**
- ❌ **Eliminar Modo Blitz** - Todo código relacionado
- ❌ **Eliminar Modo Rey de la Colina** - Todo código relacionado
- ❌ **Eliminar Menú de Selección de Modos** - Arranque directo al clásico
- ❌ **Simplificar BalanceConfig** - Solo modo clásico
- ❌ **Remover GameModes.js** - Archivo completo
- ❌ **Limpiar UIExtensions** - Solo funciones relevantes

#### **📁 Archivos a Modificar/Eliminar:**
```
js/balanceConfig.js    → Simplificar solo para clásico
js/gameModes.js        → ELIMINAR COMPLETO
js/uiExtensions.js     → Limpiar referencias a modos
js/gameMenu.js         → Posible eliminación completa
index.html             → Eliminar selectores de modo
```

#### **🎯 Resultado Esperado:**
- Juego arranca **directamente en modo clásico evolucionado**
- **Código más limpio** y mantenible
- **Sin complejidad innecesaria** de múltiples modos
- **Base sólida** para sistema de construcción

---

### **PARTE B: COMPLETAR SISTEMA DE RECURSOS BASE (Prioridad #2)**

#### **💰 Costos de Naves Implementados**
- ✅ **Definir Costes** en `js/config.js`: `SHIP_COST: { metal: 10 }`
- ✅ **Integrar Costes Jugador** en `js/input.js`: verificar recursos antes de crear flotas
- ✅ **Integrar Costes IA** en `js/ai.js`: IA debe considerar economía
- ✅ **UI de Recursos Completa**: mostrar tasas de generación ("+25/min")

#### **⚖️ Balance y Testing:**
- **Costo por nave**: 10 metal (ajustable)
- **Recursos iniciales**: Ajustar según costo de naves
- **Ritmo de juego**: Mantener fluidez con nuevos costos
- **IA económica**: IA debe gestionar recursos eficientemente

---

### **PARTE C: SISTEMA DE CONSTRUCCIÓN DE EDIFICIOS (Core)**

#### **🏗️ Edificios a Implementar (Nivel 1 solo)**

##### **1. Shipyard (Astillero)**
- **Función**: +50% velocidad de producción de naves
- **Costo**: 75 Metal
- **Tiempo construcción**: 60 segundos
- **Visual**: Plataformas orbitales con bahías
- **Efecto**: Reducir tiempo entre producción de naves

##### **2. Research Lab (Laboratorio)**
- **Función**: Genera puntos de investigación (prepara Action 03)
- **Costo**: 50 Metal + 25 Energy (introducir Energy básico)
- **Tiempo construcción**: 90 segundos
- **Visual**: Domos brillantes con efectos de energía
- **Efecto**: Base para futuro árbol tecnológico

##### **3. Mining Complex (Complejo Minero)**
- **Función**: +100% producción de metal del planeta
- **Costo**: 100 Metal
- **Tiempo construcción**: 75 segundos
- **Visual**: Excavaciones, equipos mineros
- **Efecto**: Duplicar generación de metal del planeta

#### **🔧 Sistemas Técnicos Nuevos**

##### **BuildingManager System**
```javascript
const BuildingManager = {
    // Gestión de construcción
    startConstruction(planetId, buildingType)
    completeConstruction(planetId, buildingType)
    cancelConstruction(planetId)
    
    // Cola de construcción
    addToQueue(planetId, buildingType)
    processQueue()
    
    // Costos y recursos
    canAfford(buildingType)
    payForBuilding(buildingType)
    
    // Efectos de edificios
    applyBuildingEffects(planet, buildingType)
}
```

##### **Building Construction Queue**
- **Cola por planeta**: Máximo 3 edificios en cola
- **Progreso visual**: Barras de construcción
- **Cancelación**: Reembolso del 50% de recursos
- **Priorización**: FIFO (First In, First Out)

##### **Resource Extension**
```javascript
// Introducir Energy básico para Research Lab
CONFIG.RESOURCES = {
    METAL: { /* existing */ },
    ENERGY: {
        generationBase: 1.0,  // 1 energy/min por planeta
        shipCost: 0,          // Solo edificios usan energy
        storageMultiplier: 0.5 // 0.5:1 ratio con capacidad planeta
    }
}
```

#### **🎨 Sistema Visual de Construcción**

##### **UI de Construcción de Edificios**
```
┌─────────────────────────────────┐
│ PLANETA ALPHA-3 [A]             │
│ Propietario: Jugador            │
│ Naves: 25/40  Metal: +5.2/min  │
│ ─────────────────────────────── │
│ CONSTRUCCIÓN:                   │
│ 🏭 Astillero    [75 Metal]      │
│ 🔬 Laboratorio  [50M + 25E]     │
│ ⛏️ Mina         [100 Metal]     │
│ ─────────────────────────────── │
│ EN COLA:                        │
│ 🏭 Astillero    [▓▓▓▓░] 45s     │
│ 🔬 Laboratorio  [Esperando...]  │
└─────────────────────────────────┘
```

##### **Indicadores Visuales**
- **Construcción en progreso**: Andamios translúcidos que se llenan
- **Edificios completados**: Iconos/estructuras en el planeta
- **Cola de construcción**: Lista visible con tiempos
- **Efectos de finalización**: Pulso de energía al completar

#### **⚙️ Especialización Planetaria**
- **Límite de edificios**: Máximo 2-3 por planeta
- **Decisiones estratégicas**: ¿Militar, económico, o investigación?
- **Sinergia de edificios**: Combinaciones efectivas
- **Planetas especializados**: Diferentes roles en el imperio

---

## 🎮 **FUNCIONALIDADES DE GAMEPLAY**

### **Mecánicas de Construcción**
1. **Selección de Planeta** → Menú de construcción aparece
2. **Elección de Edificio** → Verificar recursos y espacio
3. **Inicio de Construcción** → Barra de progreso y efectos visuales
4. **Finalización** → Efectos aplicados inmediatamente

### **Gestión de Recursos**
- **Verificación de costos** antes de construcción
- **Recursos requeridos** mostrados claramente
- **Cola de construcción** respeta disponibilidad
- **Balance económico** entre construcción y militar

### **Interfaz de Usuario**
- **Click derecho en planeta** → Menú de construcción
- **Tooltips informativos** con costos y beneficios
- **Indicadores de progreso** en tiempo real
- **Notificaciones** de construcción completada

---

## 📊 **BALANCE Y TESTING**

### **Costos Balanceados**
```javascript
BUILDING_COSTS = {
    shipyard: { metal: 75, energy: 0, time: 60000 },
    research_lab: { metal: 50, energy: 25, time: 90000 },
    mining_complex: { metal: 100, energy: 0, time: 75000 }
}
```

### **Efectos de Edificios**
- **Shipyard**: `planet.shipProductionRate *= 1.5`
- **Research Lab**: `planet.energyGeneration += 2` + research points
- **Mining Complex**: `planet.metalGeneration *= 2`

### **Progresión Típica de Juego**
1. **0-3 min**: Expansión básica + acumulación recursos
2. **3-6 min**: Primeras construcciones (Mining Complex)
3. **6-10 min**: Especialización planetaria (Shipyards)
4. **10+ min**: Construcciones avanzadas (Research Labs)

---

## 🔧 **IMPLEMENTACIÓN TÉCNICA**

### **Archivos Nuevos a Crear**
```
js/buildingManager.js     → Sistema central de construcción
js/buildingUI.js          → Interfaz de construcción
js/buildings.js           → Definiciones de edificios
```

### **Archivos a Modificar**
```
js/planet.js              → Añadir propiedades de edificios
js/resourceManager.js     → Integrar Energy + costos edificios
js/ui.js                  → Menús de construcción
js/gameEngine.js          → Integrar BuildingManager
js/config.js              → Configuración de edificios
```

### **Estructura de Datos**
```javascript
// Extensión de Planet class
Planet {
    buildings: {
        shipyard: { level: 0, constructing: false, progress: 0 },
        research_lab: { level: 0, constructing: false, progress: 0 },
        mining_complex: { level: 0, constructing: false, progress: 0 }
    },
    constructionQueue: [],
    lastConstructionUpdate: Date.now()
}
```

---

## 🎯 **CRITERIOS DE ÉXITO**

### **Funcionalidad Core**
- ✅ **3 tipos de edificios** construibles y funcionales
- ✅ **Cola de construcción** trabajando correctamente
- ✅ **Costos de recursos** verificados y deducidos
- ✅ **Efectos de edificios** aplicados visiblemente
- ✅ **UI intuitiva** para construcción

### **Balance y UX**
- ✅ **Tiempos de construcción** apropiados (60-90s)
- ✅ **Costos balanceados** con generación de recursos
- ✅ **Decisiones estratégicas** significativas
- ✅ **Progresión fluida** desde Action 01

### **Código y Arquitectura**
- ✅ **Código limpio** sin modos innecesarios
- ✅ **Arquitectura escalable** para futuras expansiones
- ✅ **Performance mantenido** (<5% impacto)
- ✅ **Debug tools** para testing

---

## 🚀 **PLAN DE DESARROLLO**

### **Semana 1: Limpieza y Fundación**
- **Días 1-2**: Eliminar modos de juego + limpiar código
- **Días 3-4**: Completar sistema de costos de naves
- **Día 5**: Testing de base económica + ajustes

### **Semana 2: Sistema de Construcción**
- **Días 1-2**: BuildingManager + estructura de datos
- **Días 3-4**: UI de construcción + visuales
- **Día 5**: Efectos de edificios + integración

### **Semana 3: Balance y Polish**
- **Días 1-2**: Balance de costos y tiempos
- **Días 3-4**: Testing completo + ajustes
- **Día 5**: Documentación + preparación Action 03

---

## 📝 **ENTREGABLES**

### **Al Final del Action 02:**
1. **Juego limpio** enfocado solo en evolución clásica
2. **Sistema económico completo** con costos de naves
3. **3 edificios básicos** completamente funcionales
4. **UI de construcción** intuitiva y pulida
5. **Base sólida** para Action 03 (Sistema de Tecnologías)

### **Preparación para Action 03:**
- **Research Labs** generando puntos de investigación
- **Arquitectura escalable** para árbol tecnológico
- **Balance económico** estable
- **Sistema de efectos** preparado para tecnologías

---

## 🎮 **CÓMO TESTEAR ACTION 02**

### **Testing de Limpieza**
1. **Arranque directo** - No menús de modo
2. **Código sin referencias** a modos eliminados
3. **Performance igual** o mejor que Action 01

### **Testing de Construcción**
1. **Construir cada edificio** en planetas diferentes
2. **Verificar costos** y efectos aplicados
3. **Cola de construcción** con múltiples edificios
4. **Cancelación** y reembolso funcionando

### **Testing de Balance**
1. **Partidas completas** de 15-20 minutos
2. **Múltiples estrategias** viables
3. **Decisiones significativas** sobre construcción
4. **Progresión fluida** desde recursos a edificios

---

**🎯 Action 02 establecerá las bases económicas y de construcción que permitirán el desarrollo del sistema de tecnologías en Action 03, creando la profundidad estratégica planificada para la evolución del juego clásico.**