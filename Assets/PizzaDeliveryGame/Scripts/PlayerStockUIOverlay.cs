using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;

namespace PizzaDeliveryGame
{
    /// <summary>
    /// 화면 오버레이로 플레이어 재고를 표시 (Screen Space Overlay)
    /// Displays player stock on screen overlay (always visible at top of screen)
    /// </summary>
    public class PlayerStockUIOverlay : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private TextMeshProUGUI pizzaText;
        [SerializeField] private TextMeshProUGUI spaghettiText;
        [SerializeField] private TextMeshProUGUI colaText;
        [SerializeField] private GameObject stockPanel;

        [Header("Auto-Find PlayerStock")]
        [SerializeField] private bool autoFindPlayerStock = true;
        [SerializeField] private PlayerStock playerStock;

        [Header("Display Settings")]
        [SerializeField] private bool showAlways = true;
        [SerializeField] private bool showOnlyWhenDriving = false;

        [Header("Shortage Highlight Settings")]
        [SerializeField] private Color shortageColor = Color.red; // 재고 부족 시 색상
        [SerializeField] private float blinkDuration = 1f; // 깜빡임 총 시간
        [SerializeField] private int blinkCount = 3; // 깜빡임 횟수

        private Color pizzaOriginalColor; // 원래 텍스트 색상
        private Color spaghettiOriginalColor;
        private Color colaOriginalColor;
        private Coroutine blinkCoroutine;

        private void Start()
        {
            // Auto-find PlayerStock
            if (autoFindPlayerStock && playerStock == null)
            {
                playerStock = FindObjectOfType<PlayerStock>();
                if (playerStock != null)
                {
                    Debug.Log("PlayerStockUIOverlay: PlayerStock 자동 연결 완료");
                }
                else
                {
                    Debug.LogWarning("PlayerStockUIOverlay: PlayerStock을 찾을 수 없습니다!");
                }
            }

            // Subscribe to stock changes
            if (playerStock != null)
            {
                playerStock.OnStockChanged.AddListener(UpdateStockDisplay);
                playerStock.OnStockShortage.AddListener(HighlightStockShortage); // ⭐ 재고 부족 이벤트 구독
                UpdateStockDisplay(); // Initial update
            }

            // Store original text colors
            if (pizzaText != null)
            {
                pizzaOriginalColor = pizzaText.color;
            }
            if (spaghettiText != null)
            {
                spaghettiOriginalColor = spaghettiText.color;
            }
            if (colaText != null)
            {
                colaOriginalColor = colaText.color;
            }

            // Show/hide panel based on settings
            if (stockPanel != null)
            {
                stockPanel.SetActive(showAlways);
            }
        }

        /// <summary>
        /// 재고 표시 업데이트
        /// </summary>
        private void UpdateStockDisplay()
        {
            if (playerStock != null)
            {
                if (pizzaText != null)
                {
                    pizzaText.text = playerStock.PizzaCount.ToString();
                }
                if (spaghettiText != null)
                {
                    spaghettiText.text = playerStock.SpaghettiCount.ToString();
                }
                if (colaText != null)
                {
                    colaText.text = playerStock.ColaCount.ToString();
                }
            }
        }

        /// <summary>
        /// UI 표시/숨김
        /// </summary>
        public void SetVisible(bool visible)
        {
            if (stockPanel != null)
            {
                stockPanel.SetActive(visible);
            }
        }

        /// <summary>
        /// PlayerStock 수동 설정
        /// </summary>
        public void SetPlayerStock(PlayerStock stock)
        {
            // Unsubscribe from old stock
            if (playerStock != null)
            {
                playerStock.OnStockChanged.RemoveListener(UpdateStockDisplay);
                playerStock.OnStockShortage.RemoveListener(HighlightStockShortage);
            }

            // Subscribe to new stock
            playerStock = stock;
            if (playerStock != null)
            {
                playerStock.OnStockChanged.AddListener(UpdateStockDisplay);
                playerStock.OnStockShortage.AddListener(HighlightStockShortage);
                UpdateStockDisplay();
            }
        }

        /// <summary>
        /// 재고 부족 시 텍스트 강조 (깜빡임)
        /// </summary>
        private void HighlightStockShortage()
        {
            Debug.Log("PlayerStockUIOverlay: HighlightStockShortage() 호출됨!");

            if (pizzaText == null && spaghettiText == null && colaText == null)
            {
                Debug.LogError("PlayerStockUIOverlay: 텍스트가 null입니다! Inspector에서 텍스트를 연결해주세요!");
                return;
            }

            Debug.Log($"PlayerStockUIOverlay: 텍스트 확인 완료. 부족 색상={shortageColor}");

            // 이미 깜빡이는 중이면 중단하고 재시작
            if (blinkCoroutine != null)
            {
                StopCoroutine(blinkCoroutine);
                Debug.Log("PlayerStockUIOverlay: 이전 깜빡임 중단");
            }

            blinkCoroutine = StartCoroutine(BlinkStockText());
            Debug.Log("PlayerStockUIOverlay: 깜빡임 코루틴 시작!");
        }

        /// <summary>
        /// 텍스트 깜빡임 코루틴
        /// </summary>
        private IEnumerator BlinkStockText()
        {
            Debug.Log("PlayerStockUIOverlay: BlinkStockText 코루틴 실행 시작");

            float blinkInterval = blinkDuration / (blinkCount * 2);
            Debug.Log($"PlayerStockUIOverlay: 깜빡임 간격={blinkInterval}초, 총 {blinkCount}번 깜빡임");

            for (int i = 0; i < blinkCount; i++)
            {
                // 재고 부족 색상으로 변경
                if (pizzaText != null) pizzaText.color = shortageColor;
                if (spaghettiText != null) spaghettiText.color = shortageColor;
                if (colaText != null) colaText.color = shortageColor;
                Debug.Log($"PlayerStockUIOverlay: 깜빡임 {i + 1}/{blinkCount} - 빨간색으로 변경");
                yield return new WaitForSeconds(blinkInterval);

                // 원래 색상으로 복구
                if (pizzaText != null) pizzaText.color = pizzaOriginalColor;
                if (spaghettiText != null) spaghettiText.color = spaghettiOriginalColor;
                if (colaText != null) colaText.color = colaOriginalColor;
                Debug.Log($"PlayerStockUIOverlay: 깜빡임 {i + 1}/{blinkCount} - 원래 색상으로 복구");
                yield return new WaitForSeconds(blinkInterval);
            }

            // 깜빡임 완료 후 원래 색상 보장
            if (pizzaText != null) pizzaText.color = pizzaOriginalColor;
            if (spaghettiText != null) spaghettiText.color = spaghettiOriginalColor;
            if (colaText != null) colaText.color = colaOriginalColor;
            blinkCoroutine = null;
            Debug.Log("PlayerStockUIOverlay: 깜빡임 완료!");
        }

        private void OnDestroy()
        {
            // Cleanup event listeners
            if (playerStock != null)
            {
                playerStock.OnStockChanged.RemoveListener(UpdateStockDisplay);
                playerStock.OnStockShortage.RemoveListener(HighlightStockShortage);
            }
        }
    }
}
