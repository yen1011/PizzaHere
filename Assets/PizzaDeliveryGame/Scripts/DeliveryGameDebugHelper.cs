using UnityEngine;

namespace PizzaDeliveryGame
{
    /// <summary>
    /// Debug helper for testing the Pizza Delivery Game
    /// Attach to any GameObject (or DeliveryGameManager)
    /// Press keyboard shortcuts to test features quickly
    /// </summary>
    public class DeliveryGameDebugHelper : MonoBehaviour
    {
        [Header("References (Auto-find if empty)")]
        [SerializeField] private PlayerStock playerStock;
        [SerializeField] private DeliveryGameManager gameManager;

        [Header("Debug Keys")]
        [SerializeField] private KeyCode restockKey = KeyCode.R;
        [SerializeField] private KeyCode generateOrdersKey = KeyCode.G;
        [SerializeField] private KeyCode clearStockKey = KeyCode.C;
        [SerializeField] private KeyCode addStockKey = KeyCode.Plus;
        [SerializeField] private KeyCode resetGameKey = KeyCode.Backspace;

        [Header("Debug Display")]
        [SerializeField] private bool showDebugInfo = true;
        [SerializeField] private KeyCode toggleDebugKey = KeyCode.F1;

        private void Start()
        {
            // Auto-find components
            if (playerStock == null)
            {
                playerStock = FindObjectOfType<PlayerStock>();
            }

            if (gameManager == null)
            {
                gameManager = FindObjectOfType<DeliveryGameManager>();
            }

            Debug.Log("=== Pizza Delivery Debug Helper Active ===");
            Debug.Log($"Press {restockKey} to restock player");
            Debug.Log($"Press {generateOrdersKey} to generate orders at all houses");
            Debug.Log($"Press {clearStockKey} to clear player stock");
            Debug.Log($"Press {resetGameKey} to reset game");
            Debug.Log($"Press {toggleDebugKey} to toggle debug UI");
        }

        private void Update()
        {
            // Toggle debug info
            if (Input.GetKeyDown(toggleDebugKey))
            {
                showDebugInfo = !showDebugInfo;
                Debug.Log($"Debug Info: {(showDebugInfo ? "ON" : "OFF")}");
            }

            // Restock player
            if (Input.GetKeyDown(restockKey) && playerStock != null)
            {
                playerStock.RestockAll();
                Debug.Log("[DEBUG] Player restocked!");
            }

            // Generate orders at all houses
            if (Input.GetKeyDown(generateOrdersKey) && gameManager != null)
            {
                gameManager.ForceGenerateAllOrders();
                Debug.Log("[DEBUG] Generated orders at all houses!");
            }

            // Clear player stock
            if (Input.GetKeyDown(clearStockKey) && playerStock != null)
            {
                playerStock.RemoveItems(
                    playerStock.PizzaCount,
                    playerStock.SpaghettiCount,
                    playerStock.ColaCount
                );
                Debug.Log("[DEBUG] Player stock cleared!");
            }

            // Add stock (useful for testing)
            if (Input.GetKeyDown(addStockKey) && playerStock != null)
            {
                playerStock.RestockAll();
                Debug.Log("[DEBUG] Added stock!");
            }

            // Reset game
            if (Input.GetKeyDown(resetGameKey) && gameManager != null)
            {
                gameManager.ResetGame();
                Debug.Log("[DEBUG] Game reset!");
            }
        }

        private void OnGUI()
        {
            if (!showDebugInfo) return;

            // Create debug panel
            GUILayout.BeginArea(new Rect(10, 10, 300, 400));
            GUILayout.BeginVertical("box");

            GUILayout.Label("=== PIZZA DELIVERY DEBUG ===");
            GUILayout.Space(10);

            // Player Stock Info
            if (playerStock != null)
            {
                GUILayout.Label("PLAYER STOCK:");
                GUILayout.Label($"  Pizza: {playerStock.PizzaCount}/{playerStock.MaxStock}");
                GUILayout.Label($"  Spaghetti: {playerStock.SpaghettiCount}/{playerStock.MaxStock}");
                GUILayout.Label($"  Cola: {playerStock.ColaCount}/{playerStock.MaxStock}");
            }
            else
            {
                GUILayout.Label("Player Stock: NOT FOUND");
            }

            GUILayout.Space(10);

            // Game Stats
            if (gameManager != null)
            {
                GUILayout.Label("GAME STATS:");
                GUILayout.Label($"  Deliveries: {gameManager.TotalDeliveries}");
                GUILayout.Label($"  Score: {gameManager.Score}");
            }
            else
            {
                GUILayout.Label("Game Manager: NOT FOUND");
            }

            GUILayout.Space(10);

            // Debug Controls
            GUILayout.Label("DEBUG CONTROLS:");
            GUILayout.Label($"  [{restockKey}] Restock Player");
            GUILayout.Label($"  [{generateOrdersKey}] Generate Orders");
            GUILayout.Label($"  [{clearStockKey}] Clear Stock");
            GUILayout.Label($"  [{resetGameKey}] Reset Game");
            GUILayout.Label($"  [{toggleDebugKey}] Toggle This UI");

            GUILayout.EndVertical();
            GUILayout.EndArea();
        }

        /// <summary>
        /// Call this from inspector button or other scripts to test order generation
        /// </summary>
        [ContextMenu("Test Generate Random Order")]
        public void TestGenerateRandomOrder()
        {
            Order testOrder = Order.GenerateRandomOrder();
            Debug.Log($"Generated Test Order:\n{testOrder.GetOrderString()}");
        }

        /// <summary>
        /// Test order fulfillment
        /// </summary>
        [ContextMenu("Test Can Fulfill Order")]
        public void TestCanFulfillOrder()
        {
            if (playerStock == null)
            {
                Debug.LogWarning("No PlayerStock found!");
                return;
            }

            Order testOrder = Order.GenerateRandomOrder();
            bool canFulfill = playerStock.CanFulfillOrder(
                testOrder.PizzaAmount,
                testOrder.SpaghettiAmount,
                testOrder.ColaAmount
            );

            Debug.Log($"Test Order: {testOrder.GetOrderString()}");
            Debug.Log($"Current Stock: {playerStock.GetStockString()}");
            Debug.Log($"Can Fulfill: {(canFulfill ? "YES" : "NO")}");
        }
    }
}
