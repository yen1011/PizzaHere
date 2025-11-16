import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { GameObject } from 'UnityEngine';
import { TextMeshProUGUI } from 'TMPro';
import { Button } from 'UnityEngine.UI';
import DeliveryManager from './DeliveryManager';
import GameTimer from './GameTimer';
import GameStartUI from './GameStartUI';
import LeaderboardManager from './LeaderboardManager';
import LeaderboardUI from './LeaderboardUI';

/**
 * Game Over Result UI
 * - Displays when the timer ends
 * - Shows delivery count and score
 * - Fetches data from DeliveryManager
 */
export default class ResultUI extends ZepetoScriptBehaviour {

    /* ===== UI Panel ===== */
    @SerializeField()
    private resultPanel: GameObject; // The entire Result panel

    /* ===== UI Text ===== */
    @SerializeField()
    private deliveryCountText: TextMeshProUGUI; // Delivery count text

    @SerializeField()
    private scoreText: TextMeshProUGUI; // Score text

    @SerializeField()
    private titleText: TextMeshProUGUI; // Title text (Optional)

    /* ===== Buttons ===== */
    @SerializeField()
    private restartButton: Button; // Restart button

    @SerializeField()
    private leaderboardButton: Button; // Leaderboard button

    /* ===== Private Variables ===== */
    private deliveryManager: DeliveryManager;
    private gameTimer: GameTimer;
    private gameStartUI: GameStartUI;
    private leaderboardManager: LeaderboardManager;
    private leaderboardUI: LeaderboardUI;

    /* ===== Unity Lifecycle ===== */
    private Start() {
        console.log('[ResultUI] Start initializing...');

        // Find DeliveryManager
        this.deliveryManager = DeliveryManager.instance;
        if (!this.deliveryManager) {
            console.error('[ResultUI] DeliveryManager not found!');
        } else {
            console.log('[ResultUI] DeliveryManager found.');
        }

        // Find GameTimer
        this.gameTimer = GameTimer.instance;
        if (!this.gameTimer) {
            console.warn('[ResultUI] GameTimer not found!');
        } else {
            console.log('[ResultUI] GameTimer found.');
        }

        // Find GameStartUI
        this.gameStartUI = GameStartUI.instance;
        if (!this.gameStartUI) {
            console.warn('[ResultUI] GameStartUI not found!');
        } else {
            console.log('[ResultUI] GameStartUI found.');
        }

        // Find LeaderboardManager
        this.leaderboardManager = LeaderboardManager.instance;
        if (!this.leaderboardManager) {
            console.warn('[ResultUI] LeaderboardManager not found!');
        } else {
            console.log('[ResultUI] LeaderboardManager found.');
        }

        // Find LeaderboardUI
        this.leaderboardUI = LeaderboardUI.instance;
        if (!this.leaderboardUI) {
            console.warn('[ResultUI] LeaderboardUI not found!');
        } else {
            console.log('[ResultUI] LeaderboardUI found.');
        }

        // Add listener for the restart button
        if (this.restartButton) {
            this.restartButton.onClick.AddListener(() => this.OnRestartButtonClicked());
            console.log('[ResultUI] Restart button event listener added.');
        } else {
            console.warn('[ResultUI] restartButton is null! Assign it in the Inspector.');
        }

        // Add listener for the leaderboard button
        if (this.leaderboardButton) {
            this.leaderboardButton.onClick.AddListener(() => this.OnLeaderboardButtonClicked());
            console.log('[ResultUI] Leaderboard button event listener added.');
        } else {
            console.warn('[ResultUI] leaderboardButton is null! Assign it in the Inspector.');
        }

        // Initial state: Hide Result panel
        this.HideResult();

        console.log('[ResultUI] Initialization complete.');
    }

    /* ===== Result UI Display ===== */

    /**
     * Show the Result panel and update data
     */
    public ShowResult(): void {
        console.log('[ResultUI] ShowResult() called!');

        if (!this.deliveryManager) {
            console.error('[ResultUI] DeliveryManager is missing!');
            return;
        }

        // Get data from DeliveryManager
        const totalDeliveries = this.deliveryManager.totalDeliveries;
        const totalScore = this.deliveryManager.score;

        console.log(`[ResultUI] Displaying Result - Deliveries: ${totalDeliveries}, Score: ${totalScore}`);

        // 모든 게임 기능 비활성화
        this.DisableGameFunctions();

        // 리더보드에 점수 제출
        this.SubmitScoreToLeaderboard(totalScore);

        // Update UI
        this.UpdateResultUI(totalDeliveries, totalScore);

        // Show Result panel
        if (this.resultPanel) {
            this.resultPanel.SetActive(true);
            console.log('[ResultUI] Result panel activated.');
        } else {
            console.error('[ResultUI] resultPanel is null! Assign it in the Inspector.');
        }
    }

    /**
     * Update Result UI text (Modified section)
     */
    private UpdateResultUI(deliveries: number, score: number): void {
        // Update delivery count text
        if (this.deliveryCountText) {
            // Changed: Added "Deliveries: " prefix
            this.deliveryCountText.text = `Deliveries: ${deliveries}`;
            console.log(`[ResultUI] Delivery count text: ${this.deliveryCountText.text}`);
        } else {
            console.warn('[ResultUI] deliveryCountText is null!');
        }

        // Update score text
        if (this.scoreText) {
            // Changed: Added "Profit: " prefix (from "수익:")
            this.scoreText.text = `Profit: ₩ ${score}`;
            console.log(`[ResultUI] Score text: ${this.scoreText.text}`);
        } else {
            console.warn('[ResultUI] scoreText is null!');
        }

        // Title text (Optional)
        if (this.titleText) {
            this.titleText.text = "Closed!";
        }
    }

    /**
     * Hide the Result panel
     */
    public HideResult(): void {
        if (this.resultPanel) {
            this.resultPanel.SetActive(false);
        }
    }

    /* ===== Public Methods ===== */

    /**
     * Check if the Result panel is visible
     */
    public IsVisible(): boolean {
        if (this.resultPanel) {
            return this.resultPanel.activeSelf;
        }
        return false;
    }

    /**
     * Called when the restart button is clicked
     */
    private OnRestartButtonClicked(): void {
        console.log('[ResultUI] Restart button clicked!');
        this.RestartGame();
    }

    /**
     * Called when the leaderboard button is clicked
     */
    private OnLeaderboardButtonClicked(): void {
        console.log('[ResultUI] Leaderboard button clicked!');

        if (this.leaderboardUI) {
            this.leaderboardUI.ShowLeaderboard();
        } else {
            console.error('[ResultUI] LeaderboardUI not found!');
        }
    }

    /**
     * Restart the game (Hide Result panel and reset game)
     */
    public RestartGame(): void {
        console.log('[ResultUI] Restarting game...');

        // Hide Result panel
        this.HideResult();

        // Reset DeliveryManager
        if (this.deliveryManager) {
            this.deliveryManager.ResetGame();
            console.log('[ResultUI] DeliveryManager reset.');
        }

        // 게임 UI 표시
        if (this.gameStartUI) {
            this.gameStartUI.ShowGameUI();
            console.log('[ResultUI] Game UI shown.');
        }

        // GameTimer 리셋 및 바로 시작
        if (this.gameTimer) {
            this.gameTimer.ResetTimer();
            this.gameTimer.StartTimer();
            console.log('[ResultUI] GameTimer reset and started immediately.');
        } else {
            console.warn('[ResultUI] GameTimer not found, cannot reset!');
        }
    }

    /**
     * 모든 게임 기능 비활성화
     */
    private DisableGameFunctions(): void {
        console.log('[ResultUI] Disabling all game functions...');

        // 모든 게임 UI 숨김
        if (this.gameStartUI) {
            this.gameStartUI.HideGameUI();
        }

        console.log('[ResultUI] All game functions disabled.');
    }

    /**
     * 리더보드에 점수 제출
     */
    private SubmitScoreToLeaderboard(score: number): void {
        if (!this.leaderboardManager) {
            console.warn('[ResultUI] LeaderboardManager not found. Score not submitted.');
            return;
        }

        console.log(`[ResultUI] Submitting score to leaderboard: ${score}`);

        this.leaderboardManager.SetScore(
            score,
            () => {
                console.log('[ResultUI] Score submitted successfully!');
            },
            (error) => {
                console.error(`[ResultUI] Failed to submit score: ${error}`);
            }
        );
    }

    /* ===== Singleton (Optional) ===== */
    private static m_instance: ResultUI = null;

    public static get instance(): ResultUI {
        if (this.m_instance === null) {
            this.m_instance = GameObject.FindObjectOfType<ResultUI>();
        }
        return this.m_instance;
    }

    private Awake() {
        // Singleton setup
        if (ResultUI.m_instance !== null && ResultUI.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            ResultUI.m_instance = this;
        }
    }

    private OnDestroy() {
        // Clean up button events
        if (this.restartButton) {
            this.restartButton.onClick.RemoveAllListeners();
        }
        if (this.leaderboardButton) {
            this.leaderboardButton.onClick.RemoveAllListeners();
        }

        // Clean up singleton instance
        if (ResultUI.m_instance === this) {
            ResultUI.m_instance = null;
        }
    }
}