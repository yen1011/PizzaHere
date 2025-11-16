# Converting Car Vehicle to Motorcycle - Complete Guide

This guide explains how to convert a pre-built car vehicle asset into a motorcycle in your Zepeto plugin.

---

## 📋 Table of Contents

1. [Understanding the Vehicle Structure](#understanding-the-vehicle-structure)
2. [Available Motorcycle Assets](#available-motorcycle-assets)
3. [Method 1: Modify Existing Car Prefab](#method-1-modify-existing-car-prefab)
4. [Method 2: Create New Motorcycle Prefab](#method-2-create-new-motorcycle-prefab)
5. [Step-by-Step Conversion](#step-by-step-conversion)
6. [Animation Setup](#animation-setup)
7. [Settings Configuration](#settings-configuration)
8. [Testing Your Motorcycle](#testing-your-motorcycle)
9. [Troubleshooting](#troubleshooting)

---

## Understanding the Vehicle Structure

Every vehicle in Zepeto has this hierarchy:

```
vehicle_car_001 (Root GameObject)
├── VehicleStateController.ts (Script Component)
├── VehicleAttachController.ts (Script Component)
├── Components (Auto-generated)
│   ├── Positions
│   │   ├── Driver (Transform - where character sits)
│   │   └── Exit_1 (Transform - where character exits)
│   ├── cameraFPS (Transform - first person camera)
│   ├── cameraTPS (Transform - third person camera)
│   └── Exits (Transform container)
│
└── Body (Child GameObject - THE 3D MODEL)
    ├── VE_Car_001 (Your car 3D model)
    └── Animator (for wheel/door animations)
```

### Key Components

**VehicleStateController.ts** - Located at line 58:
```typescript
public body: Transform;  // References the 3D model
public animator: Animator;  // References the model's animator
```

**Animation Clips** - Located at lines 34-37:
```typescript
public clipMove: AnimationClip;  // Forward movement animation
public clipLeft: AnimationClip;  // Left turn animation
public clipRight: AnimationClip;  // Right turn animation
```

---

## Available Motorcycle Assets

Your project already includes motorcycle assets!

### 🏍️ Motorcycle Models
Located in: `Assets/BuilditTemplate/Themes/ZepetoAsset_Vehicle/Models/`

- **VE_Bike_001.FBX** - Standard motorcycle
- **VE_Bike_002.FBX** - Sport motorcycle
- **VE_Bike_003.FBX** - Classic motorcycle
- **VE_Bike_001_Colider.FBX** - Collision mesh

### 🎬 Motorcycle Animations (Character Riding)
Located in: `Assets/BuilditTemplate/Themes/ZepetoAsset_Vehicle/Animations/Bike/`

- **Move_Bike.anim** - Character riding forward
- **Left_Bike.anim** - Character leaning left
- **Right_Bike.anim** - Character leaning right

### 🔊 Motorcycle Audio
Located in: `Assets/BuilditTemplate/Themes/ZepetoAsset_Vehicle/Resources/Vehicle/Audio/`

- **bikeHorn.wav** - Motorcycle horn sound

---

## Method 1: Modify Existing Car Prefab

This is the quickest method - directly modify an existing car prefab.

### Advantages:
✅ Keeps all scripts and settings intact
✅ Faster setup
✅ All anchor points already configured

### Steps:

1. **Duplicate a Car Prefab**
   - Navigate to: `Assets/BuilditTemplate/Prefabs/ZepetoAssets_Vehicle/`
   - Duplicate `vehicle_car_001.prefab`
   - Rename to: `vehicle_motorcycle_001.prefab`

2. **Open Prefab for Editing**
   - Double-click the prefab to enter Prefab Mode
   - Find the "Body" child GameObject in hierarchy

3. **Replace the 3D Model**
   - Delete the current car model (e.g., `VE_Car_001`) from under "Body"
   - Drag `VE_Bike_001.FBX` from the Project window into "Body" as a child
   - Reset the Transform:
     - Position: `(0, 0, 0)`
     - Rotation: `(0, 0, 0)`
     - Scale: `(1, 1, 1)`

4. **Update the Body Reference**
   - Select the root GameObject (vehicle_motorcycle_001)
   - Find `VehicleStateController` component
   - In the **Model** section:
     - Set **Body**: Drag the "Body" GameObject here
     - Set **Animator**: Leave empty if motorcycle model doesn't have animations

5. **Update Animation Clips**
   - Still on `VehicleStateController` component
   - In the **Animations** section:
     - **Clip Move**: Drag `Move_Bike.anim`
     - **Clip Left**: Drag `Left_Bike.anim`
     - **Clip Right**: Drag `Right_Bike.anim`

6. **Adjust Driver Position**
   - Expand hierarchy: `Positions > Driver`
   - Move the **Driver** Transform to match where the character should sit on motorcycle
   - Typical motorcycle driver position: `Y = 0.8` (slightly higher than car)

7. **Save Prefab**
   - Click the `<` arrow at top left to exit Prefab Mode
   - Prefab is automatically saved

---

## Method 2: Create New Motorcycle Prefab

Create a completely new motorcycle from scratch.

### Steps:

1. **Create Root GameObject**
   - Right-click in Hierarchy → Create Empty
   - Name it: `vehicle_motorcycle_custom`

2. **Add Required Scripts**
   - Add Component: `VehicleStateController.ts`
   - Add Component: `VehicleAttachController.ts`

3. **Create Anchor Point Structure**
   - Right-click root → Create Empty → Name: `Positions`
     - Under Positions: Create Empty → Name: `Driver`
     - Under Positions: Create Empty → Name: `Exit_1`
   - Right-click root → Create Empty → Name: `cameraFPS`
   - Right-click root → Create Empty → Name: `cameraTPS`

4. **Add Motorcycle Model**
   - Right-click root → Create Empty → Name: `Body`
   - Drag `VE_Bike_001.FBX` as child of Body

5. **Configure VehicleStateController**
   - **Functional Anchor Points:**
     - Driver: → Positions/Driver
     - Passenger: (empty array - motorcycles typically single rider)
     - Exit Points: Size = 1, Element 0 = Exit_1
     - Camera FPS: → cameraFPS
     - Camera TPS: → cameraTPS

   - **Model:**
     - Animator Controller: → `Vehicle_AnimatorController` (find in Project)
     - Body: → Body GameObject
     - Animator: Leave empty (unless custom animations)

   - **Animations:**
     - Clip Move: → `Move_Bike.anim`
     - Clip Left: → `Left_Bike.anim`
     - Clip Right: → `Right_Bike.anim`

6. **Create Prefab**
   - Drag the complete GameObject from Hierarchy to Project folder
   - Recommended location: `Assets/BuilditTemplate/Prefabs/ZepetoAssets_Vehicle/`

---

## Step-by-Step Conversion

### Step 1: Backup Your Work
Always duplicate the original prefab before modifying!

### Step 2: Replace the 3D Model

**In VehicleStateController (Inspector):**

The `body` field (line 58 in VehicleStateController.ts) references the GameObject containing your 3D model.

```
Before (Car):
vehicle_car_001
└── Body
    └── VE_Car_001.FBX ← Current car model

After (Motorcycle):
vehicle_motorcycle_001
└── Body
    └── VE_Bike_001.FBX ← New motorcycle model
```

**How to do it:**
1. Select your vehicle prefab
2. Open it in Prefab Mode (double-click)
3. Find the "Body" GameObject
4. Delete the old car model child
5. Drag in `VE_Bike_001.FBX` as new child
6. Ensure transform is reset to (0,0,0)

### Step 3: Update Settings Reference

Every vehicle needs a Settings asset for configuration.

**Create Motorcycle Settings:**

1. Navigate to: `Assets/BuilditTemplate/Themes/ZepetoAsset_Vehicle/Settings/`
2. Duplicate an existing car settings (e.g., `Car_001.asset`)
3. Rename to: `Bike_001.asset`
4. Select the prefab root GameObject
5. Find `VehicleAttachController` component
6. Assign **Vehicle Settings** → `Bike_001.asset`

---

## Animation Setup

Animations in the vehicle system control how the **character** (rider) looks while driving, NOT the vehicle model itself.

### Understanding Animation Flow

```
VehicleObjectSettings (Bike_001.asset)
  ↓ (references)
run_zepeto: Move_Bike.anim
run_left_zepeto: Left_Bike.anim
run_right_zepeto: Right_Bike.anim
  ↓ (copied to)
VehicleStateController
  ↓ (uses during gameplay)
Character Animator (makes rider lean/move)
```

### Configure in Settings Asset

1. **Open Settings Asset**
   - Location: `Assets/BuilditTemplate/Themes/ZepetoAsset_Vehicle/Settings/Bike_001.asset`
   - Double-click to open in Inspector

2. **Assign Character Animations**
   - Find **Animations - Zepeto** section:
     - **run_zepeto**: → `Move_Bike.anim`
     - **run_left_zepeto**: → `Left_Bike.anim`
     - **run_right_zepeto**: → `Right_Bike.anim`
     - **idle_zepeto**: → `Move_Bike.anim` (can use same as run)

3. **Optional Animations** (if you have them):
   - **horn_zepeto**: Character animation when honking
   - **jump_zepeto**: Character animation when jumping
   - **land_zepeto**: Character animation when landing

### Configure in Prefab

The `VehicleStateController` on your prefab also needs these:

1. Select your motorcycle prefab
2. Find `VehicleStateController` component
3. In **Animations** section:
   - **Clip Move**: → `Move_Bike.anim`
   - **Clip Left**: → `Left_Bike.anim`
   - **Clip Right**: → `Right_Bike.anim`

These get bound at runtime (see line 127-142 in VehicleStateController.ts).

---

## Settings Configuration

### Open Your Settings Asset

Location: `Assets/BuilditTemplate/Themes/ZepetoAsset_Vehicle/Settings/Bike_001.asset`

### Recommended Motorcycle Settings

```yaml
# Basic Info
icon: "bike_icon_thumbnail"
assetKey: "vehicle_motorcycle_001"
hornAssetKey: "bikeHorn"
category: Ground

# Character
targetBone: LastBone
characterHeight: 1.0

# Speed (Motorcycles are typically faster than cars)
rotateAnglePerFrame: 3.0      # More agile turning
accSpeedPerFrame: 0.1          # Faster acceleration
decreaseSpeedPerFrame: 0.02    # Slower deceleration
magnification: 2.0             # Higher top speed
backMagnification: -0.7        # Slower reverse

# Boost (Optional)
boostMagnification: 2.0
boostDuration: 2.0

# Options
isHorn: true        # Enable horn
isBoost: true       # Enable speed boost
isJump: false       # Usually false for motorcycles
isHeadlight: true   # Enable headlights
isAction: false
```

### Speed Tuning Guide

- **rotateAnglePerFrame**: Higher = sharper turns (motorcycles = 3-4, cars = 2)
- **accSpeedPerFrame**: Higher = faster acceleration (motorcycles = 0.08-0.12)
- **magnification**: Global speed multiplier (motorcycles = 1.8-2.5)
- **backMagnification**: Negative value (motorcycles = -0.5 to -0.8)

---

## Testing Your Motorcycle

### Quick Test Checklist

1. **Place in Scene**
   - Drag your motorcycle prefab into the scene
   - Position it on flat ground

2. **Enter Play Mode**
   - Press Play in Unity
   - Approach the motorcycle
   - Click the interaction icon

3. **Check Basic Functions**
   - ✅ Can get on motorcycle
   - ✅ Character sits in correct position
   - ✅ Camera follows properly
   - ✅ Can drive forward/backward
   - ✅ Can turn left/right
   - ✅ Character plays motorcycle animations
   - ✅ Can get off motorcycle
   - ✅ Character exits at correct position

### Common Issues to Check

| Issue | Solution |
|-------|----------|
| Character floats above seat | Adjust Driver position (Y value) |
| Character sinks into motorcycle | Increase Driver Y position |
| Can't get on motorcycle | Check trigger collider exists on root |
| Motorcycle too slow | Increase `magnification` in settings |
| Motorcycle turns too slowly | Increase `rotateAnglePerFrame` |
| Wrong animation plays | Verify animation assignments in settings |
| Camera clips through model | Adjust cameraTPS position (move back/up) |

---

## Troubleshooting

### Issue: "Character not sitting properly"

**Location to fix:** Driver Transform position

1. Open prefab in Prefab Mode
2. Navigate to: `Positions > Driver`
3. Adjust position:
   - **X**: Left/Right (usually 0)
   - **Y**: Up/Down (try 0.6 - 1.0 for motorcycles)
   - **Z**: Forward/Back (usually 0)

4. Adjust rotation if character faces wrong way:
   - Rotation Y: 0 (facing forward)

### Issue: "Wrong animations playing"

**Check 3 places:**

1. **Settings Asset** (`Bike_001.asset`):
   - Animations - Zepeto section
   - Ensure `run_zepeto`, `run_left_zepeto`, `run_right_zepeto` assigned

2. **VehicleStateController Component** (on prefab):
   - Animations section
   - Ensure `clipMove`, `clipLeft`, `clipRight` assigned

3. **Animation Files Exist**:
   - Verify files at: `Assets/BuilditTemplate/Themes/ZepetoAsset_Vehicle/Animations/Bike/`

### Issue: "Model is wrong size"

**Solutions:**

**Option 1: Scale the model** (Quick fix)
1. Select Body GameObject
2. Adjust Scale (try 0.8 - 1.2)

**Option 2: Adjust in modeling software** (Proper fix)
1. Export model from Blender/Maya at correct scale
2. Re-import to Unity

### Issue: "Camera goes inside motorcycle"

**Location to fix:** cameraTPS position

1. Select prefab root
2. Find `cameraTPS` child
3. Adjust:
   - **Y**: Higher (try 2.0 - 3.0)
   - **Z**: Further back (try -4.0 to -6.0)

This is set at line 115 in VehicleStateController.ts:
```typescript
this.cameraTPS.localPosition = Vector3.op_Addition(
    this.cameraTPS.localPosition,
    new Vector3(0, 1.3, -4)
);
```

### Issue: "Motorcycle doesn't move"

**Checklist:**
- ✅ VehicleMovementController exists in scene (check with Find Objects of Type)
- ✅ VehicleManager exists in scene
- ✅ Settings asset assigned in VehicleAttachController
- ✅ All required scripts attached
- ✅ No errors in Console

### Issue: "Can't hear horn"

**Fix:**
1. Open settings asset (`Bike_001.asset`)
2. Set `hornAssetKey: "bikeHorn"`
3. Set `isHorn: true`
4. Verify audio file exists at: `Resources/Vehicle/Audio/bikeHorn.wav`

---

## Advanced: Using Custom Motorcycle Model

### If you have your own motorcycle 3D model:

1. **Import Model**
   - Drag .FBX/.OBJ into Unity Project
   - Recommended location: `Assets/BuilditTemplate/Themes/ZepetoAsset_Vehicle/Models/`

2. **Configure Import Settings**
   - Select model in Project
   - Inspector → Model tab:
     - Scale Factor: 1
     - Mesh Compression: Off
     - Read/Write Enabled: ✓

3. **Replace in Prefab**
   - Follow [Step 2: Replace the 3D Model](#step-2-replace-the-3d-model)
   - Use your custom model instead of VE_Bike_001

4. **Adjust Collider**
   - Add MeshCollider or BoxCollider to Body
   - Match motorcycle shape
   - Enable "Is Trigger" if needed

### Custom Animation Creation

If you want custom riding animations:

1. **Create Animation in Animation Software** (Blender, Maya, etc.)
   - Character sitting on motorcycle
   - Character leaning left/right
   - Export as .FBX with humanoid rig

2. **Import to Unity**
   - Import .FBX
   - Set Animation Type: Humanoid
   - Configure Avatar

3. **Assign in Settings**
   - Use your custom animations in `run_zepeto`, `run_left_zepeto`, etc.

---

## Quick Reference: File Locations

```
Assets/BuilditTemplate/
├── Modules/Vehicle/
│   ├── Scripts/
│   │   ├── VehicleStateController.ts      ← Main vehicle controller
│   │   ├── VehicleAttachController.ts      ← Character attachment
│   │   └── VehicleObjectSettings.ts        ← Settings class definition
│   └── Prefabs/
│       └── (put prefabs for testing here)
│
├── Prefabs/ZepetoAssets_Vehicle/
│   ├── vehicle_car_001.prefab             ← Original car prefabs
│   └── vehicle_motorcycle_001.prefab      ← Your new motorcycle
│
└── Themes/ZepetoAsset_Vehicle/
    ├── Models/
    │   ├── VE_Bike_001.FBX                ← Motorcycle 3D models
    │   ├── VE_Bike_002.FBX
    │   ├── VE_Bike_003.FBX
    │   └── VE_Bike_001_Colider.FBX       ← Collision mesh
    │
    ├── Animations/Bike/
    │   ├── Move_Bike.anim                 ← Character animations
    │   ├── Left_Bike.anim
    │   └── Right_Bike.anim
    │
    ├── Settings/
    │   ├── Car_001.asset                  ← Car settings (reference)
    │   └── Bike_001.asset                 ← Your motorcycle settings
    │
    └── Resources/Vehicle/Audio/
        └── bikeHorn.wav                   ← Motorcycle horn sound
```

---

## Summary Checklist

### Converting Car → Motorcycle:

- [ ] **Duplicate car prefab** → rename to `vehicle_motorcycle_001`
- [ ] **Open in Prefab Mode**
- [ ] **Delete old car model** from Body
- [ ] **Add motorcycle model** (VE_Bike_001.FBX) to Body
- [ ] **Reset model transform** to (0,0,0)
- [ ] **Assign Body reference** in VehicleStateController
- [ ] **Update animations** in VehicleStateController:
  - [ ] Clip Move → Move_Bike.anim
  - [ ] Clip Left → Left_Bike.anim
  - [ ] Clip Right → Right_Bike.anim
- [ ] **Create/duplicate settings asset** → Bike_001.asset
- [ ] **Configure settings**:
  - [ ] Assign animations in "Animations - Zepeto" section
  - [ ] Set hornAssetKey: "bikeHorn"
  - [ ] Adjust speed/handling values
- [ ] **Assign settings** to VehicleAttachController
- [ ] **Adjust Driver position** (Y = 0.8 typical)
- [ ] **Adjust camera positions** if needed
- [ ] **Test in Play Mode**
- [ ] **Fine-tune** based on testing

---

## Additional Resources

- **Zepeto Documentation**: Check official Zepeto docs for vehicle system
- **Vehicle Module README**: `Assets/BuilditTemplate/Modules/Vehicle/readme.md`
- **Example Prefabs**: Study existing car prefabs for reference

---

## Need Help?

Common questions:

**Q: Can I have passengers on a motorcycle?**
A: Yes, configure the `passenger` array in VehicleStateController with additional Transform positions.

**Q: How do I change the speed?**
A: Edit the `magnification` value in your settings asset. Higher = faster.

**Q: My motorcycle flips over!**
A: This is a physics issue. Check that:
- Center of mass is low
- Collider matches model shape
- Speed isn't too high for the turning rate

**Q: Can I add custom sounds?**
A: Yes! Add .wav files to `Resources/Vehicle/Audio/` and reference in settings `hornAssetKey`.

---

**Happy motorcycling! 🏍️**

For questions or issues, check the Unity Console for error messages and refer back to this guide.
