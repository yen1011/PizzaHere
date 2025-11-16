using UnityEngine;
using TMPro;

namespace PizzaDeliveryGame
{
    /// <summary>
    /// Displays floating UI text above GameObjects (motorcycles, houses, etc.)
    /// Automatically faces the camera and updates text based on events
    /// </summary>
    [RequireComponent(typeof(Canvas))]
    public class FloatingUI : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private TextMeshProUGUI textDisplay;
        [SerializeField] private GameObject bubbleContainer;

        [Header("Position Settings")]
        [SerializeField] private PositionMode positionMode = PositionMode.CustomSpawnPoint;
        [SerializeField] private Transform customSpawnPoint; // UI 스폰 포인트 (비어있으면 자동 계산)
        [SerializeField] private Vector3 offset = new Vector3(0, 4f, 0f); // 높이 offset
        [SerializeField] private float forwardOffset = 5f; // 앞으로 거리 (ObjectForward/CameraDirection 모드)

        [Header("Display Settings")]
        [SerializeField] private bool alwaysFaceCamera = true;
        [SerializeField] private bool showByDefault = true;

        [Header("UI Size Settings")]
        [SerializeField] private float uiScale = 0.02f; // Canvas 스케일 (크기 조정)
        [SerializeField] private Vector2 canvasSize = new Vector2(400, 200); // Canvas 크기

        public enum PositionMode
        {
            CustomSpawnPoint,  // 직접 지정한 Transform 위치 사용
            ObjectForward,     // 오브젝트의 앞 방향 (forward) 고정
            CameraDirection    // 카메라 방향으로 동적 이동
        }

        private Canvas canvas;
        private Camera mainCamera;
        private Transform targetTransform;

        private void Awake()
        {
            canvas = GetComponent<Canvas>();

            // Setup canvas as WorldSpace
            canvas.renderMode = RenderMode.WorldSpace;

            // Setup Canvas RectTransform
            RectTransform rectTransform = canvas.GetComponent<RectTransform>();
            if (rectTransform != null)
            {
                // Set proper scale for WorldSpace UI
                rectTransform.localScale = Vector3.one * uiScale;

                // Set size
                rectTransform.sizeDelta = canvasSize;
            }

            // Auto-create TextMeshPro if not assigned
            if (textDisplay == null)
            {
                textDisplay = GetComponentInChildren<TextMeshProUGUI>();
            }

            // Find bubble container if not assigned
            if (bubbleContainer == null)
            {
                bubbleContainer = transform.GetChild(0)?.gameObject;
            }

            SetVisible(showByDefault);
        }

        private void Start()
        {
            mainCamera = Camera.main;

            // Get the target (parent object this UI is attached to)
            if (transform.parent != null)
            {
                targetTransform = transform.parent;
            }

            // Set initial rotation to face camera
            if (alwaysFaceCamera && mainCamera != null)
            {
                transform.rotation = Quaternion.LookRotation(transform.position - mainCamera.transform.position);
            }
        }

        private void LateUpdate()
        {
            UpdatePosition();
            UpdateRotation();
        }

        private void UpdatePosition()
        {
            if (targetTransform == null)
                return;

            Vector3 finalPosition;

            switch (positionMode)
            {
                case PositionMode.CustomSpawnPoint:
                    // 커스텀 스폰 포인트 사용
                    if (customSpawnPoint != null)
                    {
                        finalPosition = customSpawnPoint.position;
                    }
                    else
                    {
                        // 스폰 포인트 없으면 기본 위치
                        finalPosition = targetTransform.position + offset;
                    }
                    break;

                case PositionMode.ObjectForward:
                    // 오브젝트 앞 방향 (forward) 고정
                    finalPosition = targetTransform.position + offset;
                    finalPosition += targetTransform.forward * forwardOffset;
                    break;

                case PositionMode.CameraDirection:
                    // 카메라 방향으로 동적 이동
                    if (mainCamera != null)
                    {
                        finalPosition = targetTransform.position + offset;

                        if (forwardOffset > 0)
                        {
                            Vector3 directionToCamera = (mainCamera.transform.position - targetTransform.position).normalized;
                            directionToCamera.y = 0; // 수평 방향만 사용
                            finalPosition += directionToCamera * forwardOffset;
                        }
                    }
                    else
                    {
                        finalPosition = targetTransform.position + offset;
                    }
                    break;

                default:
                    finalPosition = targetTransform.position + offset;
                    break;
            }

            transform.position = finalPosition;
        }

        private void UpdateRotation()
        {
            // Make UI face camera
            if (alwaysFaceCamera && mainCamera != null)
            {
                transform.rotation = Quaternion.LookRotation(transform.position - mainCamera.transform.position);
            }
        }

        /// <summary>
        /// Updates the displayed text
        /// </summary>
        public void UpdateText(string text)
        {
            if (textDisplay != null)
            {
                textDisplay.text = text;
            }
        }

        /// <summary>
        /// Shows or hides the UI bubble
        /// </summary>
        public void SetVisible(bool visible)
        {
            if (bubbleContainer != null)
            {
                bubbleContainer.SetActive(visible);
            }
            else
            {
                gameObject.SetActive(visible);
            }
        }

        /// <summary>
        /// Sets the offset from the parent object
        /// </summary>
        public void SetOffset(Vector3 newOffset)
        {
            offset = newOffset;
        }

        /// <summary>
        /// Sets the forward offset (distance in front of object toward camera)
        /// </summary>
        public void SetForwardOffset(float newForwardOffset)
        {
            forwardOffset = newForwardOffset;
        }

        /// <summary>
        /// Sets a custom target to follow (instead of parent)
        /// </summary>
        public void SetTarget(Transform target)
        {
            targetTransform = target;
        }

        /// <summary>
        /// Sets the custom spawn point for UI position
        /// </summary>
        public void SetCustomSpawnPoint(Transform spawnPoint)
        {
            customSpawnPoint = spawnPoint;
            positionMode = PositionMode.CustomSpawnPoint;
        }

        /// <summary>
        /// Sets the position mode
        /// </summary>
        public void SetPositionMode(PositionMode mode)
        {
            positionMode = mode;
        }

        /// <summary>
        /// Sets the UI scale (크기 조정)
        /// </summary>
        public void SetUIScale(float scale)
        {
            uiScale = scale;

            // Apply to canvas immediately
            RectTransform rectTransform = canvas.GetComponent<RectTransform>();
            if (rectTransform != null)
            {
                rectTransform.localScale = Vector3.one * uiScale;
            }
        }

        /// <summary>
        /// Sets the canvas size (캔버스 크기 조정)
        /// </summary>
        public void SetCanvasSize(Vector2 size)
        {
            canvasSize = size;

            // Apply to canvas immediately
            RectTransform rectTransform = canvas.GetComponent<RectTransform>();
            if (rectTransform != null)
            {
                rectTransform.sizeDelta = canvasSize;
            }
        }
    }
}
