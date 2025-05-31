# 💻 SOURCE CODE STRUCTURE

## 📁 Organization

### 📂 `/core/` - Game Engine Core
- `gameEngine.js` - Main game loop and state management
- `planet.js` - Planet entities and behavior
- `fleet.js` - Fleet movement and combat

### 📂 `/systems/` - Game Systems
- `buildings/` - Building system implementation
- `resources/` - Resource management
- `ai/` - AI behavior and decision making

### 📂 `/ui/` - User Interface
- `input.js` - Input handling and controls
- `ui.js` - Main UI rendering
- `resourceUI.js` - Resource display
- `buildingUI.js` - Building interface

### 📂 `/config/` - Configuration
- `config.js` - Main game configuration
- `balanceConfig.js` - Balance parameters
- `buildings.js` - Building definitions

### 📂 `/utils/` - Utilities
- `utils.js` - Helper functions
- `animations.js` - Visual effects

---

## 🔄 Migration Status

Files are being reorganized from `/js/` to this structure.
Old files marked with `DEPRECATED_` prefix for removal.
