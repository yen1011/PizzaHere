import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { GameObject } from 'UnityEngine';
import { UnityEvent } from 'UnityEngine.Events';
import DeliveryHouse from './DeliveryHouse';
import StockManager from './StockManager';

/**
 * 배달 관리 시스템 (1인 게임용)
 * - 모든 DeliveryHouse를 중앙에서 관리
 * - 배달 완료 횟수 추적
 * - 점수 관리
 * - UI 업데이트 이벤트 제공
 * - StockManager 패턴을 따름
 */
export default class DeliveryManager extends ZepetoScriptBehaviour {

    /* ===== 게임 설정 ===== */
    public pointsPerDelivery: number = 100;

    // 자동으로 씬의 모든 DeliveryHouse 찾기
    public autoFindHouses: boolean = true;

    // 현재 게임 상태 (private으로 관리)
    private _totalDeliveries: number = 0;
    private _score: number = 0;

    // 관리 중인 배달 집 목록
    private deliveryHouses: DeliveryHouse[] = [];

    // StockManager 참조
    private stockManager: StockManager;

    /* ===== 이벤트 ===== */
    private _onDeliveryCompleted: UnityEvent;
    public get OnDeliveryCompleted(): UnityEvent {
        if (!this._onDeliveryCompleted) {
            this._onDeliveryCompleted = new UnityEvent();
        }
        return this._onDeliveryCompleted;
    }

    private _onScoreChanged: UnityEvent;
    public get OnScoreChanged(): UnityEvent {
        if (!this._onScoreChanged) {
            this._onScoreChanged = new UnityEvent();
        }
        return this._onScoreChanged;
    }

    /* ===== Properties (Getter) ===== */
    public get totalDeliveries(): number {
        return this._totalDeliveries;
    }

    public get score(): number {
        return this._score;
    }

    /* ===== Unity Lifecycle ===== */
    private Awake() {
        if (DeliveryManager.m_instance !== null && DeliveryManager.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            DeliveryManager.m_instance = this;
            if (this.transform.parent === null)
                GameObject.DontDestroyOnLoad(this.gameObject);
        }
    }

    private Start() {
        // StockManager 찾기
        this.stockManager = StockManager.instance;
        if (!this.stockManager) {
            console.error('[DeliveryManager] StockManager를 찾을 수 없습니다!');
        }

        // 자동으로 모든 DeliveryHouse 찾기
        if (this.autoFindHouses) {
            this.FindAllDeliveryHouses();
        }

        // 초기 UI 업데이트
        this.OnScoreChanged?.Invoke();

        console.log(`[DeliveryManager] 초기화 완료 - ${this.deliveryHouses.length}개의 배달 집 등록됨`);
    }

    /* ===== 배달 관리 메서드 ===== */

    /**
     * 배달 완료 처리
     * @param earnings 배달로 얻은 수익 (각 물품당 1000원)
     */
    public CompleteDelivery(earnings: number = 0): void {
        this._totalDeliveries++;

        // 수익이 전달되면 그 값을 사용, 아니면 기본 점수 사용
        const actualEarnings = earnings > 0 ? earnings : this.pointsPerDelivery;
        this._score += actualEarnings;

        console.log(`[DeliveryManager] 배달 완료! 수익: ${actualEarnings}원, 총 배달: ${this._totalDeliveries}, 총 수익: ${this._score}원`);

        // 이벤트 발생
        this.OnDeliveryCompleted?.Invoke();
        this.OnScoreChanged?.Invoke();
    }

    /**
     * 점수를 직접 추가 (보너스 등)
     */
    public AddScore(amount: number): void {
        this._score += amount;
        console.log(`[DeliveryManager] 점수 추가: +${amount}, 현재 점수: ${this._score}`);
        this.OnScoreChanged?.Invoke();
    }

    /**
     * 게임 상태 초기화
     */
    public ResetGame(): void {
        this._totalDeliveries = 0;
        this._score = 0;

        // 모든 배달 집의 주문 취소
        this.CancelAllOrders();

        // StockManager 재고 보충 (선택사항)
        if (this.stockManager) {
            this.stockManager.RestockAll();
        }

        console.log('[DeliveryManager] 게임 초기화');
        this.OnScoreChanged?.Invoke();
    }

    /* ===== DeliveryHouse 관리 메서드 ===== */

    /**
     * 씬의 모든 DeliveryHouse를 찾아서 등록
     */
    private FindAllDeliveryHouses(): void {
        const houses = GameObject.FindObjectsOfType<DeliveryHouse>();
        this.deliveryHouses = [];

        for (let i = 0; i < houses.length; i++) {
            this.RegisterHouse(houses[i]);
        }

        console.log(`[DeliveryManager] ${this.deliveryHouses.length}개의 배달 집을 찾았습니다.`);
    }

    /**
     * DeliveryHouse를 매니저에 등록
     */
    public RegisterHouse(house: DeliveryHouse): void {
        if (!house) return;

        // 중복 등록 방지
        if (this.deliveryHouses.indexOf(house) === -1) {
            this.deliveryHouses.push(house);
            console.log(`[DeliveryManager] ${house.gameObject.name} 등록됨`);
        }
    }

    /**
     * DeliveryHouse를 매니저에서 제거
     */
    public UnregisterHouse(house: DeliveryHouse): void {
        if (!house) return;

        const index = this.deliveryHouses.indexOf(house);
        if (index !== -1) {
            this.deliveryHouses.splice(index, 1);
            console.log(`[DeliveryManager] ${house.gameObject.name} 등록 해제됨`);
        }
    }

    /**
     * 모든 배달 집에 강제로 주문 생성
     */
    public ForceGenerateAllOrders(): void {
        let count = 0;
        for (const house of this.deliveryHouses) {
            if (house && !house.HasActiveOrder()) {
                house.ForceGenerateOrder();
                count++;
            }
        }
        console.log(`[DeliveryManager] ${count}개의 집에 주문 생성`);
    }

    /**
     * 모든 배달 집의 주문 취소
     */
    public CancelAllOrders(): void {
        for (const house of this.deliveryHouses) {
            if (house && house.HasActiveOrder()) {
                house.CancelOrder();
            }
        }
        console.log('[DeliveryManager] 모든 주문 취소됨');
    }

    /**
     * 등록된 배달 집 개수 반환
     */
    public GetHouseCount(): number {
        return this.deliveryHouses.length;
    }

    /**
     * 활성 주문이 있는 집 개수 반환
     */
    public GetActiveOrderCount(): number {
        let count = 0;
        for (const house of this.deliveryHouses) {
            if (house && house.HasActiveOrder()) {
                count++;
            }
        }
        return count;
    }

    /**
     * 모든 배달 집 목록 반환
     */
    public GetAllHouses(): DeliveryHouse[] {
        return this.deliveryHouses;
    }

    /**
     * 점수를 특정 값으로 설정 (테스트용)
     */
    public SetScore(score: number): void {
        this._score = Math.max(0, score);
        console.log(`[DeliveryManager] 점수 설정: ${this._score}`);
        this.OnScoreChanged?.Invoke();
    }

    /**
     * 배달 횟수를 특정 값으로 설정 (테스트용)
     */
    public SetDeliveries(count: number): void {
        this._totalDeliveries = Math.max(0, count);
        console.log(`[DeliveryManager] 배달 횟수 설정: ${this._totalDeliveries}`);
    }

    /**
     * 현재 게임 상태를 문자열로 반환 (디버깅/로깅용)
     */
    public GetGameStateString(): string {
        return `배달: ${this._totalDeliveries}, 점수: ${this._score}`;
    }

    /* ===== Singleton ===== */
    private static m_instance: DeliveryManager = null;

    public static get instance(): DeliveryManager {
        if (this.m_instance === null) {
            this.m_instance = GameObject.FindObjectOfType<DeliveryManager>();
            if (this.m_instance === null) {
                this.m_instance = new GameObject(DeliveryManager.name).AddComponent<DeliveryManager>();
            }
        }
        return this.m_instance;
    }
}
