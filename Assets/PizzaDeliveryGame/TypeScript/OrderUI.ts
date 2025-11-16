import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { GameObject } from 'UnityEngine';
import { TextMeshProUGUI } from 'TMPro';
import Order from './Order';

/**
 * 주문 UI 표시 스크립트
 * - 피자, 스파게티, 콜라 개별 텍스트에 숫자만 표시
 * - StockUI 패턴을 따름
 * - 각 배달 집의 주문 내용을 표시
 */
export default class OrderUI extends ZepetoScriptBehaviour {

    /* ===== UI 컨테이너 (켜고 끄기용) ===== */
    @SerializeField()
    private contentPanel: GameObject; // Panel이나 내용물을 담은 GameObject

    /* ===== UI 텍스트 참조 ===== */
    @SerializeField()
    private pizzaText: TextMeshProUGUI;

    @SerializeField()
    private spaghettiText: TextMeshProUGUI;

    @SerializeField()
    private colaText: TextMeshProUGUI;

    /* ===== 아이콘 또는 라벨 (선택사항) ===== */
    @SerializeField()
    private pizzaIcon: GameObject;

    @SerializeField()
    private spaghettiIcon: GameObject;

    @SerializeField()
    private colaIcon: GameObject;

    /* ===== Private 변수 ===== */
    private currentOrder: Order = null;

    /* ===== Unity Lifecycle ===== */
    private Start() {
        // 초기 상태: UI 숨김
        this.HideUI();
        console.log('[OrderUI] 초기화 완료');
    }

    /* ===== 주문 관리 메서드 ===== */

    /**
     * 주문 설정 및 UI 업데이트
     */
    public SetOrder(order: Order): void {
        console.log(`[OrderUI] SetOrder 호출됨 - ${order.GetOrderString()}`);
        this.currentOrder = order;
        this.UpdateDisplay();
        this.ShowUI();
    }

    /**
     * 주문 지우기 및 UI 숨김
     */
    public ClearOrder(): void {
        this.currentOrder = null;
        this.HideUI();
    }

    /**
     * 현재 주문 반환
     */
    public GetOrder(): Order {
        return this.currentOrder;
    }

    /* ===== UI 업데이트 메서드 ===== */

    /**
     * 주문 UI 업데이트 - 각 텍스트에 숫자만 표시
     */
    private UpdateDisplay(): void {
        if (!this.currentOrder) {
            this.ClearDisplay();
            return;
        }

        console.log('[OrderUI] UpdateDisplay 호출됨');
        console.log(`[OrderUI] 피자: ${this.currentOrder.pizzaAmount}, 스파게티: ${this.currentOrder.spaghettiAmount}, 콜라: ${this.currentOrder.colaAmount}`);

        // 피자 텍스트 업데이트
        if (this.pizzaText) {
            const pizzaAmount = this.currentOrder.pizzaAmount;
            this.pizzaText.text = pizzaAmount > 0 ? pizzaAmount.toString() : "";
            console.log(`[OrderUI] 피자 텍스트 설정: "${this.pizzaText.text}"`);
        } else {
            console.warn('[OrderUI] pizzaText가 null입니다! Inspector에서 연결하세요.');
        }

        // 스파게티 텍스트 업데이트
        if (this.spaghettiText) {
            const spaghettiAmount = this.currentOrder.spaghettiAmount;
            this.spaghettiText.text = spaghettiAmount > 0 ? spaghettiAmount.toString() : "";
            console.log(`[OrderUI] 스파게티 텍스트 설정: "${this.spaghettiText.text}"`);
        } else {
            console.warn('[OrderUI] spaghettiText가 null입니다! Inspector에서 연결하세요.');
        }

        // 콜라 텍스트 업데이트
        if (this.colaText) {
            const colaAmount = this.currentOrder.colaAmount;
            this.colaText.text = colaAmount > 0 ? colaAmount.toString() : "";
            console.log(`[OrderUI] 콜라 텍스트 설정: "${this.colaText.text}"`);
        } else {
            console.warn('[OrderUI] colaText가 null입니다! Inspector에서 연결하세요.');
        }

        // 아이콘 표시/숨김 (주문이 있는 아이템만 표시)
        this.UpdateIconVisibility();
    }

    /**
     * 아이콘 표시/숨김 업데이트
     */
    private UpdateIconVisibility(): void {
        if (!this.currentOrder) return;

        // 피자 아이콘
        if (this.pizzaIcon) {
            const shouldShow = this.currentOrder.pizzaAmount > 0;
            this.pizzaIcon.SetActive(shouldShow);
            console.log(`[OrderUI] 피자 아이콘: ${shouldShow ? 'Active' : 'Inactive'}`);
        } else {
            console.warn('[OrderUI] pizzaIcon이 null입니다!');
        }

        // 스파게티 아이콘
        if (this.spaghettiIcon) {
            const shouldShow = this.currentOrder.spaghettiAmount > 0;
            this.spaghettiIcon.SetActive(shouldShow);
            console.log(`[OrderUI] 스파게티 아이콘: ${shouldShow ? 'Active' : 'Inactive'}`);
        } else {
            console.warn('[OrderUI] spaghettiIcon이 null입니다!');
        }

        // 콜라 아이콘
        if (this.colaIcon) {
            const shouldShow = this.currentOrder.colaAmount > 0;
            this.colaIcon.SetActive(shouldShow);
            console.log(`[OrderUI] 콜라 아이콘: ${shouldShow ? 'Active' : 'Inactive'}`);
        } else {
            console.warn('[OrderUI] colaIcon이 null입니다!');
        }
    }

    /**
     * 모든 텍스트 지우기
     */
    private ClearDisplay(): void {
        if (this.pizzaText) this.pizzaText.text = "";
        if (this.spaghettiText) this.spaghettiText.text = "";
        if (this.colaText) this.colaText.text = "";

        // 모든 아이콘 숨김
        if (this.pizzaIcon) this.pizzaIcon.SetActive(false);
        if (this.spaghettiIcon) this.spaghettiIcon.SetActive(false);
        if (this.colaIcon) this.colaIcon.SetActive(false);
    }

    /**
     * UI 표시
     */
    public ShowUI(): void {
        if (this.contentPanel) {
            this.contentPanel.SetActive(true);
        }
    }

    /**
     * UI 숨김
     */
    public HideUI(): void {
        if (this.contentPanel) {
            this.contentPanel.SetActive(false);
        }
    }

    /**
     * UI가 표시 중인지 확인
     */
    public IsVisible(): boolean {
        if (this.contentPanel) {
            return this.contentPanel.activeSelf;
        }
        return false;
    }

    /* ===== Public 메서드 (외부에서 호출 가능) ===== */

    /**
     * UI를 강제로 업데이트 (필요 시 외부에서 호출)
     */
    public ForceUpdate(): void {
        this.UpdateDisplay();
    }

    /**
     * 특정 아이템의 텍스트만 업데이트
     */
    public UpdateItemText(itemType: string, amount: number): void {
        switch (itemType.toLowerCase()) {
            case 'pizza':
                if (this.pizzaText) {
                    this.pizzaText.text = amount > 0 ? amount.toString() : "";
                }
                if (this.pizzaIcon) {
                    this.pizzaIcon.SetActive(amount > 0);
                }
                break;
            case 'spaghetti':
                if (this.spaghettiText) {
                    this.spaghettiText.text = amount > 0 ? amount.toString() : "";
                }
                if (this.spaghettiIcon) {
                    this.spaghettiIcon.SetActive(amount > 0);
                }
                break;
            case 'cola':
            case 'coke':
                if (this.colaText) {
                    this.colaText.text = amount > 0 ? amount.toString() : "";
                }
                if (this.colaIcon) {
                    this.colaIcon.SetActive(amount > 0);
                }
                break;
        }
    }
}
