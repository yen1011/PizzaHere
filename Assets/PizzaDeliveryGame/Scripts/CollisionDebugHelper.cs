using UnityEngine;

namespace PizzaDeliveryGame
{
    /// <summary>
    /// 충돌 감지 디버깅 헬퍼
    /// 오토바이나 집에 이 스크립트를 추가해서 충돌이 제대로 감지되는지 확인
    /// </summary>
    public class CollisionDebugHelper : MonoBehaviour
    {
        [Header("디버그 설정")]
        [SerializeField] private bool showDebugLogs = true;
        [SerializeField] private bool showGizmos = true;
        [SerializeField] private Color gizmoColor = Color.red;

        private void OnCollisionEnter(Collision collision)
        {
            if (showDebugLogs)
            {
                Debug.Log($"[충돌 시작] {gameObject.name} <-> {collision.gameObject.name}");
                Debug.Log($"  - 충돌 지점 개수: {collision.contactCount}");
                Debug.Log($"  - 상대방 레이어: {LayerMask.LayerToName(collision.gameObject.layer)}");
                Debug.Log($"  - 상대방 태그: {collision.gameObject.tag}");

                // PlayerStock 확인
                PlayerStock stock = collision.collider.GetComponent<PlayerStock>();
                if (stock != null)
                {
                    Debug.Log($"  ✅ PlayerStock 발견! (Pizza: {stock.PizzaCount}, Spaghetti: {stock.SpaghettiCount}, Cola: {stock.ColaCount})");
                }
                else
                {
                    Debug.LogWarning($"  ❌ PlayerStock 없음!");
                }

                // Rigidbody 확인
                Rigidbody rb = collision.rigidbody;
                if (rb != null)
                {
                    Debug.Log($"  - Rigidbody: IsKinematic={rb.isKinematic}, Mass={rb.mass}");
                }
            }
        }

        private void OnCollisionStay(Collision collision)
        {
            // 매 프레임마다 로그를 찍으면 너무 많으니 조건부로
            if (showDebugLogs && Time.frameCount % 60 == 0) // 1초에 한 번 정도
            {
                Debug.Log($"[충돌 유지 중] {gameObject.name} <-> {collision.gameObject.name}");
            }
        }

        private void OnCollisionExit(Collision collision)
        {
            if (showDebugLogs)
            {
                Debug.Log($"[충돌 종료] {gameObject.name} <-> {collision.gameObject.name}");
            }
        }

        private void OnDrawGizmos()
        {
            if (showGizmos)
            {
                Gizmos.color = gizmoColor;

                // 콜라이더 시각화
                Collider col = GetComponent<Collider>();
                if (col != null)
                {
                    Gizmos.DrawWireCube(col.bounds.center, col.bounds.size);
                }
            }
        }

        private void OnGUI()
        {
            if (showDebugLogs)
            {
                GUILayout.BeginArea(new Rect(10, 200, 400, 300));
                GUILayout.BeginVertical("box");

                GUILayout.Label($"=== {gameObject.name} 디버그 정보 ===");

                // Collider 정보
                Collider col = GetComponent<Collider>();
                if (col != null)
                {
                    GUILayout.Label($"Collider: {col.GetType().Name}");
                    GUILayout.Label($"  Is Trigger: {col.isTrigger}");
                    GUILayout.Label($"  Enabled: {col.enabled}");
                }
                else
                {
                    GUILayout.Label("❌ Collider 없음!");
                }

                // Rigidbody 정보
                Rigidbody rb = GetComponent<Rigidbody>();
                if (rb != null)
                {
                    GUILayout.Label($"Rigidbody: {rb.GetType().Name}");
                    GUILayout.Label($"  Is Kinematic: {rb.isKinematic}");
                    GUILayout.Label($"  Use Gravity: {rb.useGravity}");
                    GUILayout.Label($"  Mass: {rb.mass}");
                }
                else
                {
                    GUILayout.Label("❌ Rigidbody 없음!");
                }

                // PlayerStock 정보
                PlayerStock stock = GetComponent<PlayerStock>();
                if (stock != null)
                {
                    GUILayout.Label($"PlayerStock:");
                    GUILayout.Label($"  Pizza: {stock.PizzaCount}");
                    GUILayout.Label($"  Spaghetti: {stock.SpaghettiCount}");
                    GUILayout.Label($"  Cola: {stock.ColaCount}");
                }

                // DeliveryHouse 정보
                DeliveryHouse house = GetComponent<DeliveryHouse>();
                if (house != null)
                {
                    GUILayout.Label($"DeliveryHouse:");
                    GUILayout.Label($"  Has Order: {house.HasActiveOrder}");
                    if (house.HasActiveOrder && house.CurrentOrder != null)
                    {
                        GUILayout.Label($"  Order: {house.CurrentOrder.GetOrderString()}");
                    }
                }

                // PizzaPlace 정보
                PizzaPlace place = GetComponent<PizzaPlace>();
                if (place != null)
                {
                    GUILayout.Label($"PizzaPlace 활성");
                }

                GUILayout.EndVertical();
                GUILayout.EndArea();
            }
        }
    }
}
