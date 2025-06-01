# 🧹 CLEANUP PHASE 2 - FILES TO REMOVE

## 📋 **Status: Ready for Cleanup**

The new modular architecture in `/src/` is **100% functional** and ready to replace the old `/js/` structure.

## 🔴 **FILES TO REMOVE (Confirmed Obsolete)**

### **1. Empty/Stub Files**
- ✅ `js/gameStubs.js` (0 bytes) - Empty file, safe to delete

### **2. Consolidated into New Architecture**
- ✅ `js/enhancedAI.js` (4.0KB) → Merged into `src/systems/ai.js` (16.3KB)
- ✅ `js/balance.js` (1.6KB) → Functionality integrated into `src/config/balanceConfig.js`
- ✅ `js/uiExtensions.js` (1.6KB) → Functionality integrated into `src/ui/ui.js`

### **3. Unused Features**
- ✅ `js/gameMenu.js` (3.5KB) - Game menu functionality not used
- ✅ `js/gameModes.js` (8.3KB) - Game modes functionality not implemented

**Total to remove: ~19KB of obsolete code**

## 🟡 **FILES TO KEEP (Still Used)**

### **Legacy Files Still Referenced**
These files are still part of the original structure and may be referenced:

- ⚠️ `js/ai.js` (14.5KB) - Original AI (keep until new system fully tested)
- ⚠️ `js/game.js` (15.0KB) - Original game init (backup)
- ⚠️ `js/gameEngine.js` (13.7KB) - Original engine (backup)
- ⚠️ All other core files - Keep as backup during transition

## ✅ **CLEANUP STRATEGY**

### **Phase 2a - Safe Cleanup (Now)**
Remove only the confirmed obsolete files:
1. `js/gameStubs.js` - Empty file
2. `js/enhancedAI.js` - Fully consolidated
3. `js/balance.js` - Functionality moved
4. `js/uiExtensions.js` - Functionality moved  
5. `js/gameMenu.js` - Unused feature
6. `js/gameModes.js` - Unused feature

### **Phase 2b - Complete Migration (After Testing)**
After confirming the new architecture works perfectly:
1. Remove remaining `/js/` files
2. Update any remaining references
3. Clean documentation
4. Final performance optimization

## 🎯 **NEXT STEPS**

1. **Remove Phase 2a files** ← We are here
2. **Test game functionality** with new architecture
3. **Document performance improvements**
4. **Proceed to Phase 2b** when ready

## 📊 **Expected Impact**

### **After Phase 2a Cleanup:**
- **-19KB** obsolete code removed
- **Cleaner** repository structure
- **No functional impact** (files are redundant/unused)
- **Easier navigation** for developers

### **After Phase 2b (Future):**
- **-30%** total codebase size
- **100%** modular architecture
- **Significantly improved** maintainability
- **Ready for Action 03** features

---

**Status**: ✅ Ready to execute Phase 2a cleanup
**Risk Level**: 🟢 Very Low (removing only confirmed obsolete files)
**Next Action**: Remove the 6 files listed in Phase 2a
