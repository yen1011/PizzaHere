using UnityEngine;
using UnityEngine.Events;
using TMPro;

namespace PizzaDeliveryGame
{
    /// <summary>
    /// 2분 게임 타이머 시스템
    /// 2-minute game timer system
    /// </summary>
    public class GameTimer : MonoBehaviour
    {
        [Header("Timer Settings")]
        [SerializeField] private float gameDuration = 120f; // 2분 = 120초
        [SerializeField] private bool startOnAwake = true;

        [Header("UI References")]
        [SerializeField] private TextMeshProUGUI timerText;

        [Header("Events")]
        public UnityEvent OnTimerStart;
        public UnityEvent OnTimerEnd;
        public UnityEvent OnTimerTick; // 매 초마다 호출

        // Public properties
        public float TimeRemaining => timeRemaining;
        public float GameDuration => gameDuration;
        public bool IsRunning => isRunning;
        public bool IsFinished => isFinished;

        private float timeRemaining;
        private bool isRunning = false;
        private bool isFinished = false;
        private float lastSecond;

        private void Start()
        {
            timeRemaining = gameDuration;
            lastSecond = Mathf.Ceil(timeRemaining);

            if (startOnAwake)
            {
                StartTimer();
            }
            else
            {
                UpdateTimerDisplay();
            }
        }

        private void Update()
        {
            if (!isRunning || isFinished)
                return;

            // Countdown
            timeRemaining -= Time.deltaTime;

            // Check if timer finished
            if (timeRemaining <= 0f)
            {
                timeRemaining = 0f;
                FinishTimer();
            }

            // Update display
            UpdateTimerDisplay();

            // Trigger tick event every second
            float currentSecond = Mathf.Ceil(timeRemaining);
            if (currentSecond < lastSecond)
            {
                lastSecond = currentSecond;
                OnTimerTick?.Invoke();
            }
        }

        /// <summary>
        /// 타이머 시작
        /// </summary>
        public void StartTimer()
        {
            if (isRunning)
            {
                Debug.LogWarning("GameTimer: 타이머가 이미 실행 중입니다!");
                return;
            }

            timeRemaining = gameDuration;
            lastSecond = Mathf.Ceil(timeRemaining);
            isRunning = true;
            isFinished = false;

            OnTimerStart?.Invoke();
            Debug.Log($"GameTimer: 타이머 시작! ({gameDuration}초)");
        }

        /// <summary>
        /// 타이머 일시정지
        /// </summary>
        public void PauseTimer()
        {
            isRunning = false;
            Debug.Log("GameTimer: 타이머 일시정지");
        }

        /// <summary>
        /// 타이머 재개
        /// </summary>
        public void ResumeTimer()
        {
            if (isFinished)
            {
                Debug.LogWarning("GameTimer: 종료된 타이머는 재개할 수 없습니다!");
                return;
            }

            isRunning = true;
            Debug.Log("GameTimer: 타이머 재개");
        }

        /// <summary>
        /// 타이머 리셋 (재시작)
        /// </summary>
        public void ResetTimer()
        {
            timeRemaining = gameDuration;
            lastSecond = Mathf.Ceil(timeRemaining);
            isRunning = false;
            isFinished = false;

            UpdateTimerDisplay();
            Debug.Log("GameTimer: 타이머 리셋");
        }

        /// <summary>
        /// 타이머 종료 처리
        /// </summary>
        private void FinishTimer()
        {
            isRunning = false;
            isFinished = true;

            OnTimerEnd?.Invoke();
            Debug.Log("GameTimer: 타이머 종료! 게임 끝!");
        }

        /// <summary>
        /// 타이머 UI 업데이트
        /// </summary>
        private void UpdateTimerDisplay()
        {
            if (timerText == null)
                return;

            int minutes = Mathf.FloorToInt(timeRemaining / 60f);
            int seconds = Mathf.FloorToInt(timeRemaining % 60f);

            timerText.text = $"{minutes:00}:{seconds:00}";
        }

        /// <summary>
        /// 타이머 텍스트 레퍼런스 설정
        /// </summary>
        public void SetTimerText(TextMeshProUGUI text)
        {
            timerText = text;
            UpdateTimerDisplay();
        }

        /// <summary>
        /// 남은 시간을 문자열로 반환
        /// </summary>
        public string GetTimeString()
        {
            int minutes = Mathf.FloorToInt(timeRemaining / 60f);
            int seconds = Mathf.FloorToInt(timeRemaining % 60f);
            return $"{minutes:00}:{seconds:00}";
        }
    }
}
