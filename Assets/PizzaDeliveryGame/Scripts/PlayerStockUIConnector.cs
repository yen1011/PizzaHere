using UnityEngine;
using TMPro; // ★★★ 중요: TextMeshPro를 쓰기 위해 이 줄을 추가합니다.

namespace PizzaDeliveryGame
{
    /// <summary>
    /// Connects PlayerStock to a TextMeshPro UI for automatic updates
    /// Attach this to the motorcycle/player GameObject alongside PlayerStock
    /// </summary>
    [RequireComponent(typeof(PlayerStock))]
    public class PlayerStockUIConnector : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private PlayerStock playerStock;

        // --- 수정된 부분 1: FloatingUI 대신 TMP_Text를 연결 ---
        [Tooltip("화면 오버레이에 표시할 재고 텍스트 (TextMeshPro)")]
        [SerializeField] private TMP_Text stockText;
        // ---------------------------------------------------

        [Header("Settings")]
        [SerializeField] private bool updateOnStart = true;

        private void Awake()
        {
            if (playerStock == null)
            {
                playerStock = GetComponent<PlayerStock>();
            }

            // --- 수정된 부분 2: FloatingUI 찾는 로직 삭제 ---
            // (이제 인스펙터에서 직접 연결할 것이므로 이 로직은 필요 없습니다)
            // if (floatingUI == null)
            // {
            //     floatingUI = GetComponentInChildren<FloatingUI>();
            // }
            // ---------------------------------------------------
        }

        private void Start()
        {
            if (playerStock != null)
            {
                playerStock.OnStockChanged.AddListener(UpdateUI);
                if (updateOnStart)
                {
                    UpdateUI();
                }
            }
            else
            {
                Debug.LogError("PlayerStockUIConnector: PlayerStock not found!");
            }

            // --- 수정된 부분 3: 경고 메시지 변경 ---
            if (stockText == null)
            {
                Debug.LogWarning("PlayerStockUIConnector: 'Stock Text'가 연결되지 않았습니다. UI가 업데이트되지 않습니다.");
            }
            // ---------------------------------------------------
        }

        private void OnDestroy()
        {
            if (playerStock != null)
            {
                playerStock.OnStockChanged.RemoveListener(UpdateUI);
            }
        }

        /// <summary>
        /// Updates the UI text with current stock information
        /// </summary>
        private void UpdateUI()
        {
            // --- 수정된 부분 4: UI 업데이트 방식 변경 ---
            if (stockText != null && playerStock != null)
            {
                // floatingUI.UpdateText() 대신, text 컴포넌트의 text 속성을 직접 변경
                stockText.text = playerStock.GetStockString();
            }
            // ---------------------------------------------------
        }
    }
}