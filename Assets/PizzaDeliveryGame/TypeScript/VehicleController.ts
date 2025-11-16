import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Collider, Vector3 } from 'UnityEngine';
import { ZepetoPlayers, ZepetoCharacter } from 'ZEPETO.Character.Controller';
import DeliveryButtonUI from './DeliveryButtonUI';
import DeliveryHouse from './DeliveryHouse';
import DeliveryManager from './DeliveryManager';

/**
 * 배달 차량 컨트롤러
 * - 플레이어가 차량에 탑승하면 배달 버튼 UI 표시
 * - 차량에서 내리면 배달 버튼 UI 숨김
 * - 가까운 집에 주문이 있을 때만 배달 가능
 */
export default class VehicleController extends ZepetoScriptBehaviour {

    /* ===== 설정 ===== */
    // 배달 가능한 최대 거리 (미터)
    public deliveryRange: number = 5.0;

    /* ===== Private 변수 ===== */
    private deliveryButtonUI: DeliveryButtonUI;
    private isPlayerInVehicle: boolean = false;
    private nearestHouse: DeliveryHouse = null;

    /* ===== Unity Lifecycle ===== */
    private Start() {
        // DeliveryButtonUI 찾기
        this.deliveryButtonUI = DeliveryButtonUI.instance;
        if (!this.deliveryButtonUI) {
            console.error('[VehicleController] DeliveryButtonUI를 찾을 수 없습니다!');
            return;
        }

        console.log(`[VehicleController] ${this.gameObject.name} 초기화 완료`);
    }

    private Update() {
        // 차량에 탑승 중일 때만 가까운 집 찾기
        if (this.isPlayerInVehicle) {
            this.UpdateNearestHouse();
        }
    }

    /* ===== Trigger 이벤트 ===== */

    /**
     * 플레이어가 차량에 탑승 (Trigger 진입)
     */
    private OnTriggerEnter(coll: Collider) {
        // LocalPlayer 체크
        if (!ZepetoPlayers.instance || !ZepetoPlayers.instance.LocalPlayer) return;

        const character = coll.GetComponent<ZepetoCharacter>();
        if (!character) return;

        // LocalPlayer인지 확인
        if (character !== ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character) {
            return;
        }

        this.isPlayerInVehicle = true;
        this.OnPlayerEnterVehicle();
    }

    /**
     * 플레이어가 차량에서 하차 (Trigger 이탈)
     */
    private OnTriggerExit(coll: Collider) {
        if (!ZepetoPlayers.instance || !ZepetoPlayers.instance.LocalPlayer) return;

        const character = coll.GetComponent<ZepetoCharacter>();
        if (!character) return;

        if (character !== ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character) {
            return;
        }

        this.isPlayerInVehicle = false;
        this.OnPlayerExitVehicle();
    }

    /**
     * 플레이어가 차량에 탑승했을 때
     */
    private OnPlayerEnterVehicle(): void {
        console.log('[VehicleController] 플레이어가 차량에 탑승했습니다.');

        // 가까운 집 찾기 시작
        this.UpdateNearestHouse();
    }

    /**
     * 플레이어가 차량에서 하차했을 때
     */
    private OnPlayerExitVehicle(): void {
        console.log('[VehicleController] 플레이어가 차량에서 하차했습니다.');

        // 배달 버튼 숨기기
        if (this.deliveryButtonUI) {
            this.deliveryButtonUI.HideButton();
        }

        this.nearestHouse = null;
    }

    /* ===== 배달 집 감지 ===== */

    /**
     * 가장 가까운 주문이 있는 집 찾기 및 버튼 업데이트
     */
    private UpdateNearestHouse(): void {
        if (!ZepetoPlayers.instance || !ZepetoPlayers.instance.LocalPlayer) return;

        const localPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        if (!localPlayer) return;

        // DeliveryManager에서 모든 집 가져오기
        const deliveryManager = DeliveryManager.instance;
        if (!deliveryManager) return;

        const allHouses = deliveryManager.GetAllHouses();
        let closestHouse: DeliveryHouse = null;
        let closestDistance = this.deliveryRange;

        // 가장 가까운 주문이 있는 집 찾기
        for (const house of allHouses) {
            if (!house || !house.HasActiveOrder()) continue;

            const distance = Vector3.Distance(house.transform.position, localPlayer.transform.position);
            if (distance <= closestDistance) {
                closestDistance = distance;
                closestHouse = house;
            }
        }

        // 가장 가까운 집이 변경되었을 때
        if (closestHouse !== this.nearestHouse) {
            this.nearestHouse = closestHouse;

            if (this.nearestHouse) {
                // 배달 버튼 표시
                console.log(`[VehicleController] 배달 가능한 집: ${this.nearestHouse.gameObject.name}`);
                if (this.deliveryButtonUI) {
                    this.deliveryButtonUI.ShowDeliveryButton(() => this.TryDeliverToNearestHouse());
                }
            } else {
                // 범위 내 집 없음 - 버튼 숨김
                if (this.deliveryButtonUI) {
                    this.deliveryButtonUI.HideButton();
                }
            }
        }
    }

    /**
     * 가장 가까운 집으로 배달 시도
     */
    private TryDeliverToNearestHouse(): void {
        if (!this.nearestHouse) {
            console.log('[VehicleController] 배달할 집이 없습니다.');
            return;
        }

        console.log(`[VehicleController] ${this.nearestHouse.gameObject.name}로 배달 시도`);
        this.nearestHouse.TryDeliver();
    }

    /* ===== Public 메서드 ===== */

    /**
     * 플레이어가 차량에 탑승 중인지 확인
     */
    public IsPlayerInVehicle(): boolean {
        return this.isPlayerInVehicle;
    }

    /**
     * 현재 배달 가능한 집이 있는지 확인
     */
    public HasNearbyHouse(): boolean {
        return this.nearestHouse !== null;
    }
}
