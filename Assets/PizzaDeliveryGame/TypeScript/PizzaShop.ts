import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Collider, Vector3, WaitForSeconds, Time, Color, Gizmos } from 'UnityEngine';
import { ZepetoPlayers, ZepetoCharacter } from 'ZEPETO.Character.Controller';
import StockManager from './StockManager';
import RefillButtonUI from './RefillButtonUI';

/**
 * 피자 가게 스크립트
 * - 플레이어가 가까이 오면 재고 보충 가능
 * - 거리 기반 감지 (물리 충돌 유지)
 * - 버튼 클릭으로 재고 보충
 */
export default class PizzaShop extends ZepetoScriptBehaviour {

    /* ===== 감지 설정 ===== */
    // 재고 보충 가능 거리 (미터)
    public refillRange: number = 3.0;

    // 감지 방식 선택
    public useDistanceDetection: boolean = true; // true: 거리 기반, false: Trigger 기반

    /* ===== 재고 보충 설정 ===== */
    // 재보충 쿨다운 (초) - 연속 보충 방지
    public restockCooldown: number = 2.0;

    // 자동 보충 여부 (true면 범위 내 진입 시 자동 보충)
    public autoRestock: boolean = false;

    /* ===== Private 변수 ===== */
    private stockManager: StockManager;
    private refillButtonUI: RefillButtonUI;
    private lastRestockTime: number = -999; // 마지막 보충 시간
    private isPlayerInRange: boolean = false;

    /* ===== Unity Lifecycle ===== */
    private Start() {
        // StockManager 찾기
        this.stockManager = StockManager.instance;

        if (!this.stockManager) {
            console.error('[PizzaShop] StockManager를 찾을 수 없습니다!');
            return;
        }

        // RefillButtonUI 자동 찾기 (싱글톤)
        this.refillButtonUI = RefillButtonUI.instance;
        if (this.refillButtonUI) {
            console.log('[PizzaShop] RefillButtonUI 자동 찾기 완료');
        }

        console.log('[PizzaShop] 초기화 완료');
    }

    private Update() {
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
        this.isPlayerInRange = distance <= this.refillRange;

        // 방금 범위에 진입한 경우
        if (this.isPlayerInRange && !wasInRange) {
            this.OnPlayerEnterShop();
        }
        // 방금 범위를 벗어난 경우
        else if (!this.isPlayerInRange && wasInRange) {
            this.OnPlayerExitShop();
        }

        // 범위 내에 있으면 버튼 표시
        if (this.isPlayerInRange) {
            if (this.refillButtonUI && !this.refillButtonUI.IsVisible()) {
                this.refillButtonUI.ShowRefillButton(() => this.TryRestock());
            }
        }
        // 범위 밖이면 버튼 숨김
        else if (this.refillButtonUI && this.refillButtonUI.IsVisible()) {
            this.refillButtonUI.HideButton();
        }
    }

    /* ===== Trigger 이벤트 (useDistanceDetection = false 일 때만 사용) ===== */

    /**
     * 플레이어가 피자 가게 Trigger에 진입
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
        this.OnPlayerEnterShop();
    }

    /**
     * 플레이어가 피자 가게 Trigger를 벗어남
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
        this.OnPlayerExitShop();
    }

    /**
     * 플레이어가 피자 가게 범위에 진입
     */
    private OnPlayerEnterShop(): void {
        console.log('[PizzaShop] 플레이어가 피자 가게에 들어왔습니다.');

        // 자동 보충 옵션이 켜져있으면 바로 보충
        if (this.autoRestock) {
            this.TryRestock();
        }

        // TODO: UI 안내 표시 (예: "재고를 보충했습니다!")
    }

    /**
     * 플레이어가 피자 가게 범위를 벗어남
     */
    private OnPlayerExitShop(): void {
        console.log('[PizzaShop] 플레이어가 피자 가게에서 나갔습니다.');
    }

    /* ===== 재고 보충 ===== */

    /**
     * 재고 보충 시도 (쿨다운 체크 포함)
     */
    public TryRestock(): void {
        // 쿨다운 체크
        const currentTime = Time.time;
        if (currentTime - this.lastRestockTime < this.restockCooldown) {
            console.log('[PizzaShop] 재고 보충 쿨다운 중...');
            return;
        }

        // 재고 보충 실행
        this.Restock();

        // 쿨다운 갱신
        this.lastRestockTime = currentTime;
    }

    /**
     * 재고 보충 실행
     */
    private Restock(): void {
        if (!this.stockManager) return;

        console.log('[PizzaShop] 재고 보충!');

        // StockManager의 RestockAll() 호출
        this.stockManager.RestockAll();

        // TODO: 보충 효과음 재생
        // TODO: 보충 이펙트 표시
        // TODO: UI 피드백 ("재고가 보충되었습니다!")
    }

    /* ===== Public 메서드 ===== */

    /**
     * 외부에서 강제로 재고 보충 (쿨다운 무시)
     */
    public ForceRestock(): void {
        this.Restock();
        this.lastRestockTime = Time.time;
    }

    /**
     * 플레이어가 범위 내에 있는지 확인
     */
    public IsPlayerInRange(): boolean {
        return this.isPlayerInRange;
    }

    /* ===== Unity Gizmos (에디터에서 재고 보충 범위 시각화) ===== */

    /**
     * 에디터에서 재고 보충 범위를 시각적으로 표시
     * 항상 초록색 (재고 보충 가능)
     */
    private OnDrawGizmosSelected(): void {
        // 거리 기반 감지를 사용할 때만 표시
        if (!this.useDistanceDetection) return;

        // 초록색으로 재고 보충 범위 표시
        Gizmos.color = Color.green;

        // 재고 보충 범위를 구체로 표시
        Gizmos.DrawWireSphere(this.transform.position, this.refillRange);
    }
}
