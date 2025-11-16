import { Random, Mathf } from 'UnityEngine';

/**
 * 배달 주문 클래스
 * - 피자, 스파게티, 콜라 주문량 관리
 * - 랜덤 주문 생성 기능
 */
export default class Order {

    /* ===== 주문 정보 ===== */
    private _pizzaAmount: number;
    private _spaghettiAmount: number;
    private _colaAmount: number;

    /* ===== Properties (Getter) ===== */
    public get pizzaAmount(): number {
        return this._pizzaAmount;
    }

    public get spaghettiAmount(): number {
        return this._spaghettiAmount;
    }

    public get colaAmount(): number {
        return this._colaAmount;
    }

    /* ===== Constructor ===== */

    /**
     * 주문 생성
     * @param pizza 피자 개수 (기본값: 0)
     * @param spaghetti 스파게티 개수 (기본값: 0)
     * @param cola 콜라 개수 (기본값: 0)
     */
    constructor(pizza: number = 0, spaghetti: number = 0, cola: number = 0) {
        this._pizzaAmount = pizza;
        this._spaghettiAmount = spaghetti;
        this._colaAmount = cola;
    }

    /* ===== Static 메서드 ===== */

    /**
     * 랜덤 주문 생성
     * - 1-3개의 아이템 중 랜덤 선택
     * - 각 아이템은 1-3개 랜덤 수량
     */
    public static GenerateRandomOrder(): Order {
        // Random.Range를 정수로 변환 (ZEPETO는 실수를 반환함)
        let pizza = Mathf.FloorToInt(Random.Range(0, 2)) === 1 ? Mathf.FloorToInt(Random.Range(1, 4)) : 0;
        let spaghetti = Mathf.FloorToInt(Random.Range(0, 2)) === 1 ? Mathf.FloorToInt(Random.Range(1, 4)) : 0;
        let cola = Mathf.FloorToInt(Random.Range(0, 2)) === 1 ? Mathf.FloorToInt(Random.Range(1, 4)) : 0;

        console.log(`[Order] 초기 랜덤 생성: 피자=${pizza}, 스파게티=${spaghetti}, 콜라=${cola}`);

        // 최소 1개 아이템은 주문되도록 보장
        if (pizza === 0 && spaghetti === 0 && cola === 0) {
            console.log('[Order] 모두 0이므로 최소 1개 아이템 강제 생성');
            const randomItem = Mathf.FloorToInt(Random.Range(0, 3));
            const amount = Mathf.FloorToInt(Random.Range(1, 4));

            console.log(`[Order] 선택된 아이템: ${randomItem}, 수량: ${amount}`);

            switch (randomItem) {
                case 0:
                    pizza = amount;
                    break;
                case 1:
                    spaghetti = amount;
                    break;
                case 2:
                    cola = amount;
                    break;
            }
        }

        console.log(`[Order] 최종 주문: 피자=${pizza}, 스파게티=${spaghetti}, 콜라=${cola}`);
        return new Order(pizza, spaghetti, cola);
    }

    /* ===== Instance 메서드 ===== */

    /**
     * 주문 내용을 문자열로 반환 (UI 표시용)
     */
    public GetOrderString(): string {
        let orderText = "주문:\n";

        if (this._pizzaAmount > 0)
            orderText += `피자 ${this._pizzaAmount}\n`;
        if (this._spaghettiAmount > 0)
            orderText += `스파게티 ${this._spaghettiAmount}\n`;
        if (this._colaAmount > 0)
            orderText += `콜라 ${this._colaAmount}\n`;

        return orderText.trimEnd();
    }

    /**
     * 유효한 주문인지 확인 (최소 1개 아이템 포함)
     */
    public IsValid(): boolean {
        return this._pizzaAmount > 0 || this._spaghettiAmount > 0 || this._colaAmount > 0;
    }

    /**
     * 주문 정보를 간단한 문자열로 반환 (로깅용)
     */
    public ToString(): string {
        return `Order(피자:${this._pizzaAmount}, 스파게티:${this._spaghettiAmount}, 콜라:${this._colaAmount})`;
    }
}
