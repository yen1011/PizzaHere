# Motorcycle Conversion - Quick Reference Card

## 🏍️ 5-Minute Conversion Guide

### Quick Steps:

1. **Duplicate Car Prefab**
   ```
   Assets/BuilditTemplate/Prefabs/ZepetoAssets_Vehicle/vehicle_car_001.prefab
   → Duplicate → Rename: vehicle_motorcycle_001.prefab
   ```

2. **Replace Model (in Prefab Mode)**
   ```
   - Delete: Body > VE_Car_001
   - Add: Body > VE_Bike_001.FBX
   - Reset Transform: (0, 0, 0)
   ```

3. **Update Animations**
   ```
   VehicleStateController Component:
   - Clip Move: → Move_Bike.anim
   - Clip Left: → Left_Bike.anim
   - Clip Right: → Right_Bike.anim
   ```

4. **Create Settings Asset**
   ```
   Duplicate: Settings/Car_001.asset
   Rename: Settings/Bike_001.asset

   In Bike_001.asset:
   - run_zepeto: → Move_Bike.anim
   - run_left_zepeto: → Left_Bike.anim
   - run_right_zepeto: → Right_Bike.anim
   - hornAssetKey: "bikeHorn"
   ```

5. **Link Settings to Prefab**
   ```
   VehicleAttachController Component:
   - Vehicle Settings: → Bike_001.asset
   ```

6. **Test!**

---

## 📁 Asset Locations

| Asset Type | Location |
|------------|----------|
| **Bike Models** | `Themes/ZepetoAsset_Vehicle/Models/VE_Bike_00X.FBX` |
| **Bike Animations** | `Themes/ZepetoAsset_Vehicle/Animations/Bike/*.anim` |
| **Bike Horn Sound** | `Themes/ZepetoAsset_Vehicle/Resources/Vehicle/Audio/bikeHorn.wav` |
| **Vehicle Prefabs** | `BuilditTemplate/Prefabs/ZepetoAssets_Vehicle/*.prefab` |
| **Settings Assets** | `Themes/ZepetoAsset_Vehicle/Settings/*.asset` |

---

## 🎮 Key Components

### VehicleStateController.ts

| Field | What to Set | Example |
|-------|-------------|---------|
| **body** | Body GameObject | → Body |
| **animator** | Model animator (if any) | → (usually empty for bikes) |
| **clipMove** | Forward animation | → Move_Bike.anim |
| **clipLeft** | Left turn animation | → Left_Bike.anim |
| **clipRight** | Right turn animation | → Right_Bike.anim |
| **driver** | Where character sits | → Positions/Driver |
| **exitPoints** | Where character exits | → Exits/Exit_1 |

### VehicleObjectSettings (in .asset file)

| Field | Motorcycle Value | Notes |
|-------|------------------|-------|
| **run_zepeto** | Move_Bike.anim | Character riding forward |
| **run_left_zepeto** | Left_Bike.anim | Character leaning left |
| **run_right_zepeto** | Right_Bike.anim | Character leaning right |
| **hornAssetKey** | "bikeHorn" | Sound file name |
| **rotateAnglePerFrame** | 3.0 | Steering (higher = sharper) |
| **accSpeedPerFrame** | 0.1 | Acceleration |
| **magnification** | 2.0 | Top speed multiplier |
| **characterHeight** | 1.0 | Character capsule height |

---

## ⚙️ Common Adjustments

### Character Sitting Too High/Low?
```
Positions > Driver > Transform
- Adjust Y value (try 0.6 - 1.0)
```

### Motorcycle Too Slow?
```
Settings Asset:
- Increase magnification (try 2.0 - 2.5)
- Increase accSpeedPerFrame (try 0.1 - 0.15)
```

### Camera Clipping Through Model?
```
cameraTPS Transform:
- Move Y up (try 2.5)
- Move Z back (try -5.0)
```

### Character Facing Wrong Direction?
```
Positions > Driver > Rotation
- Set Y to 0 (or 180 if backwards)
```

---

## 🔧 Inspector Settings Snapshot

### VehicleStateController Component
```
Animations:
  Clip Move: [Move_Bike]
  Clip Left: [Left_Bike]
  Clip Right: [Right_Bike]

Functional Anchor Points:
  Driver: [Positions/Driver]
  Passenger: Size = 0
  Exit Points: Size = 1
    Element 0: [Exit_1]
  Camera FPS: [cameraFPS]
  Camera TPS: [cameraTPS]

Model:
  Animator Controller: [Vehicle_AnimatorController]
  Body: [Body]
  Animator: None
```

### VehicleAttachController Component
```
Vehicle Settings: [Bike_001]
Is Attached: false
Destroy On Leave: false (or true for temporary bikes)
```

---

## 📊 Recommended Settings Comparison

| Setting | Car | Motorcycle |
|---------|-----|------------|
| rotateAnglePerFrame | 2.0 | 3.0 |
| accSpeedPerFrame | 0.07 | 0.1 |
| magnification | 1.5 | 2.0 |
| backMagnification | -0.5 | -0.7 |
| boostMagnification | 1.5 | 2.0 |
| Driver Y Position | 0.5 | 0.8 |

---

## 🚨 Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Can't get on | Add trigger collider to root |
| Wrong animation | Check both Settings asset AND VehicleStateController |
| Character floats | Lower Driver Y position |
| Character sinks | Raise Driver Y position |
| No horn sound | Set hornAssetKey = "bikeHorn", isHorn = true |
| Too slow | Increase magnification in settings |
| Turns too slow | Increase rotateAnglePerFrame |
| Camera weird | Adjust cameraTPS position (Y:2.5, Z:-5) |

---

## 🎯 Testing Checklist

After conversion, verify:

- [ ] Prefab opens without errors
- [ ] All references assigned (no "Missing" or "None")
- [ ] Driver position looks correct in Scene view
- [ ] Camera positions look reasonable
- [ ] Settings asset assigned to VehicleAttachController
- [ ] All 3 animations assigned (Move, Left, Right)

In Play Mode:
- [ ] Can interact with motorcycle
- [ ] Character sits on bike properly
- [ ] Can drive forward/backward
- [ ] Can turn left/right smoothly
- [ ] Character plays correct animations
- [ ] Camera follows properly
- [ ] Can get off motorcycle
- [ ] No console errors

---

## 🎨 Available Bike Models

Use any of these in your prefab:

1. **VE_Bike_001.FBX** - Standard motorcycle (recommended for first try)
2. **VE_Bike_002.FBX** - Sport bike variant
3. **VE_Bike_003.FBX** - Classic/cruiser style

Just swap the model in Body GameObject!

---

## 💡 Pro Tips

1. **Always duplicate** the original prefab before modifying
2. **Test frequently** - make small changes and test
3. **Use existing car settings** as reference for values
4. **Check Console** for errors if something doesn't work
5. **Driver Y position** is the most common thing to adjust
6. **Camera positions** may need tweaking per model

---

## 📝 Minimum Required Changes

To convert car → motorcycle, you MUST change:

1. ✅ 3D model (Body child)
2. ✅ 3 animation clips (Move, Left, Right)
3. ✅ Settings asset animations (run_zepeto, run_left_zepeto, run_right_zepeto)

Everything else is optional tuning!

---

## 🔗 Related Files

- **Full Guide**: `CAR_TO_MOTORCYCLE_CONVERSION_GUIDE.md` (same folder)
- **Vehicle System Docs**: `readme.md` (same folder)
- **Script Source**: `Scripts/VehicleStateController.ts`

---

**Quick Start:** Duplicate car prefab → Replace model → Update animations → Test!

That's it! 🏍️
