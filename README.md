# 🚀 SPACE GAME - Evolution Project

> **Real-time space strategy evolving from Galcon simplicity to 4X depth**

[![Status](https://img.shields.io/badge/Status-Action%2002%20Complete-success)](#)
[![Balance](https://img.shields.io/badge/Balance-Energy%20Fuel%20System-yellow)](#)
[![Version](https://img.shields.io/badge/Version-1.4.5-blue)](#)

## 🎮 **What is Space Game?**

An **evolutionary strategy game** that starts with familiar Galcon mechanics and gradually adds 4X strategy depth through successive "Actions" (development phases).

### **Core Philosophy: "Opción A Galcon"**
- 🆓 **Ships regenerate FREE** on owned planets
- ⚡ **Moving fleets costs energy** (fuel system)
- 🏗️ **Buildings provide strategic advantages**
- 🌍 **Distance matters** for tactical decisions

---

## 🎯 **Current State - Action 02 Complete + Energy Fuel System**

### ✅ **Implemented Features**
- **Complete building system** with 3 building types
- **AI opponent** with intelligent building decisions
- **Energy as Fuel system** - Movement costs energy based on distance
- **Resource economy** (Metal for construction, Energy for movement)
- **Visual feedback** with building indicators and animations
- **Balanced gameplay** averaging 6-10 minute games

### 🔄 **Active Development**
- **Energy-distance calculations** - Geographic strategy matters
- **Research Labs essential** - Energy infrastructure is critical
- **Enhanced AI behavior** - Adapts to energy constraints

---

## 🚀 **Quick Start**

### **Play Now**
1. Open `index.html` in any modern browser
2. Game starts automatically in Classic Evolution mode
3. Left-click planets to select, right-click to send fleets
4. Right-click your planets to build structures
5. **Watch your energy!** Movement costs energy now

### **Controls**
- **Left Click**: Select planet
- **Right Click**: Send fleet / Open building menu
- **Hover**: See movement costs and planet info
- **Keyboard**: Assigned keys for quick planet selection

### **Key Strategy Tips**
- **Build Research Labs early** - They generate +6 energy/min
- **Distance = Cost** - Local expansion is cheaper
- **Energy management** - Don't get stranded without fuel!

---

## 📁 **Project Structure**

```
spaceGame/
├── 📁 js/              # Core game logic
│   ├── config.js       # Main configuration + energy costs
│   ├── balanceConfig.js # Victory conditions & balance
│   ├── game.js         # Game initialization
│   ├── gameEngine.js   # Core game loop
│   ├── buildings.js    # Building definitions
│   ├── resourceManager.js # Resource & energy management
│   ├── ai.js           # AI behavior
│   └── ...            # Other game systems
├── 📁 docs/            # Documentation
│   ├── action-01/      # Action 01 archive
│   ├── action-02/      # Action 02 archive
│   ├── balance/        # Balance experiments
│   └── planning/       # Future roadmap
├── 📁 css/             # Stylesheets
├── index.html          # Game entry point
├── README.md           # This file
└── ENERGY_FUEL_IMPLEMENTATION_COMPLETE.md # Latest changelog
```

---

## 🛠️ **Development**

### **Current Branch**
`action-02-balance-experiments` - Energy fuel system implementation

### **Key Configuration Files**
- `js/config.js` - Energy costs, movement formulas, resource rates
- `js/balanceConfig.js` - Victory conditions, game balance
- `js/buildings.js` - Building effects and costs

### **Testing Balance Changes**
1. Modify values in configuration files
2. Refresh browser to test immediately
3. Check console for debug info (`debugBuildings.test()`)
4. Document results in `docs/balance/`

---

## 📊 **Energy Fuel System**

### **"Opción A Galcon" Economics**
```
🆓 Ship Generation: FREE (automatic regeneration)
⚡ Fleet Movement: Costs Energy (distance-based)
🏗️ Construction: Costs Metal
📍 Geography: Distance affects fuel consumption
```

### **Movement Cost Formula**
```javascript
Energy Cost = (1.5 × ships) + (distance × ships × 0.005)
```

### **Strategic Depth**
- **Early Game**: Limited energy forces careful movement
- **Mid Game**: Research Labs become essential for energy generation
- **Late Game**: Energy infrastructure determines military capability

---

## 🎯 **Testing the Energy System**

### **Immediate Tests**
1. **Start a game** - Notice initial energy (90)
2. **First movement** - See energy cost in action
3. **Build Research Lab** - Watch energy generation increase (+6/min)
4. **Try long-distance attack** - Feel the cost difference

### **Debug Commands**
Open browser console and try:
```javascript
debugBuildings.test()        // Show all debug commands
debugBuildings.resources()   // Check current energy/metal
debugBuildings.constructions() // Show active buildings
```

---

## 🏗️ **Building System**

### **Research Lab** 🔬
- **Cost**: 40 metal + 15 energy
- **Effect**: +6 energy generation/min
- **Strategy**: Essential for sustained military operations

### **Mining Complex** ⛏️
- **Cost**: 80 metal
- **Effect**: +100% metal production
- **Strategy**: Infrastructure for more buildings

### **Shipyard** 🚀
- **Cost**: 60 metal
- **Effect**: +50% ship production rate
- **Strategy**: Faster military buildup

---

## 🤖 **AI Behavior**

The AI now follows the same energy rules as the player:
- **Prioritizes Research Labs** when energy is low (<30)
- **Plans movements** based on energy availability
- **Adapts strategy** to energy constraints
- **Competes effectively** with energy-aware decisions

---

## 🎯 **What's Next - Roadmap**

### **Action 02.5 - Balance Refinement** (Current)
- Fine-tune energy costs based on testing
- Optimize Research Lab impact
- Refine AI energy decision-making

### **Action 03 - Technology Tree** (Planned)
- Unlockable building upgrades
- Specialized planet bonuses
- Advanced victory conditions

### **Action 04+ - Full 4X** (Future)
- Diplomacy systems
- Trade routes
- Multiple factions

---

## 📄 **Documentation**

- **[Energy Fuel Implementation](ENERGY_FUEL_IMPLEMENTATION_COMPLETE.md)** - Latest system details
- **[Complete Action 02 Status](ACTION-02-COMPLETE-DOCUMENTATION.md)** - Full implementation report
- **[Balance Experiments](docs/balance/)** - Testing data and results
- **[Evolution Plan](docs/planning/)** - Long-term roadmap

---

## 🤝 **Contributing**

This is an active evolution project. Key areas for contribution:

- **Balance Testing**: Play and provide feedback on energy system
- **Feature Suggestions**: Ideas for strategic depth
- **Documentation**: Help improve setup and testing guides
- **Code Organization**: Assist with ongoing restructure

---

## 📜 **Version History**

- **v1.4.5** - Energy Fuel System Complete (Movement costs energy)
- **v1.4.0** - Action 02 Complete (Building system with AI)
- **v1.3.x** - Action 01 Complete (Core Galcon mechanics)
- **v1.2.x** - Resource system foundation
- **v1.1.x** - Basic planet conquest
- **v1.0.x** - Initial prototype

---

## 🎮 **Experience the Evolution**

The game has evolved from simple Galcon mechanics to a strategic experience where:

1. **Energy management is critical** - Every movement has a cost
2. **Buildings matter strategically** - Research Labs are game-changers
3. **Geography affects tactics** - Distance is a strategic factor
4. **AI provides real challenge** - Competes with same rules

**Try it now** - Open `index.html` and feel the difference energy management makes!

---

**Built with**: Pure JavaScript, SVG, CSS3  
**Philosophy**: Evolution through iteration  
**Goal**: Accessible strategy with emergent depth  

*"From simple clicks to energy-driven strategic mastery"*