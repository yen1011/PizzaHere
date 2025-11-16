using UnityEngine;
using TMPro; // TextMeshPro를 사용하기 위해 이 줄을 추가해야 합니다!

namespace PizzaDeliveryGame
{
    /// <summary>
    /// 화면 오버레이로 피자집 방향을 가리키는 TextMeshPro 화살표 UI
    /// </summary>
    public class PizzaPlaceDirectionArrow : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private RectTransform arrowTransform;
        [SerializeField] private TMP_Text arrowText; // Image 대신 TMP_Text 사용

        [Header("Settings")]
        [SerializeField] private float rotationOffset = 0f; // ★★★ 중요: 텍스트 화살표에 맞게 수정
        [SerializeField] private bool hideWhenClose = true;
        [SerializeField] private float hideDistance = 10f;

        [Header("Optional Color")]
        [SerializeField] private Color arrowColor = Color.white;

        private Transform playerTransform;
        private Transform pizzaPlaceTransform;
        private Camera mainCamera;

        private void Awake()
        {
            // Auto-find TextMeshPro component if not assigned
            if (arrowText == null)
            {
                arrowText = GetComponent<TMP_Text>();
            }

            // Use this transform as arrow if not assigned
            if (arrowTransform == null)
            {
                arrowTransform = GetComponent<RectTransform>();
            }

            // Set arrow color
            if (arrowText != null)
            {
                arrowText.color = arrowColor;
            }
        }

        private void Start()
        {
            mainCamera = Camera.main;

            // Find Pizza Place
            PizzaPlace pizzaPlace = FindObjectOfType<PizzaPlace>();
            if (pizzaPlace != null)
            {
                pizzaPlaceTransform = pizzaPlace.transform;
                Debug.Log($"PizzaPlaceDirectionArrow_Text: 피자집 발견 at {pizzaPlaceTransform.position}");
            }
            else
            {
                Debug.LogWarning("PizzaPlaceDirectionArrow_Text: 피자집을 찾을 수 없습니다!");
            }

            // Find Player (PlayerStock component)
            PlayerStock playerStock = FindObjectOfType<PlayerStock>();
            if (playerStock != null)
            {
                playerTransform = playerStock.transform;
                Debug.Log($"PizzaPlaceDirectionArrow_Text: 플레이어 발견");
            }
            else
            {
                Debug.LogWarning("PizzaPlaceDirectionArrow_Text: PlayerStock을 찾을 수 없습니다!");
            }
        }

        private void LateUpdate()
        {
            if (playerTransform == null || pizzaPlaceTransform == null || mainCamera == null)
                return;

            // Calculate direction from player to Pizza Place
            Vector3 direction = pizzaPlaceTransform.position - playerTransform.position;
            float distance = direction.magnitude;

            // Hide arrow if too close
            if (hideWhenClose && distance < hideDistance)
            {
                if (arrowText != null && arrowText.enabled)
                {
                    arrowText.enabled = false;
                }
                return;
            }
            else
            {
                if (arrowText != null && !arrowText.enabled)
                {
                    arrowText.enabled = true;
                }
            }

            // --- 회전 로직은 원본과 동일 ---
            Vector3 cameraForward = mainCamera.transform.forward;
            cameraForward.y = 0;
            cameraForward.Normalize();

            Vector3 cameraRight = mainCamera.transform.right;
            cameraRight.y = 0;
            cameraRight.Normalize();

            Vector3 flatDirection = direction;
            flatDirection.y = 0;
            flatDirection.Normalize();

            float angle = Mathf.Atan2(
                Vector3.Dot(flatDirection, cameraRight),
                Vector3.Dot(flatDirection, cameraForward)
            ) * Mathf.Rad2Deg;

            // Apply rotation to arrow
            if (arrowTransform != null)
            {
                arrowTransform.rotation = Quaternion.Euler(0, 0, angle + rotationOffset);
            }
        }

        // --- 보조 함수들 (Text에 맞게 수정) ---

        public void SetArrowColor(Color color)
        {
            arrowColor = color;
            if (arrowText != null)
            {
                arrowText.color = color;
            }
        }

        public void SetVisible(bool visible)
        {
            if (arrowText != null)
            {
                arrowText.enabled = visible;
            }
        }

        public void SetCustomTarget(Transform target)
        {
            pizzaPlaceTransform = target;
        }
    }
}