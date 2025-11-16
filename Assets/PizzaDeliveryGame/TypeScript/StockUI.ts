import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Color, Coroutine, WaitForSeconds, GameObject } from 'UnityEngine';
import { TextMeshProUGUI } from 'TMPro';
import StockManager from './StockManager';

/**
 * 재고 UI 표시 스크립트
 * - StockManager의 재고 변경을 감지하여 UI 업데이트
 * - 피자, 스파게티, 콜라 개별 텍스트에 숫자만 표시
 * - 재고 부족 시 빨간색 깜빡임 효과
 */
export default class StockUI extends ZepetoScriptBehaviour {

    /* ===== UI 컨테이너 ===== */
    @SerializeField()
    private contentPanel: GameObject; // UI 전체 패널 (켜고 끄기용)

    /* ===== UI 텍스트 참조 ===== */
    @SerializeField()
    private pizzaText: TextMeshProUGUI;

    @SerializeField()
    private spaghettiText: TextMeshProUGUI;

    @SerializeField()
    private colaText: TextMeshProUGUI;

    /* ===== 재고 부족 경고 설정 ===== */
    public blinkDuration: number = 1.0;
    public blinkCount: number = 3;

    private shortageColor: Color;

    /* ===== Private 변수 ===== */
    private stockManager: StockManager;

    // 원래 텍스트 색상 저장
    private pizzaOriginalColor: Color;
    private spaghettiOriginalColor: Color;
    private colaOriginalColor: Color;

    // 깜빡임 코루틴 참조
    private blinkCoroutine: Coroutine = null;

    /* ===== Unity Lifecycle ===== */
    private Start() {
        // Color 초기화
        this.shortageColor = Color.red;

        // StockManager 찾기
        this.stockManager = StockManager.instance;

        if (!this.stockManager) {
            console.error('[StockUI] StockManager를 찾을 수 없습니다!');
            return;
        }

        // 원래 텍스트 색상 저장
        if (this.pizzaText) {
            this.pizzaOriginalColor = this.pizzaText.color;
        }
        if (this.spaghettiText) {
            this.spaghettiOriginalColor = this.spaghettiText.color;
        }
        if (this.colaText) {
            this.colaOriginalColor = this.colaText.color;
        }

        // StockManager 이벤트 구독
        this.stockManager.OnStockChanged.AddListener(() => this.UpdateStockDisplay());
        this.stockManager.OnStockShortage.AddListener(() => this.ShowStockShortageWarning());

        // 초기 UI 업데이트
        this.UpdateStockDisplay();

        console.log('[StockUI] 초기화 완료');
    }

    private OnDestroy() {
        // 이벤트 구독 해제
        if (this.stockManager) {
            this.stockManager.OnStockChanged.RemoveListener(() => this.UpdateStockDisplay());
            this.stockManager.OnStockShortage.RemoveListener(() => this.ShowStockShortageWarning());
        }
    }

    /* ===== UI 업데이트 메서드 ===== */

    /**
     * 재고 UI 업데이트 - 각 텍스트에 숫자만 표시
     */
    private UpdateStockDisplay(): void {
        if (!this.stockManager) return;

        // 피자 텍스트 업데이트
        if (this.pizzaText) {
            this.pizzaText.text = this.stockManager.pizzaCount.toString();
        }

        // 스파게티 텍스트 업데이트
        if (this.spaghettiText) {
            this.spaghettiText.text = this.stockManager.spaghettiCount.toString();
        }

        // 콜라 텍스트 업데이트
        if (this.colaText) {
            this.colaText.text = this.stockManager.colaCount.toString();
        }
    }

    /**
     * 재고 부족 경고 표시 (빨간색 깜빡임)
     */
    private ShowStockShortageWarning(): void {
        console.log('[StockUI] 재고 부족 경고 표시!');

        // 이미 깜빡이는 중이면 중단하고 재시작
        if (this.blinkCoroutine != null) {
            this.StopCoroutine(this.blinkCoroutine);
        }

        // 깜빡임 코루틴 시작
        this.blinkCoroutine = this.StartCoroutine(this.BlinkTextCoroutine());
    }

    /**
     * 텍스트 깜빡임 코루틴
     */
    private *BlinkTextCoroutine() {
        const blinkInterval = this.blinkDuration / (this.blinkCount * 2);

        for (let i = 0; i < this.blinkCount; i++) {
            // 빨간색으로 변경
            if (this.pizzaText) this.pizzaText.color = this.shortageColor;
            if (this.spaghettiText) this.spaghettiText.color = this.shortageColor;
            if (this.colaText) this.colaText.color = this.shortageColor;

            yield new WaitForSeconds(blinkInterval);

            // 원래 색상으로 복구
            if (this.pizzaText) this.pizzaText.color = this.pizzaOriginalColor;
            if (this.spaghettiText) this.spaghettiText.color = this.spaghettiOriginalColor;
            if (this.colaText) this.colaText.color = this.colaOriginalColor;

            yield new WaitForSeconds(blinkInterval);
        }

        // 깜빡임 완료 후 원래 색상 보장
        if (this.pizzaText) this.pizzaText.color = this.pizzaOriginalColor;
        if (this.spaghettiText) this.spaghettiText.color = this.spaghettiOriginalColor;
        if (this.colaText) this.colaText.color = this.colaOriginalColor;

        this.blinkCoroutine = null;
        console.log('[StockUI] 깜빡임 완료');
    }

    /* ===== Public 메서드 (외부에서 호출 가능) ===== */

    /**
     * UI를 강제로 업데이트 (필요 시 외부에서 호출)
     */
    public ForceUpdate(): void {
        this.UpdateStockDisplay();
    }

    /**
     * 특정 아이템의 텍스트 색상 변경 (강조 등에 사용 가능)
     */
    public SetTextColor(itemType: string, color: Color): void {
        switch (itemType.toLowerCase()) {
            case 'pizza':
                if (this.pizzaText) this.pizzaText.color = color;
                break;
            case 'spaghetti':
                if (this.spaghettiText) this.spaghettiText.color = color;
                break;
            case 'cola':
                if (this.colaText) this.colaText.color = color;
                break;
        }
    }

    /**
     * 모든 텍스트 색상을 원래대로 복구
     */
    public ResetTextColors(): void {
        if (this.pizzaText) this.pizzaText.color = this.pizzaOriginalColor;
        if (this.spaghettiText) this.spaghettiText.color = this.spaghettiOriginalColor;
        if (this.colaText) this.colaText.color = this.colaOriginalColor;
    }

    /**
     * UI 표시
     */
    public ShowUI(): void {
        if (this.contentPanel) {
            this.contentPanel.SetActive(true);
            console.log('[StockUI] UI 표시');
        }
    }

    /**
     * UI 숨김
     */
    public HideUI(): void {
        if (this.contentPanel) {
            this.contentPanel.SetActive(false);
            console.log('[StockUI] UI 숨김');
        }
    }

    /* ===== Singleton ===== */
    private static m_instance: StockUI = null;

    public static get instance(): StockUI {
        if (this.m_instance === null) {
            this.m_instance = GameObject.FindObjectOfType<StockUI>();
        }
        return this.m_instance;
    }

    private Awake() {
        // 싱글톤 설정
        if (StockUI.m_instance !== null && StockUI.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            StockUI.m_instance = this;
        }
    }
}
