# TypeScript Scripts Not Appearing in Unity - Troubleshooting Guide

## ✅ Good News: VehicleAttachController.ts Already Exists!

The file is located at:
```
Assets/BuilditTemplate/Modules/Vehicle/Scripts/VehicleAttachController.ts
```

The issue is **not** that the file is missing, but that Unity/Zepeto hasn't made it available in the Add Component menu yet.

---

## 🔍 Why TypeScript Scripts Don't Appear in Add Component Menu

Unlike C# scripts, **TypeScript scripts in Zepeto require compilation** before they appear in Unity's Component menu.

The Zepeto build system:
1. Compiles `.ts` files to JavaScript
2. Generates Unity-compatible wrappers
3. Makes them available as MonoBehaviour components

If the compilation fails or hasn't run, the scripts won't appear in the Add Component menu.

---

## 🛠️ Solution: Force Recompile TypeScript Scripts

### Method 1: Unity Asset Refresh (Quickest)

1. **In Unity Editor:**
   - Click menu: `Assets` → `Refresh` (or press `Ctrl+R` / `Cmd+R`)
   - Wait for Unity to finish importing

2. **Check Console for Errors:**
   - Open `Window` → `General` → `Console`
   - Look for any red errors related to TypeScript compilation
   - If there are errors, they'll prevent scripts from appearing

3. **Try Adding Component Again:**
   - Select any GameObject
   - Click `Add Component`
   - Search for "VehicleAttachController"

---

### Method 2: Force TypeScript Recompilation

If Method 1 doesn't work, force a full TypeScript recompilation:

1. **Close Unity Editor** completely

2. **Delete Temporary Compilation Files:**
   ```
   Delete these folders in your project:
   - Library/
   - Temp/
   - obj/
   ```

   **WARNING:** This is safe - Unity will regenerate them. But it takes time!

3. **Reopen Unity Project:**
   - Unity will reimport everything
   - This can take 5-15 minutes depending on project size
   - Watch the progress bar in bottom-right

4. **Check Console:**
   - Look for successful TypeScript compilation messages
   - Ensure no errors

---

### Method 3: Zepeto-Specific Rebuild

Zepeto projects have special build scripts:

1. **Check for Zepeto Menu:**
   - Look for `ZEPETO` menu in Unity menu bar
   - Click `ZEPETO` → `Refresh Scripts` (if available)
   - OR `ZEPETO` → `Rebuild` (if available)

2. **Check package.json scripts:**
   ```bash
   # In terminal, navigate to project folder
   cd /Users/yeeunmin/Downloads/zepeto_buildit_unity_plugin

   # Run npm install (if dependencies missing)
   npm install

   # Check if there's a build script
   npm run build
   ```

---

## ✅ Verification: Check if Prefabs Already Have the Component

**Important:** Existing vehicle prefabs already have VehicleAttachController attached!

### How to Verify:

1. **Open an existing car prefab:**
   ```
   Assets/BuilditTemplate/Prefabs/ZepetoAssets_Vehicle/vehicle_car_001.prefab
   ```

2. **Double-click to enter Prefab Mode**

3. **Select the ROOT GameObject** (top level)

4. **Look in the Inspector:**
   - Scroll through the components
   - You should see:
     - `Vehicle State Controller (Script)`
     - `Vehicle Attach Controller (Script)` ← This is it!

5. **Check the Script Reference:**
   - If it says `(Script)` next to the name = ✅ Working
   - If it says `Missing Script` or has a warning icon = ❌ Compilation issue

---

## 🔧 Alternative: Add Component via Script Reference

If you can't find it in Add Component menu but need to add it:

### Option A: Copy from Existing Prefab

1. **Open existing vehicle prefab** (e.g., vehicle_car_001)
2. **Right-click on VehicleAttachController component**
3. **Select "Copy Component"**
4. **Go to your new motorcycle prefab**
5. **Right-click in Inspector**
6. **Select "Paste Component as New"**

This copies the component with all its settings!

---

### Option B: Manually Add Script Reference

1. **Select your motorcycle GameObject**

2. **In Inspector, click `Add Component`**

3. **Instead of searching, click `Add Component` → `Scripts`**

4. **Manually drag the script file:**
   - Locate: `Assets/BuilditTemplate/Modules/Vehicle/Scripts/VehicleAttachController.ts`
   - Drag it onto the Inspector

Unity should attach it even if it doesn't appear in the search menu.

---

## 🐛 Common Issues & Fixes

### Issue: "Script is Missing" on Prefabs

**Symptoms:**
- Existing prefabs show "Missing Script" warnings
- Components have a warning icon

**Fix:**
1. Check Console for TypeScript compilation errors
2. Fix any errors in the .ts files
3. Force recompile (Method 2 above)

---

### Issue: Console Shows TypeScript Errors

**Symptoms:**
```
error TS2304: Cannot find name 'Something'
error TS2345: Argument of type X is not assignable to type Y
```

**Fix:**
1. Open the .ts file mentioned in the error
2. Fix the TypeScript syntax/type errors
3. Save the file
4. Unity will auto-recompile

**Common TypeScript Errors in Zepeto:**
- Missing imports
- Incorrect type annotations
- Missing type definitions for Unity classes

---

### Issue: "Cannot Add Script Behavior" Error

**Symptoms:**
- Can't add any TypeScript component
- Error message when trying to add component

**Fix:**
- Verify Zepeto SDK is properly installed
- Check `Packages/manifest.json` for Zepeto packages
- Reimport Zepeto packages from Package Manager

---

## 📊 Understanding the Compilation Process

When you save a `.ts` file in a Zepeto project:

1. **TypeScript Compiler runs**
   - Converts `.ts` → JavaScript
   - Generates type definitions

2. **Zepeto Script Importer runs**
   - Creates Unity-compatible wrapper
   - Generates `.meta` file with:
     - Compiled JavaScript code
     - Manifest with property definitions
     - Component metadata

3. **Unity imports the component**
   - Makes it available in Add Component menu
   - Attaches to GameObjects like regular MonoBehaviour

**Evidence of successful compilation:**
- `.meta` file has `compiledResult` field
- `.meta` file has `manifest` with properties
- `isCompiled: true` in meta file

---

## ✅ Verification Checklist

After trying the fixes above, verify:

- [ ] No errors in Unity Console
- [ ] VehicleAttachController.ts exists at correct path
- [ ] VehicleAttachController.ts.meta file exists
- [ ] Can search for "VehicleAttachController" in Add Component menu
- [ ] Existing car prefabs show the component (not "Missing Script")
- [ ] Can add component to new GameObject successfully

---

## 🎯 Quick Fix Summary

**If you just need to convert a car to motorcycle:**

1. **Don't create a new prefab from scratch!**
2. **Use the existing car prefab:**
   - Duplicate `vehicle_car_001.prefab`
   - It already has VehicleAttachController attached!
   - Just replace the 3D model and animations

3. **Follow the conversion guide:**
   - See `CAR_TO_MOTORCYCLE_CONVERSION_GUIDE.md`
   - The existing prefab has all required scripts

**You DON'T need to manually add VehicleAttachController to existing prefabs!**

---

## 📝 Still Having Issues?

If none of the above works:

1. **Check Unity Version:**
   - Zepeto requires specific Unity versions
   - Check Zepeto docs for supported versions

2. **Check Zepeto SDK Installation:**
   - Open `Window` → `Package Manager`
   - Verify Zepeto packages are installed:
     - ZEPETO.Script
     - ZEPETO.Character.Controller
     - etc.

3. **Check File Permissions:**
   - Ensure you have write permissions to the project folder
   - Try running Unity as administrator (Windows) or with sudo (Mac) if needed

4. **Check the Meta File:**
   - Open `VehicleAttachController.ts.meta`
   - Look for `"isCompiled":true`
   - If it says `false`, the compilation failed
   - Check Console for the reason

---

## 🔍 Debugging: Check Compilation Status

**Open the .meta file to verify compilation:**

```
Assets/BuilditTemplate/Modules/Vehicle/Scripts/VehicleAttachController.ts.meta
```

**Look for these fields:**

```yaml
# Good - Script is compiled:
compiledResult: '{"source":"use strict"...[lots of JavaScript code]...}'
isCompiled: true
manifest:
  properties:
    - name: "vehicleSettings"
    - name: "isAttached"
    # ...more properties

# Bad - Script failed to compile:
compiledResult: ''
isCompiled: false
```

If `isCompiled: false`, check the Console for TypeScript errors.

---

## 💡 Pro Tip

**The script IS working in your project!**

The fact that you have working vehicle prefabs proves it. The issue is just visibility in the Add Component menu, which doesn't affect functionality if you're duplicating existing prefabs (which is the recommended approach anyway).

---

## 🚀 Next Steps

1. ✅ Verify the file exists (it does!)
2. ✅ Check existing prefabs have the component (they do!)
3. ✅ Force Unity to refresh (Method 1 above)
4. ✅ If that fails, try Method 2 (delete Library/Temp)
5. ✅ **For motorcycle conversion:** Just duplicate an existing car prefab!

---

**Remember:** You're modifying a pre-built vehicle asset, so the scripts are already there and working. You just need Unity to recognize them!
