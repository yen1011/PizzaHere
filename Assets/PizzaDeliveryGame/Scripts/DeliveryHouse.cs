using UnityEngine;
using UnityEngine.Events;

namespace PizzaDeliveryGame
{
    /// <summary>
    /// Manages delivery house orders
    /// Attach this to each house GameObject that can receive deliveries
    /// </summary>
    public class DeliveryHouse : MonoBehaviour
    {
        [Header("Order Settings")]
        [SerializeField] private bool hasActiveOrder = false;
        [SerializeField] private Order currentOrder;
        [SerializeField] private float minOrderInterval = 10f;
        [SerializeField] private float maxOrderInterval = 30f;

        [Header("Interaction Settings")]
        [SerializeField] private KeyCode deliverKey = KeyCode.E;
        [SerializeField] private float deliveryRange = 3f;
        [SerializeField] private bool autoDeliverOnEnter = false;

        [Header("UI References")]
        [SerializeField] private FloatingUI orderUI;

        [Header("Mobile Button UI")]
        [SerializeField] private bool autoFindButtonUI = false; // ⭐ 일단 비활성화
        [SerializeField] private DeliveryButtonUI deliveryButtonUI;

        [Header("Events")]
        public UnityEvent<Order> OnOrderGenerated;
        public UnityEvent<Order> OnOrderCompleted;

        private PlayerStock playerStock;
        private bool playerInRange = false;
        private float nextOrderTime;

        private void Start()
        {
            // Try to find FloatingUI if not assigned
            if (orderUI == null)
            {
                orderUI = GetComponentInChildren<FloatingUI>();
            }

            // Hide order UI initially
            if (orderUI != null)
            {
                orderUI.SetVisible(false);
            }

            // Auto-find DeliveryButtonUI
            if (autoFindButtonUI && deliveryButtonUI == null)
            {
                deliveryButtonUI = FindObjectOfType<DeliveryButtonUI>();
                if (deliveryButtonUI != null)
                {
                    Debug.Log("DeliveryHouse: DeliveryButtonUI 자동 연결 완료");
                }
            }

            // Schedule first order
            ScheduleNextOrder();
        }

        private void Update()
        {
            // Generate new order if it's time and no active order
            if (!hasActiveOrder && Time.time >= nextOrderTime)
            {
                GenerateOrder();
            }

            // Distance-based player detection (Zepeto-friendly)
            CheckPlayerDistance();

            // Check for delivery input
            if (playerInRange && hasActiveOrder && playerStock != null && Input.GetKeyDown(deliverKey))
            {
                TryDeliverOrder();
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

                // Check if player is within delivery range
                playerInRange = distance <= deliveryRange;

                // Player just entered range
                if (playerInRange && !wasInRange)
                {
                    Debug.Log($"Player entered delivery range of {gameObject.name} (Distance: {distance:F1}m)");

                    // Show delivery button if there's an active order
                    if (hasActiveOrder && deliveryButtonUI != null)
                    {
                        deliveryButtonUI.ShowDeliveryButton(TryDeliverOrder);
                        Debug.Log("DeliveryHouse: 배달 버튼 표시");
                    }

                    // Auto-deliver if enabled
                    if (autoDeliverOnEnter && hasActiveOrder)
                    {
                        TryDeliverOrder();
                    }
                }
                // Player just left range
                else if (!playerInRange && wasInRange)
                {
                    Debug.Log($"Player left delivery range of {gameObject.name}");

                    // Hide delivery button
                    if (deliveryButtonUI != null)
                    {
                        deliveryButtonUI.HideButton();
                        Debug.Log("DeliveryHouse: 배달 버튼 숨김");
                    }
                }

                // Update button visibility if player is in range
                // (in case order status changed while player was already in range)
                if (playerInRange)
                {
                    if (hasActiveOrder && deliveryButtonUI != null && !deliveryButtonUI.IsVisible())
                    {
                        deliveryButtonUI.ShowDeliveryButton(TryDeliverOrder);
                    }
                    else if (!hasActiveOrder && deliveryButtonUI != null && deliveryButtonUI.IsVisible())
                    {
                        deliveryButtonUI.HideButton();
                    }
                }
            }
        }

        /// <summary>
        /// Generates a new random order for this house
        /// </summary>
        public void GenerateOrder()
        {
            currentOrder = Order.GenerateRandomOrder();
            hasActiveOrder = true;

            // Update UI
            if (orderUI != null)
            {
                orderUI.UpdateText(currentOrder.GetOrderString());
                orderUI.SetVisible(true);
            }

            // Invoke event
            OnOrderGenerated?.Invoke(currentOrder);

            Debug.Log($"{gameObject.name} generated order: {currentOrder.GetOrderString()}");
        }

        /// <summary>
        /// Attempts to deliver the current order
        /// </summary>
        public void TryDeliverOrder()
        {
            if (!hasActiveOrder || playerStock == null)
            {
                return;
            }

            // Try to remove items from player stock
            // RemoveItems() will internally check if player has enough items
            // and trigger OnStockShortage event if not enough
            bool success = playerStock.RemoveItems(
                currentOrder.PizzaAmount,
                currentOrder.SpaghettiAmount,
                currentOrder.ColaAmount
            );

            if (success)
            {
                // Order completed!
                CompleteOrder();
            }
            else
            {
                Debug.Log("Player doesn't have enough items to fulfill this order!");
                // OnStockShortage event is already triggered in PlayerStock.RemoveItems()
            }
        }

        /// <summary>
        /// Completes the current order
        /// </summary>
        private void CompleteOrder()
        {
            Debug.Log($"Order delivered to {gameObject.name}!");

            // Invoke event
            OnOrderCompleted?.Invoke(currentOrder);

            // Clear order
            hasActiveOrder = false;
            currentOrder = null;

            // Hide UI
            if (orderUI != null)
            {
                orderUI.SetVisible(false);
            }

            // Schedule next order
            ScheduleNextOrder();

            // Optional: Play completion effect, sound, give points, etc.
        }

        /// <summary>
        /// Schedules when the next order should be generated
        /// </summary>
        private void ScheduleNextOrder()
        {
            float interval = Random.Range(minOrderInterval, maxOrderInterval);
            nextOrderTime = Time.time + interval;

            Debug.Log($"{gameObject.name} will generate next order in {interval:F1} seconds");
        }

        /// <summary>
        /// Manually trigger order generation (useful for testing)
        /// </summary>
        public void ForceGenerateOrder()
        {
            if (!hasActiveOrder)
            {
                GenerateOrder();
            }
        }

        /// <summary>
        /// Cancel current order
        /// </summary>
        public void CancelOrder()
        {
            if (hasActiveOrder)
            {
                hasActiveOrder = false;
                currentOrder = null;

                if (orderUI != null)
                {
                    orderUI.SetVisible(false);
                }

                ScheduleNextOrder();
            }
        }

        // Public properties
        public bool HasActiveOrder => hasActiveOrder;
        public Order CurrentOrder => currentOrder;

        private void OnDrawGizmosSelected()
        {
            // Visualize delivery range in editor
            Gizmos.color = hasActiveOrder ? Color.yellow : Color.gray;
            Gizmos.DrawWireSphere(transform.position, deliveryRange);
        }
    }
}
