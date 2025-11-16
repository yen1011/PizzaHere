import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { GameObject } from 'UnityEngine';
import { UnityEvent } from 'UnityEngine.Events';

/**
 * 플레이어 재고 관리 시스템 (1인 게임용)
 * - 피자, 스파게티, 콜라 재고 관리
 * - UI 업데이트 이벤트 제공
 * - 재고 보충/소진 기능
 */
export default class StockManager extends ZepetoScriptBehaviour {

    /* ===== 재고 설정 ===== */
    public maxStock: number = 10;

    // 현재 재고량 (private으로 관리)
    private _pizzaCount: number = 10;
    private _spaghettiCount: number = 10;
    private _colaCount: number = 10;

    /* ===== 이벤트 ===== */
    private _onStockChanged: UnityEvent;
    public get OnStockChanged(): UnityEvent {
        if (!this._onStockChanged) {
            this._onStockChanged = new UnityEvent();
        }
        return this._onStockChanged;
    }

    private _onStockShortage: UnityEvent;
    public get OnStockShortage(): UnityEvent {
        if (!this._onStockShortage) {
            this._onStockShortage = new UnityEvent();
        }
        return this._onStockShortage;
    }

    /* ===== Properties (Getter) ===== */
    public get pizzaCount(): number {
        return this._pizzaCount;
    }

    public get spaghettiCount(): number {
        return this._spaghettiCount;
    }

    public get colaCount(): number {
        return this._colaCount;
    }

    /* ===== Unity Lifecycle ===== */
    private Awake() {
        if (StockManager.m_instance !== null && StockManager.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            StockManager.m_instance = this;
            if (this.transform.parent === null)
                GameObject.DontDestroyOnLoad(this.gameObject);
        }
    }

    private Start() {
        // 초기 재고 UI 업데이트
        this.OnStockChanged?.Invoke();
        console.log('[StockManager] 초기화 완료');
    }

    /* ===== 재고 관리 메서드 ===== */

    /**
     * 모든 재고를 최대치로 보충 (피자 가게에서 호출)
     */
    public RestockAll(): void {
        this._pizzaCount = this.maxStock;
        this._spaghettiCount = this.maxStock;
        this._colaCount = this.maxStock;

        console.log(`[StockManager] 재고 보충 완료: 피자 ${this._pizzaCount}, 스파게티 ${this._spaghettiCount}, 콜라 ${this._colaCount}`);

        // UI 업데이트 이벤트 발생
        this.OnStockChanged?.Invoke();
    }

    /**
     * 특정 아이템의 재고를 개별적으로 추가
     */
    public AddStock(pizza: number, spaghetti: number, cola: number): void {
        this._pizzaCount = Math.min(this._pizzaCount + pizza, this.maxStock);
        this._spaghettiCount = Math.min(this._spaghettiCount + spaghetti, this.maxStock);
        this._colaCount = Math.min(this._colaCount + cola, this.maxStock);

        console.log(`[StockManager] 재고 추가: 피자 +${pizza}, 스파게티 +${spaghetti}, 콜라 +${cola}`);

        this.OnStockChanged?.Invoke();
    }

    /**
     * 배달 시 재고 소진
     * @returns 성공 여부 (재고가 충분하면 true, 부족하면 false)
     */
    public RemoveStock(pizza: number, spaghetti: number, cola: number): boolean {
        // 재고 충분한지 확인
        if (!this.CanFulfillOrder(pizza, spaghetti, cola)) {
            console.warn('[StockManager] 재고 부족! 배달 불가');

            // 재고 부족 경고 이벤트 발생 (UI 깜빡임 등)
            this.OnStockShortage?.Invoke();
            return false;
        }

        // 재고 차감
        this._pizzaCount -= pizza;
        this._spaghettiCount -= spaghetti;
        this._colaCount -= cola;

        console.log(`[StockManager] 재고 소진: 피자 -${pizza}, 스파게티 -${spaghetti}, 콜라 -${cola}`);
        console.log(`[StockManager] 남은 재고: 피자 ${this._pizzaCount}, 스파게티 ${this._spaghettiCount}, 콜라 ${this._colaCount}`);

        // UI 업데이트 이벤트 발생
        this.OnStockChanged?.Invoke();
        return true;
    }

    /**
     * 주문을 이행할 수 있는지 확인 (재고 충분한지 체크)
     */
    public CanFulfillOrder(pizza: number, spaghetti: number, cola: number): boolean {
        return this._pizzaCount >= pizza &&
               this._spaghettiCount >= spaghetti &&
               this._colaCount >= cola;
    }

    /**
     * 현재 재고 상태를 문자열로 반환 (디버깅/로깅용)
     */
    public GetStockString(): string {
        return `피자: ${this._pizzaCount}/${this.maxStock}, 스파게티: ${this._spaghettiCount}/${this.maxStock}, 콜라: ${this._colaCount}/${this.maxStock}`;
    }

    /**
     * 재고 초기화 (디버그용)
     */
    public ClearStock(): void {
        this._pizzaCount = 0;
        this._spaghettiCount = 0;
        this._colaCount = 0;

        console.log('[StockManager] 재고 초기화');
        this.OnStockChanged?.Invoke();
    }

    /**
     * 재고를 특정 값으로 설정 (테스트용)
     */
    public SetStock(pizza: number, spaghetti: number, cola: number): void {
        this._pizzaCount = Math.max(0, Math.min(pizza, this.maxStock));
        this._spaghettiCount = Math.max(0, Math.min(spaghetti, this.maxStock));
        this._colaCount = Math.max(0, Math.min(cola, this.maxStock));

        console.log(`[StockManager] 재고 설정: ${this.GetStockString()}`);
        this.OnStockChanged?.Invoke();
    }

    /* ===== Singleton ===== */
    private static m_instance: StockManager = null;

    public static get instance(): StockManager {
        if (this.m_instance === null) {
            this.m_instance = GameObject.FindObjectOfType<StockManager>();
            if (this.m_instance === null) {
                this.m_instance = new GameObject(StockManager.name).AddComponent<StockManager>();
            }
        }
        return this.m_instance;
    }
}
