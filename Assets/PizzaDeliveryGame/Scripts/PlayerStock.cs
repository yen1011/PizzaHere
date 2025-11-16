using UnityEngine;
using UnityEngine.Events;

namespace PizzaDeliveryGame
{
    /// <summary>
    /// Manages the player's inventory of deliverable items
    /// Attach this to the motorcycle/player GameObject
    /// </summary>
    public class PlayerStock : MonoBehaviour
    {
        [Header("Stock Settings")]
        [SerializeField] private int maxStock = 10;

        [Header("Current Stock")]
        [SerializeField] private int pizzaCount = 10;
        [SerializeField] private int spaghettiCount = 10;
        [SerializeField] private int colaCount = 10;

        [Header("Events")]
        public UnityEvent OnStockChanged;
        public UnityEvent OnStockShortage; // 재고 부족 시 발생

        // Properties for easy access
        public int PizzaCount => pizzaCount;
        public int SpaghettiCount => spaghettiCount;
        public int ColaCount => colaCount;
        public int MaxStock => maxStock;

        private void Start()
        {
            // Initialize stock if event listeners exist
            OnStockChanged?.Invoke();
        }

        /// <summary>
        /// Restocks all items to maximum capacity
        /// </summary>
        public void RestockAll()
        {
            pizzaCount = maxStock;
            spaghettiCount = maxStock;
            colaCount = maxStock;

            OnStockChanged?.Invoke();
            Debug.Log($"Restocked all items to {maxStock}");
        }

        /// <summary>
        /// Checks if the player has enough items to fulfill an order
        /// </summary>
        public bool CanFulfillOrder(int pizzaNeeded, int spaghettiNeeded, int colaNeeded)
        {
            return pizzaCount >= pizzaNeeded &&
                   spaghettiCount >= spaghettiNeeded &&
                   colaCount >= colaNeeded;
        }

        /// <summary>
        /// Removes items from stock (called when delivering an order)
        /// </summary>
        public bool RemoveItems(int pizzaAmount, int spaghettiAmount, int colaAmount)
        {
            if (!CanFulfillOrder(pizzaAmount, spaghettiAmount, colaAmount))
            {
                Debug.LogWarning("Not enough items in stock!");

                // ⭐ 재고 부족 이벤트 발생 (UI 강조)
                OnStockShortage?.Invoke();

                return false;
            }

            pizzaCount -= pizzaAmount;
            spaghettiCount -= spaghettiAmount;
            colaCount -= colaAmount;

            OnStockChanged?.Invoke();
            Debug.Log($"Removed items. Remaining: Pizza={pizzaCount}, Spaghetti={spaghettiCount}, Cola={colaCount}");
            return true;
        }

        /// <summary>
        /// Gets the current stock as a formatted string
        /// </summary>
        public string GetStockString()
        {
            return $"피자 {pizzaCount}  스파게티 {spaghettiCount}  콜라 {colaCount}";
        }
    }
}
