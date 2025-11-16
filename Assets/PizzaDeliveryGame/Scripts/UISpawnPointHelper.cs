using UnityEngine;

namespace PizzaDeliveryGame
{
    /// <summary>
    /// UI 스폰 포인트 시각화 도우미
    /// Scene 뷰에서 스폰 포인트를 쉽게 볼 수 있도록 Gizmo를 그려줍니다
    /// </summary>
    public class UISpawnPointHelper : MonoBehaviour
    {
        [Header("Gizmo Settings")]
        [SerializeField] private Color gizmoColor = Color.yellow;
        [SerializeField] private float gizmoRadius = 0.5f;
        [SerializeField] private bool showLabel = true;

        private void OnDrawGizmos()
        {
            // 스폰 포인트 위치에 구 그리기
            Gizmos.color = gizmoColor;
            Gizmos.DrawWireSphere(transform.position, gizmoRadius);

            // 중심점 표시
            Gizmos.DrawSphere(transform.position, gizmoRadius * 0.2f);

#if UNITY_EDITOR
            // 라벨 표시
            if (showLabel)
            {
                UnityEditor.Handles.Label(transform.position + Vector3.up * 0.5f, gameObject.name);
            }
#endif
        }

        private void OnDrawGizmosSelected()
        {
            // 선택했을 때 더 큰 원 표시
            Gizmos.color = Color.green;
            Gizmos.DrawWireSphere(transform.position, gizmoRadius * 1.5f);
        }
    }
}
