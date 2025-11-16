import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { GameObject } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { TextMeshProUGUI } from 'TMPro';

/**
 * 모바일용 재고 보충 버튼 UI
 * - 플레이어가 피자샵 범위 내에 있을 때만 표시
 * - 버튼 클릭 시 재고 보충 실행
 * - 싱글톤 패턴 (화면에 하나만)
 */
export default class RefillButtonUI extends ZepetoScriptBehaviour {

    /* ===== UI 참조 ===== */
    @SerializeField()
    private refillButton: Button;

    @SerializeField()
    private buttonObject: GameObject;

    @SerializeField()
    private buttonText: TextMeshProUGUI;

    /* ===== Private 변수 ===== */
    private currentRefillAction: () => void = null;

    /* ===== Unity Lifecycle ===== */
    private Awake() {
        // 싱글톤 설정
        if (RefillButtonUI.m_instance !== null && RefillButtonUI.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            RefillButtonUI.m_instance = this;
        }
    }

    private Start() {
        // 초기 상태: 버튼 숨김
        this.HideButton();

        // 버튼 클릭 이벤트 등록
        if (this.refillButton && this.refillButton != null) {
            this.refillButton.onClick.AddListener(() => this.OnButtonClicked());
        }

        console.log('[RefillButtonUI] 초기화 완료');
    }

    private OnDestroy() {
        // 이벤트 해제
        if (this.refillButton && this.refillButton != null) {
            this.refillButton.onClick.RemoveAllListeners();
        }

        // 싱글톤 인스턴스 정리
        if (RefillButtonUI.m_instance === this) {
            RefillButtonUI.m_instance = null;
        }
    }

    /* ===== 버튼 관리 메서드 ===== */

    /**
     * 재고 보충 버튼 표시 및 콜백 등록
     * @param refillAction 버튼 클릭 시 실행할 재고 보충 함수
     */
    public ShowRefillButton(refillAction: () => void): void {
        try {
            // 재고 보충 액션 저장
            this.currentRefillAction = refillAction;

            // 버튼 표시
            if (this.buttonObject) {
                this.buttonObject.SetActive(true);
            } else if (this.refillButton && this.refillButton.gameObject) {
                this.refillButton.gameObject.SetActive(true);
            }

            console.log('[RefillButtonUI] 재고 보충 버튼 표시');
        } catch (e) {
            // GameObject가 파괴된 경우 무시
        }
    }

    /**
     * 재고 보충 버튼 숨김
     */
    public HideButton(): void {
        try {
            // 재고 보충 액션 초기화
            this.currentRefillAction = null;

            // 버튼 숨김
            if (this.buttonObject) {
                this.buttonObject.SetActive(false);
            } else if (this.refillButton && this.refillButton.gameObject) {
                this.refillButton.gameObject.SetActive(false);
            }

            console.log('[RefillButtonUI] 재고 보충 버튼 숨김');
        } catch (e) {
            // GameObject가 파괴된 경우 무시
        }
    }

    /**
     * 버튼이 표시 중인지 확인
     */
    public IsVisible(): boolean {
        try {
            // GameObject가 파괴되었는지 확인
            if (this.buttonObject) {
                return this.buttonObject.activeSelf;
            } else if (this.refillButton && this.refillButton.gameObject) {
                return this.refillButton.gameObject.activeSelf;
            }
        } catch (e) {
            // GameObject가 파괴된 경우 무시
            return false;
        }
        return false;
    }

    /* ===== 버튼 이벤트 ===== */

    /**
     * 재고 보충 버튼 클릭 시 호출
     */
    private OnButtonClicked(): void {
        console.log('[RefillButtonUI] 재고 보충 버튼 클릭!');

        // 등록된 재고 보충 액션 실행
        if (this.currentRefillAction) {
            this.currentRefillAction();
        } else {
            console.warn('[RefillButtonUI] 재고 보충 액션이 등록되지 않았습니다!');
        }
    }

    /* ===== Public 메서드 ===== */

    /**
     * 버튼 활성화/비활성화
     */
    public SetButtonInteractable(interactable: boolean): void {
        if (this.refillButton && this.refillButton != null) {
            this.refillButton.interactable = interactable;
        }
    }

    /**
     * 버튼 텍스트 변경 (TextMeshPro 사용 시)
     */
    public SetButtonText(text: string): void {
        if (this.buttonText && this.buttonText != null) {
            this.buttonText.text = text;
        }
    }

    /* ===== Singleton ===== */
    private static m_instance: RefillButtonUI = null;

    public static get instance(): RefillButtonUI {
        if (this.m_instance === null) {
            this.m_instance = GameObject.FindObjectOfType<RefillButtonUI>();
        }
        return this.m_instance;
    }
}
