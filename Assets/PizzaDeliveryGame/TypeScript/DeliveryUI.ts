import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Color, Coroutine, WaitForSeconds, GameObject } from 'UnityEngine';
import { TextMeshProUGUI } from 'TMPro';
import DeliveryManager from './DeliveryManager';

/**
 * 배달 UI 표시 스크립트
 * - DeliveryManager의 점수/배달 횟수 변경을 감지하여 UI 업데이트
 * - 배달 완료 시 강조 효과
 * - StockUI 패턴을 따름
 */
export default class DeliveryUI extends ZepetoScriptBehaviour {

    /* ===== UI 컨테이너 ===== */
    @SerializeField()
    private contentPanel: GameObject; // UI 전체 패널 (켜고 끄기용)

    /* ===== UI 텍스트 참조 ===== */
    @SerializeField()
    private scoreText: TextMeshProUGUI;

    @SerializeField()
    private deliveryCountText: TextMeshProUGUI;

    /* ===== 배달 완료 효과 설정 ===== */
    public highlightDuration: number = 0.5;
    public highlightColor: Color;

    /* ===== Private 변수 ===== */
    private deliveryManager: DeliveryManager;

    // 원래 텍스트 색상 저장
    private scoreOriginalColor: Color;
    private deliveryCountOriginalColor: Color;

    // 강조 코루틴 참조
    private highlightCoroutine: Coroutine = null;

    /* ===== Unity Lifecycle ===== */
    private Start() {
        // Color 초기화
        this.highlightColor = new Color(1, 0.8, 0, 1); // 황금색

        // DeliveryManager 찾기
        this.deliveryManager = DeliveryManager.instance;

        if (!this.deliveryManager) {
            console.error('[DeliveryUI] DeliveryManager를 찾을 수 없습니다!');
            return;
        }

        // 원래 텍스트 색상 저장
        if (this.scoreText) {
            this.scoreOriginalColor = this.scoreText.color;
        }
        if (this.deliveryCountText) {
            this.deliveryCountOriginalColor = this.deliveryCountText.color;
        }

        // DeliveryManager 이벤트 구독
        this.deliveryManager.OnScoreChanged.AddListener(() => this.UpdateUI());
        this.deliveryManager.OnDeliveryCompleted.AddListener(() => this.ShowDeliveryCompletedEffect());

        // 초기 UI 업데이트
        this.UpdateUI();

        console.log('[DeliveryUI] 초기화 완료');
    }

    private OnDestroy() {
        // 이벤트 구독 해제
        if (this.deliveryManager) {
            this.deliveryManager.OnScoreChanged.RemoveListener(() => this.UpdateUI());
            this.deliveryManager.OnDeliveryCompleted.RemoveListener(() => this.ShowDeliveryCompletedEffect());
        }
    }

    /* ===== UI 업데이트 메서드 ===== */

    /**
     * UI 업데이트 - 점수와 배달 횟수 표시
     */
    private UpdateUI(): void {
        if (!this.deliveryManager) return;

        // 점수 텍스트 업데이트
        if (this.scoreText) {
            this.scoreText.text = this.deliveryManager.score.toString();
        }

        // 배달 횟수 텍스트 업데이트
        if (this.deliveryCountText) {
            this.deliveryCountText.text = this.deliveryManager.totalDeliveries.toString();
        }
    }

    /**
     * 배달 완료 효과 표시 (황금색 강조)
     */
    private ShowDeliveryCompletedEffect(): void {
        console.log('[DeliveryUI] 배달 완료 효과 표시!');

        // 이미 강조 중이면 중단하고 재시작
        if (this.highlightCoroutine != null) {
            this.StopCoroutine(this.highlightCoroutine);
        }

        // 강조 코루틴 시작
        this.highlightCoroutine = this.StartCoroutine(this.HighlightTextCoroutine());
    }

    /**
     * 텍스트 강조 코루틴
     */
    private *HighlightTextCoroutine() {
        // 황금색으로 변경
        if (this.scoreText) this.scoreText.color = this.highlightColor;
        if (this.deliveryCountText) this.deliveryCountText.color = this.highlightColor;

        yield new WaitForSeconds(this.highlightDuration);

        // 원래 색상으로 복구
        if (this.scoreText) this.scoreText.color = this.scoreOriginalColor;
        if (this.deliveryCountText) this.deliveryCountText.color = this.deliveryCountOriginalColor;

        this.highlightCoroutine = null;
        console.log('[DeliveryUI] 강조 효과 완료');
    }

    /* ===== Public 메서드 (외부에서 호출 가능) ===== */

    /**
     * UI를 강제로 업데이트 (필요 시 외부에서 호출)
     */
    public ForceUpdate(): void {
        this.UpdateUI();
    }

    /**
     * 텍스트 색상을 원래대로 복구
     */
    public ResetTextColors(): void {
        if (this.scoreText) this.scoreText.color = this.scoreOriginalColor;
        if (this.deliveryCountText) this.deliveryCountText.color = this.deliveryCountOriginalColor;
    }

    /**
     * 특정 텍스트의 색상 변경 (강조 등에 사용 가능)
     */
    public SetTextColor(textType: string, color: Color): void {
        switch (textType.toLowerCase()) {
            case 'score':
                if (this.scoreText) this.scoreText.color = color;
                break;
            case 'delivery':
            case 'deliverycount':
                if (this.deliveryCountText) this.deliveryCountText.color = color;
                break;
        }
    }

    /**
     * UI 표시
     */
    public ShowUI(): void {
        if (this.contentPanel) {
            this.contentPanel.SetActive(true);
            console.log('[DeliveryUI] UI 표시');
        }
    }

    /**
     * UI 숨김
     */
    public HideUI(): void {
        if (this.contentPanel) {
            this.contentPanel.SetActive(false);
            console.log('[DeliveryUI] UI 숨김');
        }
    }

    /* ===== Singleton ===== */
    private static m_instance: DeliveryUI = null;

    public static get instance(): DeliveryUI {
        if (this.m_instance === null) {
            this.m_instance = GameObject.FindObjectOfType<DeliveryUI>();
        }
        return this.m_instance;
    }

    private Awake() {
        // 싱글톤 설정
        if (DeliveryUI.m_instance !== null && DeliveryUI.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            DeliveryUI.m_instance = this;
        }
    }
}
