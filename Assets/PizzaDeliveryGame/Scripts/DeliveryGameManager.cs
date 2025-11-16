using UnityEngine;
using System.Collections.Generic;

namespace PizzaDeliveryGame
{
    /// <summary>
    /// Central manager for the Pizza Delivery Game
    /// Tracks score, deliveries, and game state
    /// </summary>
    public class DeliveryGameManager : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private PlayerStock playerStock;
        [SerializeField] private List<DeliveryHouse> deliveryHouses = new List<DeliveryHouse>();
        [SerializeField] private PizzaPlace pizzaPlace;

        [Header("Game Stats")]
        [SerializeField] private int totalDeliveries = 0;
        [SerializeField] private int score = 0;
        [SerializeField] private int pointsPerDelivery = 100;

        [Header("UI (Optional)")]
        [SerializeField] private FloatingUI playerStockUI;

        // Singleton pattern (optional)
        public static DeliveryGameManager Instance { get; private set; }

        private void Awake()
        {
            // Singleton setup
            if (Instance == null)
            {
                Instance = this;
            }
            else
            {
                Destroy(gameObject);
                return;
            }
        }

        private void Start()
        {
            InitializeGame();
        }

        /// <summary>
        /// Initializes the game and sets up references
        /// </summary>
        private void InitializeGame()
        {
            // Auto-find player stock if not assigned
            if (playerStock == null)
            {
                playerStock = FindObjectOfType<PlayerStock>();
            }

            // Auto-find pizza place if not assigned
            if (pizzaPlace == null)
            {
                pizzaPlace = FindObjectOfType<PizzaPlace>();
            }

            // Auto-find delivery houses if list is empty
            if (deliveryHouses.Count == 0)
            {
                deliveryHouses.AddRange(FindObjectsOfType<DeliveryHouse>());
            }

            // Setup event listeners
            SetupEventListeners();

            // Setup player stock UI
            if (playerStockUI != null && playerStock != null)
            {
                UpdatePlayerStockUI();
                playerStock.OnStockChanged.AddListener(UpdatePlayerStockUI);
            }

            Debug.Log($"Pizza Delivery Game initialized! Found {deliveryHouses.Count} delivery houses.");
        }

        /// <summary>
        /// Sets up event listeners for all delivery houses
        /// </summary>
        private void SetupEventListeners()
        {
            foreach (DeliveryHouse house in deliveryHouses)
            {
                if (house != null)
                {
                    house.OnOrderCompleted.AddListener(OnDeliveryCompleted);
                    house.OnOrderGenerated.AddListener(OnOrderGenerated);
                }
            }
        }

        /// <summary>
        /// Called when an order is generated at any house
        /// </summary>
        private void OnOrderGenerated(Order order)
        {
            Debug.Log($"New order generated: {order.GetOrderString()}");
            // Optional: Show notification, play sound, etc.
        }

        /// <summary>
        /// Called when a delivery is completed
        /// </summary>
        private void OnDeliveryCompleted(Order completedOrder)
        {
            totalDeliveries++;
            score += pointsPerDelivery;

            Debug.Log($"Delivery #{totalDeliveries} completed! Score: {score}");

            // Optional: Update UI, play sound, show effects, etc.
        }

        /// <summary>
        /// Updates the floating UI above the player showing current stock
        /// </summary>
        private void UpdatePlayerStockUI()
        {
            if (playerStockUI != null && playerStock != null)
            {
                playerStockUI.UpdateText(playerStock.GetStockString());
            }
        }

        /// <summary>
        /// Forces all houses to generate new orders (useful for testing)
        /// </summary>
        public void ForceGenerateAllOrders()
        {
            foreach (DeliveryHouse house in deliveryHouses)
            {
                if (house != null && !house.HasActiveOrder)
                {
                    house.ForceGenerateOrder();
                }
            }
        }

        /// <summary>
        /// Resets the game stats
        /// </summary>
        public void ResetGame()
        {
            totalDeliveries = 0;
            score = 0;

            // Cancel all active orders
            foreach (DeliveryHouse house in deliveryHouses)
            {
                if (house != null)
                {
                    house.CancelOrder();
                }
            }

            // Restock player
            if (playerStock != null)
            {
                playerStock.RestockAll();
            }

            Debug.Log("Game reset!");
        }

        // Public properties
        public int TotalDeliveries => totalDeliveries;
        public int Score => score;
        public PlayerStock PlayerStock => playerStock;
    }
}
