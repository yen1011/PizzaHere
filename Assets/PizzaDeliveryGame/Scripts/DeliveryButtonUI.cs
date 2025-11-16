using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace PizzaDeliveryGame
{
    /// <summary>
    /// 모바일용 배달/재고 보충 버튼 UI (Screen Space Overlay)
    /// Mobile-friendly delivery/restock button overlay
    /// </summary>
    public class DeliveryButtonUI : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject buttonPanel;
        [SerializeField] private Button actionButton;
        [SerializeField] private TextMeshProUGUI buttonText;

        [Header("Button Text")]
        [SerializeField] private string deliveryText = "배달하기";
        [SerializeField] private string restockText = "재고 보충";

        private System.Action currentAction; // 현재 버튼이 실행할 액션

        private void Awake()
        {
            // 버튼 클릭 이벤트 연결
            if (actionButton != null)
            {
                actionButton.onClick.RemoveAllListeners();
                actionButton.onClick.AddListener(OnButtonClicked);
            }

            // 초기에는 버튼 숨김
            HideButton();
        }

        /// <summary>
        /// 배달 버튼 표시
        /// </summary>
        public void ShowDeliveryButton(System.Action deliveryAction)
        {
            if (buttonText != null)
            {
                buttonText.text = deliveryText;
            }

            currentAction = deliveryAction;
            ShowButton();
        }

        /// <summary>
        /// 재고 보충 버튼 표시
        /// </summary>
        public void ShowRestockButton(System.Action restockAction)
        {
            if (buttonText != null)
            {
                buttonText.text = restockText;
            }

            currentAction = restockAction;
            ShowButton();
        }

        /// <summary>
        /// 버튼 숨김
        /// </summary>
        public void HideButton()
        {
            if (buttonPanel != null)
            {
                buttonPanel.SetActive(false);
            }

            currentAction = null;
        }

        /// <summary>
        /// 버튼 표시
        /// </summary>
        private void ShowButton()
        {
            if (buttonPanel != null)
            {
                buttonPanel.SetActive(true);
            }
        }

        /// <summary>
        /// 버튼 클릭 시
        /// </summary>
        private void OnButtonClicked()
        {
            // 현재 액션 실행
            currentAction?.Invoke();
            Debug.Log($"DeliveryButtonUI: 버튼 클릭 - {buttonText?.text}");
        }

        /// <summary>
        /// 버튼이 현재 표시 중인지
        /// </summary>
        public bool IsVisible()
        {
            return buttonPanel != null && buttonPanel.activeSelf;
        }
    }
}
