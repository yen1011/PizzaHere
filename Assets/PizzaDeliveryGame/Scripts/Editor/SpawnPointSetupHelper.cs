using UnityEngine;
using UnityEditor;

namespace PizzaDeliveryGame.Editor
{
    /// <summary>
    /// 여러 집에 스폰 포인트를 빠르게 추가하는 에디터 도구
    /// 사용법: Hierarchy에서 집들 선택 → 우클릭 → Pizza Delivery → Add Spawn Points
    /// </summary>
    public class SpawnPointSetupHelper
    {
        [MenuItem("GameObject/Pizza Delivery/Add Spawn Points to Selected Houses", false, 0)]
        private static void AddSpawnPointsToSelected()
        {
            if (Selection.gameObjects.Length == 0)
            {
                EditorUtility.DisplayDialog("알림", "집 오브젝트를 선택해주세요!", "확인");
                return;
            }

            int count = 0;

            foreach (GameObject house in Selection.gameObjects)
            {
                // 이미 스폰 포인트가 있는지 확인
                Transform existingSpawnPoint = house.transform.Find("OrderUISpawnPoint");
                if (existingSpawnPoint != null)
                {
                    Debug.LogWarning($"{house.name}에 이미 OrderUISpawnPoint가 있습니다. 건너뜁니다.");
                    continue;
                }

                // 스폰 포인트 생성
                GameObject spawnPoint = new GameObject("OrderUISpawnPoint");
                spawnPoint.transform.SetParent(house.transform);
                spawnPoint.transform.localPosition = new Vector3(0, 5, 3); // 기본 위치
                spawnPoint.transform.localRotation = Quaternion.identity;

                // UISpawnPointHelper 추가
                spawnPoint.AddComponent<UISpawnPointHelper>();

                // FloatingUI 찾아서 연결
                FloatingUI floatingUI = house.GetComponentInChildren<FloatingUI>();
                if (floatingUI != null)
                {
                    floatingUI.SetCustomSpawnPoint(spawnPoint.transform);
                    Debug.Log($"{house.name}에 스폰 포인트 추가 및 FloatingUI 연결 완료!");
                }
                else
                {
                    Debug.LogWarning($"{house.name}에 FloatingUI를 찾을 수 없습니다. 수동으로 연결해주세요.");
                }

                count++;
            }

            EditorUtility.DisplayDialog("완료", $"{count}개 집에 스폰 포인트가 추가되었습니다!", "확인");
        }

        [MenuItem("GameObject/Pizza Delivery/Add Spawn Points to Selected Houses", true)]
        private static bool ValidateAddSpawnPoints()
        {
            return Selection.gameObjects.Length > 0;
        }

        [MenuItem("GameObject/Pizza Delivery/Set All Spawn Points Height to 5", false, 1)]
        private static void SetSpawnPointHeight5()
        {
            SetSpawnPointHeight(5f);
        }

        [MenuItem("GameObject/Pizza Delivery/Set All Spawn Points Height to 7", false, 2)]
        private static void SetSpawnPointHeight7()
        {
            SetSpawnPointHeight(7f);
        }

        private static void SetSpawnPointHeight(float height)
        {
            if (Selection.gameObjects.Length == 0)
            {
                EditorUtility.DisplayDialog("알림", "스폰 포인트를 선택해주세요!", "확인");
                return;
            }

            int count = 0;

            foreach (GameObject obj in Selection.gameObjects)
            {
                if (obj.name.Contains("SpawnPoint") || obj.GetComponent<UISpawnPointHelper>() != null)
                {
                    Vector3 pos = obj.transform.localPosition;
                    pos.y = height;
                    obj.transform.localPosition = pos;
                    count++;
                }
            }

            if (count > 0)
            {
                Debug.Log($"{count}개 스폰 포인트의 높이를 {height}로 조정했습니다!");
            }
            else
            {
                EditorUtility.DisplayDialog("알림", "선택된 오브젝트 중 스폰 포인트가 없습니다.", "확인");
            }
        }

        [MenuItem("GameObject/Pizza Delivery/Set All Spawn Points Height to 5", true)]
        [MenuItem("GameObject/Pizza Delivery/Set All Spawn Points Height to 7", true)]
        private static bool ValidateAdjustHeight()
        {
            return Selection.gameObjects.Length > 0;
        }
    }
}
