using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using UnityEditor.Presets;
using ZEPETO.Script;
using System.IO;

[CustomEditor(typeof(ActionElementLoader))]
public class ActionElementLoaderEditor : Editor {
    public Preset tempPreset;

    private GUIStyle _normalButtonStyle;
    private GUIStyle _pressedButtonStyle;
    private GUIStyle _actionElementButtonStyle;
    private GUIStyle _helpButtonStyle;
    private GUIStyle _utilButtonSytle;
    private int _currentSelectedIndex = 0;
    private TypescriptAsset _action;
    private TypescriptAsset _trigger;
    private List<KeyValuePair<string, List<TypescriptAsset>>> _actionElements = new List<KeyValuePair<string, List<TypescriptAsset>>>();


    void OnEnable() {
        string[] guids = AssetDatabase.FindAssets("t:typescriptasset");

        foreach (string guid in guids) {
            string path = AssetDatabase.GUIDToAssetPath(guid);
            TypescriptAsset asset = AssetDatabase.LoadAssetAtPath<TypescriptAsset>(path);
            // if (asset.name.Contains("AE_")) {
            //     string typeName = asset.name.Split('_')[1];
            //     if (!this.ListContainsKeyValuePair(typeName)) {
            //         var pair = new KeyValuePair<string, List<TypescriptAsset>>(typeName, new List<TypescriptAsset>());
            //         _actionElements.Add(pair);
            //     }
            //     this.GetList(typeName).Add(asset);
            // }
            //
            // if (asset.name == "Action") {
            //     this._action = asset;
            // }
            if (asset.name == "Trigger")
            {
                this._trigger = asset;
            }
        }
        Selection.selectionChanged += this.DestroySelf;

        if (this.CheckIfHasBlackListedScripts()) {
            if (EditorUtility.DisplayDialog("Interaction System", "ActionSequence 또는 Interaction 스크립트가 붙어있는 게임오브젝트에는 액션엘리먼트를 추가할 수 없습니다.", "OK")) {
                this.DestroySelf();
            }
        }
    }

    private void DestroySelf() {
        Selection.selectionChanged -= this.DestroySelf;
        GameObject.DestroyImmediate(target);
    }

    private bool ListContainsKeyValuePair(string key) {
        for (int i = 0; i < this._actionElements.Count; i++) {
            if (this._actionElements[i].Key == key) {
                return true;
            }
        }
        return false;
    }

    private List<TypescriptAsset> GetList(string key) {
        for (int i = 0; i < this._actionElements.Count; i++) {
            if (this._actionElements[i].Key == key) {
                return this._actionElements[i].Value;
            }
        }
        return null;
    }

    public override void OnInspectorGUI() {
        serializedObject.Update();

        MonoBehaviour targetGO = (MonoBehaviour)target;
        var tempColor = GUI.backgroundColor;

        // EditorGUILayout.BeginHorizontal();
        // EditorGUILayout.HelpBox("After selecting the type of action element, selecting the desired action element will add it to the object.", MessageType.Info);
        // if (this._helpButtonStyle == null) {
        //     this._helpButtonStyle = new GUIStyle(GUI.skin.label);
        //     this._helpButtonStyle.richText = true;
        // }
        // string color = EditorGUIUtility.isProSkin ? "#6f6fff" : "#0000FF";
        // string caption = string.Format("<color={0}>{1}</color>", color, "HELP : Action Element Wiki");
        //
        // if (this._utilButtonSytle == null) {
        //             this._utilButtonSytle = new GUIStyle(GUI.skin.button);
        //             this._utilButtonSytle.alignment = TextAnchor.MiddleCenter;
        //             // this._pressedButtonStyle.normal.background = Texture2D.blackTexture;
        //             this._utilButtonSytle.fontSize = 12;
        //             // this._utilButtonSytle.fixedWidth = 100;
        //             this._utilButtonSytle.fixedHeight = 38;
        //         }
        // if (GUILayout.Button("Close", this._utilButtonSytle)) {
        //     EditorUtility.SetDirty(targetGO);
        //     this.DestroySelf();
        // }
        //
        // EditorGUILayout.EndHorizontal();
        // EditorGUILayout.Space(10);
        // EditorGUILayout.BeginHorizontal();
        // EditorGUILayout.BeginVertical();
        
        
        
        
        // for (int i = 0; i < this._actionElements.Count; i++) {
        //     if (i == this._currentSelectedIndex) {
        //         if (this._pressedButtonStyle == null) {
        //             this._pressedButtonStyle = new GUIStyle(GUI.skin.button);
        //             this._pressedButtonStyle.alignment = TextAnchor.MiddleLeft;
        //             // this._pressedButtonStyle.normal.background = Texture2D.blackTexture;
        //             this._pressedButtonStyle.fixedWidth = 100;
        //             this._pressedButtonStyle.fixedHeight = 20;
        //         }
        //         GUI.backgroundColor = new Color(0.3f, 0.3f, 0.3f, 0.3f);
        //         GUILayout.Button(this._actionElements[i].Key, this._pressedButtonStyle);
        //         GUI.backgroundColor = tempColor;
        //     }
        //     else {
        //         if (this._normalButtonStyle == null) {
        //             this._normalButtonStyle = new GUIStyle(GUI.skin.button);
        //             this._normalButtonStyle.alignment = TextAnchor.MiddleLeft;
        //             this._normalButtonStyle.normal.background = this._normalButtonStyle.active.background;
        //             this._normalButtonStyle.fixedWidth = 100;
        //             this._normalButtonStyle.fixedHeight = 20;
        //         }
        //
        //         if (GUILayout.Button(this._actionElements[i].Key, this._normalButtonStyle)) {
        //             this._currentSelectedIndex = i;
        //         }
        //     }
        // }
        // EditorGUILayout.EndVertical();
        // GUI.backgroundColor = new Color(0.3f, 0.3f, 0.3f, 0.3f);
        // EditorGUILayout.BeginVertical("HelpBox");
        // var list = this.GetList(this._actionElements[this._currentSelectedIndex].Key);
        // for (int i = 0; i < list.Count; i++) {
        //     if (this._actionElementButtonStyle == null) {
        //         this._actionElementButtonStyle = new GUIStyle(GUI.skin.button);
        //         this._actionElementButtonStyle.alignment = TextAnchor.MiddleLeft;
        //         this._actionElementButtonStyle.normal.background = this._actionElementButtonStyle.active.background;
        //         this._actionElementButtonStyle.fixedWidth = 300;
        //         this._actionElementButtonStyle.fixedHeight = 20;
        //     }
        //
        //     string[] nameLines = list[i].name.Split('_');
        //     GUI.backgroundColor = tempColor;
        //     if (GUILayout.Button(nameLines[nameLines.Length - 1], this._actionElementButtonStyle)) {
        //         if (!this.CheckIfHasAction()) {
        //             var actionZepetoScript = targetGO.gameObject.AddComponent<ZepetoScriptBehaviourComponent>();
        //             this.OverridePreset(AssetDatabase.GUIDFromAssetPath(AssetDatabase.GetAssetPath(this._action)).ToString());    
        //             AssetDatabase.ImportAsset(AssetDatabase.GetAssetPath(this.tempPreset));
        //             this.tempPreset.ApplyTo(actionZepetoScript);
        //         }
        //
        //         var actionElementZepetoScript = targetGO.gameObject.AddComponent<ZepetoScriptBehaviourComponent>();
        //         this.OverridePreset(AssetDatabase.GUIDFromAssetPath(AssetDatabase.GetAssetPath(list[i])).ToString());
        //         AssetDatabase.ImportAsset(AssetDatabase.GetAssetPath(this.tempPreset));
        //         this.tempPreset.ApplyTo(actionElementZepetoScript);
        //         this.OverridePreset("65cad6f63095444ba8fce5bc0df98b52");
        //         AssetDatabase.ImportAsset(AssetDatabase.GetAssetPath(this.tempPreset));
        //         EditorUtility.SetDirty(targetGO);
        //         var targetComponent = (Component)target;
        //         UnityEditorInternal.ComponentUtility.MoveComponentDown(targetComponent);
        //     }
        // }
        // GUILayout.FlexibleSpace();
        // EditorGUILayout.EndVertical();
        // GUILayout.FlexibleSpace();
        // EditorGUILayout.EndHorizontal();
        //
        // EditorGUILayout.Space(10);
        //
        // EditorGUILayout.BeginVertical("HelpBox");
        // EditorGUILayout.BeginHorizontal();
        // if (GUILayout.Button("Delete Last Action Element", this._utilButtonSytle)) {
        //     ZepetoScriptBehaviourComponent[] componenets = targetGO.GetComponents<ZepetoScriptBehaviourComponent>();
        //     if (componenets[componenets.Length - 1].script.Name != "Action") {
        //         GameObject.DestroyImmediate(componenets[componenets.Length - 1]);
        //     }
        // }
        // if (GUILayout.Button("Delete All Action Elements", this._utilButtonSytle)) {
        //     ZepetoScriptBehaviourComponent[] componenets = targetGO.GetComponents<ZepetoScriptBehaviourComponent>();
        //     for (int i = 0; i < componenets.Length; i++) {
        //         if (componenets[i].script.Name.Contains("AE_")) {
        //             GameObject.DestroyImmediate(componenets[i]);
        //         }
        //     }
        // }
        // EditorGUILayout.EndHorizontal();
        // EditorGUILayout.EndVertical();

        // if (GUILayout.Button(caption, this._helpButtonStyle)) {
        //     Application.OpenURL("https://wiki.navercorp.com/x/_4mATw");
        // }
    }

    public void OverridePreset(string targetGUID) {
        // Load the preset asset
        StreamReader reader = new StreamReader(AssetDatabase.GetAssetPath(this.tempPreset));
        string value = reader.ReadToEnd();

        string[] lines = value.Split('\n');

        lines[62 - 1] = "    objectReference: {fileID: 4458252877524076426, guid: " + targetGUID + ", type: 3}";

        reader.Close();

        FileStream fileStream = new FileStream(AssetDatabase.GetAssetPath(this.tempPreset), FileMode.OpenOrCreate, FileAccess.Write);
        StreamWriter writer = new StreamWriter(fileStream);

        for (int i = 0; i < lines.Length - 1; i++) {
            writer.WriteLine(lines[i]);
        }

        writer.Close();
    }

    private bool CheckIfHasAction() {
        MonoBehaviour targetGO = (MonoBehaviour)target;
        ZepetoScriptBehaviourComponent[] componenets = targetGO.GetComponents<ZepetoScriptBehaviourComponent>();
        if (componenets.Length > 0) {
            for (int i = 0; i < componenets.Length; i++) {
                if (componenets[i].script != null) {
                    if (componenets[i].script.Name == "Action") {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private bool CheckIfHasBlackListedScripts()
    {
        // MonoBehaviour targetGO = (MonoBehaviour)target;
        // ZepetoScriptBehaviourComponent[] componenets = targetGO.GetComponents<ZepetoScriptBehaviourComponent>();
        // if (componenets.Length > 0) {
        //     for (int i = 0; i < componenets.Length; i++) {
        //         if (componenets[i].script != null) {
        //             if (componenets[i].script.Name == "ActionSequence" || componenets[i].script.Name == "ListInteraction" || componenets[i].script.Name == "TriggerInteraction") {
        //                 return true;
        //             }
        //         }
        //     }
        // }
        return false;
    }
}