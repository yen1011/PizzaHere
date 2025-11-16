using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using TMPro;
using System.Collections;

namespace PizzaDeliveryGame
{
    /// <summary>
    /// 게임 종료 후 결과 화면 UI
    /// Result screen showing deliveries and earnings
    /// </summary>
    public class GameResultScreen : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject resultPanel;
        [SerializeField] private TextMeshProUGUI deliveriesText;
        [SerializeField] private TextMeshProUGUI earningsText;
        [SerializeField] private TextMeshProUGUI totalText;
        [SerializeField] private Button retryButton;

        [Header("Game Settings")]
        [SerializeField] private int moneyPerDelivery = 2000; // 한 집당 2000원

        [Header("Auto-Find References")]
        [SerializeField] private bool autoFindGameManager = true;
        [SerializeField] private bool autoFindGameTimer = true;

        private DeliveryGameManager gameManager;
        private GameTimer gameTimer;

        private void Awake()
        {
            // Hide result panel initially
            if (resultPanel != null)
            {
                resultPanel.SetActive(false);
            }

            // Setup retry button
            if (retryButton != null)
            {
                retryButton.onClick.RemoveAllListeners(); // 기존 리스너 제거
                retryButton.onClick.AddListener(OnRetryButtonClicked);
                Debug.Log("GameResultScreen: 다시하기 버튼 이벤트 연결 완료");
            }
            else
            {
                Debug.LogError("GameResultScreen: Retry Button이 설정되지 않았습니다! Inspector에서 RetryButton을 드래그해주세요!");
            }
        }

        private void Start()
        {
            // Auto-find DeliveryGameManager
            if (autoFindGameManager)
            {
                gameManager = FindObjectOfType<DeliveryGameManager>();
                if (gameManager == null)
                {
                    Debug.LogWarning("GameResultScreen: DeliveryGameManager를 찾을 수 없습니다!");
                }
            }

            // Auto-find GameTimer
            if (autoFindGameTimer)
            {
                gameTimer = FindObjectOfType<GameTimer>();
                if (gameTimer != null)
                {
                    // Subscribe to timer end event
                    gameTimer.OnTimerEnd.AddListener(ShowResults);
                    Debug.Log("GameResultScreen: GameTimer 이벤트 연결 완료");
                }
                else
                {
                    Debug.LogWarning("GameResultScreen: GameTimer를 찾을 수 없습니다!");
                }
            }
        }

        /// <summary>
        /// 결과 화면 표시
        /// </summary>
        public void ShowResults()
        {
            if (resultPanel == null)
            {
                Debug.LogError("GameResultScreen: resultPanel이 설정되지 않았습니다!");
                return;
            }

            // ⭐ 게임 일시정지 (플레이어 움직임 멈춤)
            Time.timeScale = 0f;

            // Get data from game manager
            int deliveries = 0;
            if (gameManager != null)
            {
                deliveries = gameManager.TotalDeliveries;
            }

            int earnings = deliveries * moneyPerDelivery;

            // Update UI texts
            if (deliveriesText != null)
            {
                deliveriesText.text = $"배달 완료: {deliveries}집";
            }

            if (earningsText != null)
            {
                earningsText.text = $"수입: {earnings:N0}원";
            }

            if (totalText != null)
            {
                totalText.text = $"총 수입\n{earnings:N0}원";
            }

            // Show panel
            resultPanel.SetActive(true);

            Debug.Log($"GameResultScreen: 결과 표시 - {deliveries}집 배달, {earnings}원 수입 (게임 일시정지)");
        }

        /// <summary>
        /// 결과 화면 숨김
        /// </summary>
        public void HideResults()
        {
            if (resultPanel != null)
            {
                resultPanel.SetActive(false);
            }

            // ⭐ 게임 재개
            Time.timeScale = 1f;
        }

        /// <summary>
        /// 다시 하기 버튼 클릭 시
        /// </summary>
        private void OnRetryButtonClicked()
        {
            Debug.Log("GameResultScreen: 다시 하기 버튼 클릭!");

            // ⭐ 씬 재시작 대신 게임 상태만 리셋 (제페토 Vehicle 호환)
            ResetGame();
        }

        /// <summary>
        /// 씬 재시작 (코루틴 - 안전한 방법)
        /// </summary>
        private System.Collections.IEnumerator ReloadSceneCoroutine()
        {
            Debug.Log("GameResultScreen: 씬 재시작 준비 중...");

            // ResultPanel 숨기기 (선택사항)
            if (resultPanel != null)
            {
                resultPanel.SetActive(false);
            }

            // ⭐ 게임 재개 (씬 재시작 전에 timeScale 복구)
            Time.timeScale = 1f;

            // 제페토 시스템이 완전히 정리될 때까지 충분히 대기
            // WaitForSecondsRealtime은 timeScale의 영향을 받지 않음
            yield return new WaitForSecondsRealtime(0.2f);

            // 씬 재시작
            string currentSceneName = SceneManager.GetActiveScene().name;
            SceneManager.LoadScene(currentSceneName);
            Debug.Log($"GameResultScreen: 씬 재시작 - {currentSceneName}");
        }

        /// <summary>
        /// 씬 재시작 (직접 호출 - 레거시)
        /// </summary>
        private void ReloadScene()
        {
            // ⭐ 게임 재개 (씬 재시작 전에 timeScale 복구)
            Time.timeScale = 1f;

            string currentSceneName = SceneManager.GetActiveScene().name;
            SceneManager.LoadScene(currentSceneName);
            Debug.Log($"GameResultScreen: 씬 재시작 - {currentSceneName}");
        }

        /// <summary>
        /// 게임 상태만 리셋 (씬 재시작 없이 - 제페토 호환)
        /// </summary>
        private void ResetGame()
        {
            Debug.Log("GameResultScreen: 게임 리셋 시작...");

            // ⭐ 게임 재개
            Time.timeScale = 1f;

            // Hide result screen
            HideResults();

            // Reset game manager
            if (gameManager != null)
            {
                gameManager.ResetGame();
            }

            // Reset timer
            if (gameTimer != null)
            {
                gameTimer.ResetTimer();
                gameTimer.StartTimer();
            }

            // Reset all delivery houses
            DeliveryHouse[] houses = FindObjectsOfType<DeliveryHouse>();
            foreach (DeliveryHouse house in houses)
            {
                house.GenerateOrder();
            }

            // Reset player stock
            PlayerStock playerStock = FindObjectOfType<PlayerStock>();
            if (playerStock != null)
            {
                playerStock.RestockAll();
            }

            Debug.Log("GameResultScreen: 게임 리셋 완료 - Vehicle은 그대로 유지됨 (에러 방지)");
        }

        /// <summary>
        /// GameManager 수동 설정
        /// </summary>
        public void SetGameManager(DeliveryGameManager manager)
        {
            gameManager = manager;
        }

        /// <summary>
        /// GameTimer 수동 설정
        /// </summary>
        public void SetGameTimer(GameTimer timer)
        {
            if (gameTimer != null)
            {
                gameTimer.OnTimerEnd.RemoveListener(ShowResults);
            }

            gameTimer = timer;

            if (gameTimer != null)
            {
                gameTimer.OnTimerEnd.AddListener(ShowResults);
            }
        }
    }
}
