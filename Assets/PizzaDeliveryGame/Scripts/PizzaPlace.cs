using UnityEngine;

namespace PizzaDeliveryGame
{
    /// <summary>
    /// Pizza Place restocking location
    /// Attach this to the pickup location GameObject
    /// Restocks player inventory when they interact
    /// </summary>
    public class PizzaPlace : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private KeyCode interactKey = KeyCode.E;
        [SerializeField] private float interactionRange = 3f;
        [SerializeField] private bool autoRestockOnEnter = false;

        [Header("UI (Optional)")]
        [SerializeField] private FloatingUI floatingUI;
        [SerializeField] private string promptText = "Press E to Restock";

        [Header("Mobile Button UI")]
        [SerializeField] private bool autoFindButtonUI = false; // ⭐ 일단 비활성화
        [SerializeField] private DeliveryButtonUI deliveryButtonUI;

        private PlayerStock playerStock;
        private bool playerInRange = false;

        private void Start()
        {
            // Try to find FloatingUI if not assigned
            if (floatingUI == null)
            {
                floatingUI = GetComponentInChildren<FloatingUI>();
            }

            // Update UI
            if (floatingUI != null)
            {
                floatingUI.UpdateText(promptText);
                floatingUI.SetVisible(false);
            }

            // Auto-find DeliveryButtonUI
            if (autoFindButtonUI && deliveryButtonUI == null)
            {
                deliveryButtonUI = FindObjectOfType<DeliveryButtonUI>();
                if (deliveryButtonUI != null)
                {
                    Debug.Log("PizzaPlace: DeliveryButtonUI 자동 연결 완료");
                }
            }
        }

        private void Update()
        {
            // Distance-based player detection (Zepeto-friendly)
            CheckPlayerDistance();

            // Check for player interaction
            if (playerInRange && playerStock != null && Input.GetKeyDown(interactKey))
            {
                RestockPlayer();
            }
        }

        /// <summary>
        /// Checks distance to player instead of using collision (Zepeto-compatible)
        /// </summary>
        private void CheckPlayerDistance()
        {
            // Find player if not cached
            if (playerStock == null)
            {
                playerStock = FindObjectOfType<PlayerStock>();
            }

            if (playerStock != null)
            {
                float distance = Vector3.Distance(transform.position, playerStock.transform.position);
                bool wasInRange = playerInRange;

                // Check if player is within interaction range
                playerInRange = distance <= interactionRange;

                // Player just entered range
                if (playerInRange && !wasInRange)
                {
                    Debug.Log($"Player entered Pizza Place (Distance: {distance:F1}m)");

                    // Show UI prompt
                    if (floatingUI != null)
                    {
                        floatingUI.SetVisible(true);
                    }

                    // Show restock button
                    if (deliveryButtonUI != null)
                    {
                        deliveryButtonUI.ShowRestockButton(RestockPlayer);
                        Debug.Log("PizzaPlace: 재고 보충 버튼 표시");
                    }

                    // Auto-restock if enabled
                    if (autoRestockOnEnter)
                    {
                        RestockPlayer();
                    }
                }
                // Player just left range
                else if (!playerInRange && wasInRange)
                {
                    Debug.Log("Player left Pizza Place");

                    // Hide UI prompt
                    if (floatingUI != null)
                    {
                        floatingUI.SetVisible(false);
                    }

                    // Hide restock button
                    if (deliveryButtonUI != null)
                    {
                        deliveryButtonUI.HideButton();
                        Debug.Log("PizzaPlace: 재고 보충 버튼 숨김");
                    }
                }
            }
        }

        /// <summary>
        /// Restocks the player's inventory to maximum
        /// </summary>
        private void RestockPlayer()
        {
            if (playerStock != null)
            {
                playerStock.RestockAll();
                Debug.Log("Player restocked at Pizza Place!");

                // Optional: Play sound effect or animation here
            }
        }

        /// <summary>
        /// Manually trigger a restock (can be called from UI button or other scripts)
        /// </summary>
        public void TriggerRestock()
        {
            if (playerStock != null)
            {
                RestockPlayer();
            }
        }

        private void OnDrawGizmosSelected()
        {
            // Visualize interaction range in editor
            Gizmos.color = Color.green;
            Gizmos.DrawWireSphere(transform.position, interactionRange);
        }
    }
}
