import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { GameObject } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { TextMeshProUGUI } from 'TMPro';
import GameTimer from './GameTimer';
import DeliveryButtonUI from './DeliveryButtonUI';
import RefillButtonUI from './RefillButtonUI';
import DeliveryUI from './DeliveryUI';
import StockUI from './StockUI';

/**
 * 게임 시작 UI
 * - 게임 시작 버튼 관리
 * - 버튼 클릭 시 타이머 시작
 * - 시작 패널 숨김
 */
export default class GameStartUI extends ZepetoScriptBehaviour {

    /* ===== UI 패널 ===== */
    @SerializeField()
    private startPanel: GameObject; // 게임 시작 패널

    /* ===== 버튼 ===== */
    @SerializeField()
    private startButton: Button; // 게임 시작 버튼

    /* ===== UI 텍스트 (선택사항) ===== */
    @SerializeField()
    private titleText: TextMeshProUGUI; // 타이틀 텍스트

    @SerializeField()
    private instructionText: TextMeshProUGUI; // 설명 텍스트

    /* ===== Private 변수 ===== */
    private gameTimer: GameTimer;
    private deliveryButtonUI: DeliveryButtonUI;
    private refillButtonUI: RefillButtonUI;
    private deliveryUI: DeliveryUI;
    private stockUI: StockUI;
    private isGameStarted: boolean = false;

    /* ===== Unity Lifecycle ===== */
    private Start() {
        console.log('[GameStartUI] Start 시작...');

        // GameTimer 찾기
        this.gameTimer = GameTimer.instance;
        if (!this.gameTimer) {
            console.error('[GameStartUI] GameTimer를 찾을 수 없습니다!');
        } else {
            console.log('[GameStartUI] GameTimer 찾기 완료');
        }

        // 다른 UI들 찾기
        this.deliveryButtonUI = DeliveryButtonUI.instance;
        this.refillButtonUI = RefillButtonUI.instance;
        this.deliveryUI = DeliveryUI.instance;
        this.stockUI = StockUI.instance;

        console.log('[GameStartUI] 모든 UI 찾기 완료');

        // 게임 시작 버튼 이벤트 연결
        if (this.startButton) {
            this.startButton.onClick.AddListener(() => this.OnStartButtonClicked());
            console.log('[GameStartUI] 게임 시작 버튼 이벤트 연결 완료');
        } else {
            console.warn('[GameStartUI] startButton이 null입니다! Inspector에서 연결하세요.');
        }

        // 초기 상태: 시작 패널 표시 + 게임 UI 모두 숨김
        this.ShowStartPanel();
        this.HideAllGameUI();

        console.log('[GameStartUI] 초기화 완료');
    }

    private OnDestroy() {
        // 버튼 이벤트 정리
        if (this.startButton) {
            this.startButton.onClick.RemoveAllListeners();
        }

        // 싱글톤 인스턴스 정리
        if (GameStartUI.m_instance === this) {
            GameStartUI.m_instance = null;
        }
    }

    /* ===== 버튼 이벤트 ===== */

    /**
     * 게임 시작 버튼 클릭 시 호출
     */
    private OnStartButtonClicked(): void {
        console.log('[GameStartUI] 게임 시작 버튼 클릭!');

        if (this.isGameStarted) {
            console.warn('[GameStartUI] 게임이 이미 시작되었습니다!');
            return;
        }

        this.StartGame();
    }

    /* ===== 게임 시작 메서드 ===== */

    /**
     * 게임 시작
     */
    private StartGame(): void {
        console.log('[GameStartUI] 게임 시작!');

        // 게임 시작 플래그
        this.isGameStarted = true;

        // 시작 패널 숨김
        this.HideStartPanel();

        // 모든 게임 UI 표시
        this.ShowAllGameUI();

        // GameTimer 시작
        if (this.gameTimer) {
            this.gameTimer.StartTimer();
            console.log('[GameStartUI] GameTimer 시작 완료');
        } else {
            console.error('[GameStartUI] GameTimer가 없어서 시작할 수 없습니다!');
        }
    }

    /* ===== UI 관리 메서드 ===== */

    /**
     * 시작 패널 표시
     */
    public ShowStartPanel(): void {
        if (this.startPanel) {
            this.startPanel.SetActive(true);
            console.log('[GameStartUI] 시작 패널 표시');
        }
    }

    /**
     * 시작 패널 숨김
     */
    public HideStartPanel(): void {
        if (this.startPanel) {
            this.startPanel.SetActive(false);
            console.log('[GameStartUI] 시작 패널 숨김');
        }
    }

    /**
     * 시작 패널이 표시 중인지 확인
     */
    public IsVisible(): boolean {
        if (this.startPanel) {
            return this.startPanel.activeSelf;
        }
        return false;
    }

    /**
     * 게임이 시작되었는지 확인
     */
    public IsGameStarted(): boolean {
        return this.isGameStarted;
    }

    /**
     * 게임 리셋 (다시하기 시 사용)
     */
    public ResetGame(): void {
        console.log('[GameStartUI] 게임 리셋');

        this.isGameStarted = false;
        this.HideAllGameUI();
        this.ShowStartPanel();
    }

    /**
     * 모든 게임 UI 숨김
     */
    private HideAllGameUI(): void {
        console.log('[GameStartUI] 모든 게임 UI 숨김');

        // 배달 버튼 숨김
        if (this.deliveryButtonUI) {
            this.deliveryButtonUI.HideButton();
        }

        // 재고 보충 버튼 숨김
        if (this.refillButtonUI) {
            this.refillButtonUI.HideButton();
        }

        // DeliveryUI 숨김
        if (this.deliveryUI) {
            this.deliveryUI.HideUI();
        }

        // StockUI 숨김
        if (this.stockUI) {
            this.stockUI.HideUI();
        }

        console.log('[GameStartUI] 모든 게임 UI 숨김 완료');
    }

    /**
     * 모든 게임 UI 표시
     */
    private ShowAllGameUI(): void {
        console.log('[GameStartUI] 모든 게임 UI 표시');

        // DeliveryUI 표시
        if (this.deliveryUI) {
            this.deliveryUI.ShowUI();
        }

        // StockUI 표시
        if (this.stockUI) {
            this.stockUI.ShowUI();
        }

        // 배달/재고보충 버튼은 범위 진입 시 자동으로 표시됨

        console.log('[GameStartUI] 모든 게임 UI 표시 완료');
    }

    /**
     * 모든 게임 UI 표시 (Public - 외부에서 호출 가능)
     */
    public ShowGameUI(): void {
        this.ShowAllGameUI();
    }

    /**
     * 모든 게임 UI 숨김 (Public - 외부에서 호출 가능)
     */
    public HideGameUI(): void {
        this.HideAllGameUI();
    }

    /* ===== Singleton ===== */
    private static m_instance: GameStartUI = null;

    public static get instance(): GameStartUI {
        if (this.m_instance === null) {
            this.m_instance = GameObject.FindObjectOfType<GameStartUI>();
        }
        return this.m_instance;
    }

    private Awake() {
        // 싱글톤 설정
        if (GameStartUI.m_instance !== null && GameStartUI.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            GameStartUI.m_instance = this;
        }
    }
}
