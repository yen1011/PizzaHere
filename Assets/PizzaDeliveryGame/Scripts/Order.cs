using UnityEngine;

namespace PizzaDeliveryGame
{
    /// <summary>
    /// Represents a delivery order with random item requirements
    /// </summary>
    [System.Serializable]
    public class Order
    {
        [SerializeField] private int pizzaAmount;
        [SerializeField] private int spaghettiAmount;
        [SerializeField] private int colaAmount;

        public int PizzaAmount => pizzaAmount;
        public int SpaghettiAmount => spaghettiAmount;
        public int ColaAmount => colaAmount;

        /// <summary>
        /// Creates an empty order
        /// </summary>
        public Order()
        {
            pizzaAmount = 0;
            spaghettiAmount = 0;
            colaAmount = 0;
        }

        /// <summary>
        /// Creates an order with specific amounts
        /// </summary>
        public Order(int pizza, int spaghetti, int cola)
        {
            pizzaAmount = pizza;
            spaghettiAmount = spaghetti;
            colaAmount = cola;
        }

        /// <summary>
        /// Generates a random order with 1-3 items, each requiring 1-3 units
        /// </summary>
        public static Order GenerateRandomOrder()
        {
            int pizza = Random.Range(0, 2) == 1 ? Random.Range(1, 4) : 0;
            int spaghetti = Random.Range(0, 2) == 1 ? Random.Range(1, 4) : 0;
            int cola = Random.Range(0, 2) == 1 ? Random.Range(1, 4) : 0;

            // Ensure at least one item is ordered
            if (pizza == 0 && spaghetti == 0 && cola == 0)
            {
                // Randomly pick one item
                int randomItem = Random.Range(0, 3);
                int amount = Random.Range(1, 4);

                switch (randomItem)
                {
                    case 0:
                        pizza = amount;
                        break;
                    case 1:
                        spaghetti = amount;
                        break;
                    case 2:
                        cola = amount;
                        break;
                }
            }

            return new Order(pizza, spaghetti, cola);
        }

        /// <summary>
        /// Gets the order as a formatted string for display
        /// </summary>
        public string GetOrderString()
        {
            string orderText = "주문:\n";

            if (pizzaAmount > 0)
                orderText += $"피자 {pizzaAmount}\n";
            if (spaghettiAmount > 0)
                orderText += $"스파게티 {spaghettiAmount}\n";
            if (colaAmount > 0)
                orderText += $"콜라 {colaAmount}\n";

            return orderText.TrimEnd('\n');
        }

        /// <summary>
        /// Checks if this is a valid order (has at least one item)
        /// </summary>
        public bool IsValid()
        {
            return pizzaAmount > 0 || spaghettiAmount > 0 || colaAmount > 0;
        }
    }
}
