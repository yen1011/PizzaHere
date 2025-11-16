import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Collider, Time, WaitForSeconds, Vector3, Color, Gizmos } from 'UnityEngine';
import { ZepetoPlayers, ZepetoCharacter } from 'ZEPETO.Character.Controller';
import StockManager from './StockManager';
import DeliveryManager from './DeliveryManager';
import Order from './Order';
import OrderUI from './OrderUI';
import DeliveryButtonUI from './DeliveryButtonUI';

/**
 * 배달 집 스크립트
 * - 플레이어가 가까이 오면 배달 가능
 * - 주문 자동 생성 및 관리
 * - 거리 기반 감지 (Trigger 불필요 - 물리 충돌 유지)
 * - PizzaShop 패턴을 따름
 */
export default class DeliveryHouse extends ZepetoScriptBehaviour {

    /* ===== 감지 설정 ===== */
    // 배달 가능 거리 (미터)
    public deliveryRange: number = 3.0;

    // 감지 방식 선택
    public useDistanceDetection: boolean = true; // true: 거리 기반, false: Trigger 기반

    /* ===== 주문 설정 ===== */
    // 주문 생성 간격 (초)
    public minOrderInterval: number = 10.0;
    public maxOrderInterval: number = 30.0;

    // 자동 배달 여부 (true면 범위 내 진입 시 자동 배달)
    public autoDeliverOnEnter: boolean = false;

    // 배달 쿨다운 (초) - 연속 배달 방지
    public deliveryCooldown: number = 1.0;

    /* ===== UI 설정 ===== */
    // 주문 UI 컴포넌트 (자동으로 자식에서 찾음)
    private orderUI: OrderUI;

    // 모바일 배달 버튼 UI (싱글톤으로 자동 찾음)
    private deliveryButtonUI: DeliveryButtonUI;

    /* ===== Private 변수 ===== */
    private stockManager: StockManager;
    private deliveryManager: DeliveryManager;

    private hasActiveOrder: boolean = false;
    private currentOrder: Order = null;

    private isPlayerInRange: boolean = false;
    private lastDeliveryTime: number = -999; // 마지막 배달 시간
    private nextOrderTime: number = 0; // 다음 주문 생성 시간

    /* ===== Unity Lifecycle ===== */
    private Start() {
        // Manager 찾기
        this.stockManager = StockManager.instance;
        this.deliveryManager = DeliveryManager.instance;

        if (!this.stockManager) {
            console.error('[DeliveryHouse] StockManager를 찾을 수 없습니다!');
            return;
        }

        if (!this.deliveryManager) {
            console.error('[DeliveryHouse] DeliveryManager를 찾을 수 없습니다!');
            return;
        }

        // DeliveryManager에 자동 등록
        // (autoFindHouses가 false인 경우를 위해)
        this.deliveryManager.RegisterHouse(this);

        // OrderUI 자동 찾기 (자식 오브젝트에서)
        this.orderUI = this.GetComponentInChildren<OrderUI>();
        if (this.orderUI) {
            console.log(`[DeliveryHouse] ${this.gameObject.name} - OrderUI 자동 찾기 완료`);
        } else {
            console.warn(`[DeliveryHouse] ${this.gameObject.name} - OrderUI를 찾을 수 없습니다! 자식 오브젝트에 OrderUI가 있는지 확인하세요.`);
        }

        // DeliveryButtonUI 자동 찾기 (싱글톤)
        this.deliveryButtonUI = DeliveryButtonUI.instance;
        if (this.deliveryButtonUI) {
            console.log('[DeliveryHouse] DeliveryButtonUI 자동 찾기 완료');
        }

        // 주문 UI 초기 상태 (숨김)
        this.HideOrderUI();

        // 첫 주문 스케줄링
        this.ScheduleNextOrder();

        console.log(`[DeliveryHouse] ${this.gameObject.name} 초기화 완료`);
    }

    private OnDestroy() {
        // DeliveryManager에서 등록 해제
        if (this.deliveryManager) {
            this.deliveryManager.UnregisterHouse(this);
        }
    }

    private Update() {
        // 주문 생성 시간 체크
        if (!this.hasActiveOrder && Time.time >= this.nextOrderTime) {
            this.GenerateOrder();
        }

        // 거리 기반 감지 사용 시
        if (this.useDistanceDetection) {
            this.CheckPlayerDistance();
        }
    }

    /* ===== 거리 기반 감지 ===== */

    /**
     * 플레이어와의 거리를 체크하여 범위 내 진입/이탈 감지
     * Trigger 없이 작동하므로 물리 충돌 유지 가능
     */
    private CheckPlayerDistance(): void {
        // LocalPlayer 찾기
        if (!ZepetoPlayers.instance || !ZepetoPlayers.instance.LocalPlayer) {
            return;
        }

        const localPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        if (!localPlayer) return;

        // 거리 계산
        const distance = Vector3.Distance(this.transform.position, localPlayer.transform.position);
        const wasInRange = this.isPlayerInRange;

        // 범위 내에 있는지 체크
        this.isPlayerInRange = distance <= this.deliveryRange;

        // 방금 범위에 진입한 경우
        if (this.isPlayerInRange && !wasInRange) {
            this.OnPlayerEnterHouse();
        }
        // 방금 범위를 벗어난 경우
        else if (!this.isPlayerInRange && wasInRange) {
            this.OnPlayerExitHouse();
        }

        // 버튼 표시는 VehicleController에서 처리
        // (차량 탑승 시에만 버튼이 표시되도록 변경됨)
    }

    /* ===== Trigger 이벤트 (useDistanceDetection = false 일 때만 사용) ===== */

    /**
     * 플레이어가 배달 집 Trigger에 진입
     * 주의: useDistanceDetection이 false일 때만 작동
     */
    private OnTriggerEnter(coll: Collider) {
        if (this.useDistanceDetection) return; // 거리 감지 모드에서는 무시
        // LocalPlayer 체크
        if (!ZepetoPlayers.instance.LocalPlayer) return;

        const character = coll.GetComponent<ZepetoCharacter>();
        if (!character) return;

        // LocalPlayer인지 확인
        if (character !== ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character) {
            return;
        }

        this.isPlayerInRange = true;
        this.OnPlayerEnterHouse();
    }

    /**
     * 플레이어가 배달 집 Trigger를 벗어남
     * 주의: useDistanceDetection이 false일 때만 작동
     */
    private OnTriggerExit(coll: Collider) {
        if (this.useDistanceDetection) return; // 거리 감지 모드에서는 무시
        if (!ZepetoPlayers.instance.LocalPlayer) return;

        const character = coll.GetComponent<ZepetoCharacter>();
        if (!character) return;

        if (character !== ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character) {
            return;
        }

        this.isPlayerInRange = false;
        this.OnPlayerExitHouse();
    }

    /**
     * 플레이어가 배달 집 범위에 진입
     */
    private OnPlayerEnterHouse(): void {
        console.log(`[DeliveryHouse] 플레이어가 ${this.gameObject.name}에 들어왔습니다.`);

        // 자동 배달 옵션이 켜져있고 주문이 있으면 바로 배달
        if (this.autoDeliverOnEnter && this.hasActiveOrder) {
            this.TryDeliver();
        }
        // 자동 배달이 아닌 경우 버튼 표시 (CheckPlayerDistance에서 처리됨)
    }

    /**
     * 플레이어가 배달 집 범위를 벗어남
     */
    private OnPlayerExitHouse(): void {
        console.log(`[DeliveryHouse] 플레이어가 ${this.gameObject.name}에서 나갔습니다.`);

        // 버튼 숨김 (CheckPlayerDistance에서 처리됨)
    }

    /* ===== 주문 관리 ===== */

    /**
     * 랜덤 주문 생성
     */
    private GenerateOrder(): void {
        this.currentOrder = Order.GenerateRandomOrder();
        this.hasActiveOrder = true;

        console.log(`[DeliveryHouse] ${this.gameObject.name} 새 주문 생성: ${this.currentOrder.GetOrderString()}`);

        // UI 업데이트
        this.UpdateOrderUI();
        this.ShowOrderUI();

        // TODO: 주문 생성 효과음/이펙트
    }

    /**
     * 다음 주문 생성 시간 스케줄링
     */
    private ScheduleNextOrder(): void {
        const interval = this.minOrderInterval + Math.random() * (this.maxOrderInterval - this.minOrderInterval);
        this.nextOrderTime = Time.time + interval;

        console.log(`[DeliveryHouse] ${this.gameObject.name} 다음 주문 생성까지 ${interval.toFixed(1)}초`);
    }

    /* ===== 배달 처리 ===== */

    /**
     * 배달 시도 (쿨다운 체크 포함)
     */
    public TryDeliver(): void {
        // 주문이 없으면 리턴
        if (!this.hasActiveOrder) {
            console.log('[DeliveryHouse] 현재 주문이 없습니다.');
            return;
        }

        // 쿨다운 체크
        const currentTime = Time.time;
        if (currentTime - this.lastDeliveryTime < this.deliveryCooldown) {
            console.log('[DeliveryHouse] 배달 쿨다운 중...');
            return;
        }

        // 재고 확인 및 차감
        const success = this.stockManager.RemoveStock(
            this.currentOrder.pizzaAmount,
            this.currentOrder.spaghettiAmount,
            this.currentOrder.colaAmount
        );

        if (success) {
            // 배달 성공!
            this.CompleteDelivery();
            this.lastDeliveryTime = currentTime;
        } else {
            console.log('[DeliveryHouse] 재고가 부족하여 배달할 수 없습니다!');
            // StockManager에서 OnStockShortage 이벤트가 이미 발생함
        }
    }

    /**
     * 배달 완료 처리
     */
    private CompleteDelivery(): void {
        console.log(`[DeliveryHouse] ${this.gameObject.name} 배달 완료!`);

        // 수익 계산 (각 물품당 1000원)
        const PRICE_PER_ITEM = 1000;
        let earnings = 0;

        if (this.currentOrder) {
            const pizzaEarnings = this.currentOrder.pizzaAmount * PRICE_PER_ITEM;
            const spaghettiEarnings = this.currentOrder.spaghettiAmount * PRICE_PER_ITEM;
            const colaEarnings = this.currentOrder.colaAmount * PRICE_PER_ITEM;

            earnings = pizzaEarnings + spaghettiEarnings + colaEarnings;

            console.log(`[DeliveryHouse] 수익 계산 - 피자: ${pizzaEarnings}원, 스파게티: ${spaghettiEarnings}원, 콜라: ${colaEarnings}원, 총: ${earnings}원`);
        }

        // DeliveryManager에 배달 완료 알림 (수익 전달)
        this.deliveryManager.CompleteDelivery(earnings);

        // 주문 초기화
        this.hasActiveOrder = false;
        this.currentOrder = null;

        // UI 숨기기
        this.HideOrderUI();

        // 배달 버튼 숨기기
        if (this.deliveryButtonUI) {
            this.deliveryButtonUI.HideButton();
        }

        // TODO: 배달 완료 효과음/이펙트

        // 다음 주문 스케줄링
        this.ScheduleNextOrder();
    }

    /* ===== Public 메서드 ===== */

    /**
     * 외부에서 강제로 주문 생성 (테스트용)
     */
    public ForceGenerateOrder(): void {
        if (!this.hasActiveOrder) {
            this.GenerateOrder();
        } else {
            console.log(`[DeliveryHouse] ${this.gameObject.name}에 이미 주문이 있습니다.`);
        }
    }

    /**
     * 현재 주문 취소
     */
    public CancelOrder(): void {
        if (this.hasActiveOrder) {
            this.hasActiveOrder = false;
            this.currentOrder = null;
            console.log(`[DeliveryHouse] ${this.gameObject.name} 주문 취소`);

            // UI 숨기기
            this.HideOrderUI();

            // 배달 버튼 숨기기
            if (this.deliveryButtonUI) {
                this.deliveryButtonUI.HideButton();
            }

            this.ScheduleNextOrder();
        }
    }

    /* ===== UI 관리 메서드 ===== */

    /**
     * 주문 UI 업데이트 (OrderUI 컴포넌트 사용)
     */
    private UpdateOrderUI(): void {
        if (!this.orderUI || !this.currentOrder) return;

        this.orderUI.SetOrder(this.currentOrder);
    }

    /**
     * 주문 UI 표시
     */
    private ShowOrderUI(): void {
        if (this.orderUI) {
            this.orderUI.ShowUI();
        }
    }

    /**
     * 주문 UI 숨기기
     */
    private HideOrderUI(): void {
        if (this.orderUI) {
            this.orderUI.HideUI();
        }
    }

    /**
     * 플레이어가 범위 내에 있는지 확인
     */
    public IsPlayerInRange(): boolean {
        return this.isPlayerInRange;
    }

    /**
     * 현재 주문 정보 반환
     */
    public GetCurrentOrder(): Order {
        return this.currentOrder;
    }

    /**
     * 활성 주문이 있는지 확인
     */
    public HasActiveOrder(): boolean {
        return this.hasActiveOrder;
    }

    /* ===== Unity Gizmos (에디터에서 배달 범위 시각화) ===== */

    /**
     * 에디터에서 배달 범위를 시각적으로 표시
     * 주문이 있으면 노란색, 없으면 회색
     */
    private OnDrawGizmosSelected(): void {
        // 거리 기반 감지를 사용할 때만 표시
        if (!this.useDistanceDetection) return;

        // 주문 상태에 따라 색상 변경
        Gizmos.color = this.hasActiveOrder ? Color.yellow : Color.gray;

        // 배달 범위를 구체로 표시
        Gizmos.DrawWireSphere(this.transform.position, this.deliveryRange);
    }
}
