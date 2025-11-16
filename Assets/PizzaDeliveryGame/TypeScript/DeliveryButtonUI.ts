import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { GameObject, AudioClip, AudioSource } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { TextMeshProUGUI } from 'TMPro';

/**
 * 모바일용 배달 버튼 UI
 * - 플레이어가 집 범위 내에 있을 때만 표시
 * - 버튼 클릭 시 배달 실행
 * - 싱글톤 패턴 (화면에 하나만)
 */
export default class DeliveryButtonUI extends ZepetoScriptBehaviour {

    /* ===== UI 참조 ===== */
    @SerializeField()
    private deliveryButton: Button;

    @SerializeField()
    private buttonObject: GameObject;

    @SerializeField()
    private buttonText: TextMeshProUGUI;

    /* ===== 효과음 설정 ===== */
    @SerializeField()
    private clickSound: AudioClip; // 버튼 클릭 효과음

    @SerializeField()
    private soundVolume: number = 1.0; // 효과음 볼륨 (0.0 ~ 1.0)

    /* ===== Private 변수 ===== */
    private currentDeliveryAction: () => void = null;
    private audioSource: AudioSource;

    /* ===== Unity Lifecycle ===== */
    private Awake() {
        // 싱글톤 설정
        if (DeliveryButtonUI.m_instance !== null && DeliveryButtonUI.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            DeliveryButtonUI.m_instance = this;
        }
    }

    private Start() {
        // AudioSource 컴포넌트 추가 또는 가져오기
        this.audioSource = this.GetComponent<AudioSource>();
        if (!this.audioSource) {
            this.audioSource = this.gameObject.AddComponent<AudioSource>();
        }
        this.audioSource.playOnAwake = false;
        this.audioSource.volume = this.soundVolume;

        // 효과음 로드 (Inspector에서 할당되지 않은 경우)
        if (!this.clickSound) {
            this.LoadClickSound();
        }

        // 초기 상태: 버튼 숨김
        this.HideButton();

        // 버튼 클릭 이벤트 등록
        if (this.deliveryButton) {
            this.deliveryButton.onClick.AddListener(() => this.OnButtonClicked());
        }

        console.log('[DeliveryButtonUI] 초기화 완료');
    }

    /**
     * 효과음 파일 로드 (Resources 폴더 또는 직접 검색)
     */
    private LoadClickSound(): void {
        // AudioSource 컴포넌트에서 가져오기 (Inspector에 할당된 경우)
        const audioSource = this.GetComponent<AudioSource>();
        if (audioSource && audioSource.clip) {
            this.clickSound = audioSource.clip;
            console.log('[DeliveryButtonUI] AudioSource에서 효과음 로드: ' + this.clickSound.name);
        }
    }

    private OnDestroy() {
        // 이벤트 해제
        if (this.deliveryButton) {
            this.deliveryButton.onClick.RemoveAllListeners();
        }

        // 싱글톤 인스턴스 정리
        if (DeliveryButtonUI.m_instance === this) {
            DeliveryButtonUI.m_instance = null;
        }
    }

    /* ===== 버튼 관리 메서드 ===== */

    /**
     * 배달 버튼 표시 및 콜백 등록
     * @param deliveryAction 버튼 클릭 시 실행할 배달 함수
     */
    public ShowDeliveryButton(deliveryAction: () => void): void {
        // 배달 액션 저장
        this.currentDeliveryAction = deliveryAction;

        // 버튼 표시
        if (this.buttonObject) {
            this.buttonObject.SetActive(true);
        } else if (this.deliveryButton) {
            this.deliveryButton.gameObject.SetActive(true);
        }

        console.log('[DeliveryButtonUI] 배달 버튼 표시');
    }

    /**
     * 배달 버튼 숨김
     */
    public HideButton(): void {
        // 배달 액션 초기화
        this.currentDeliveryAction = null;

        // 버튼 숨김
        if (this.buttonObject) {
            this.buttonObject.SetActive(false);
        } else if (this.deliveryButton) {
            this.deliveryButton.gameObject.SetActive(false);
        }

        console.log('[DeliveryButtonUI] 배달 버튼 숨김');
    }

    /**
     * 버튼이 표시 중인지 확인
     */
    public IsVisible(): boolean {
        if (this.buttonObject) {
            return this.buttonObject.activeSelf;
        } else if (this.deliveryButton) {
            return this.deliveryButton.gameObject.activeSelf;
        }
        return false;
    }

    /* ===== 버튼 이벤트 ===== */

    /**
     * 배달 버튼 클릭 시 호출
     */
    private OnButtonClicked(): void {
        console.log('[DeliveryButtonUI] 배달 버튼 클릭!');

        // 효과음 재생
        this.PlayClickSound();

        // 등록된 배달 액션 실행
        if (this.currentDeliveryAction) {
            this.currentDeliveryAction();
        } else {
            console.warn('[DeliveryButtonUI] 배달 액션이 등록되지 않았습니다!');
        }
    }

    /**
     * 클릭 효과음 재생
     */
    private PlayClickSound(): void {
        if (this.clickSound && this.audioSource) {
            this.audioSource.PlayOneShot(this.clickSound, this.soundVolume);
            console.log('[DeliveryButtonUI] 클릭 효과음 재생');
        }
    }

    /* ===== Public 메서드 ===== */

    /**
     * 버튼 활성화/비활성화
     */
    public SetButtonInteractable(interactable: boolean): void {
        if (this.deliveryButton) {
            this.deliveryButton.interactable = interactable;
        }
    }

    /**
     * 버튼 텍스트 변경 (TextMeshPro 사용 시)
     */
    public SetButtonText(text: string): void {
        if (this.buttonText) {
            this.buttonText.text = text;
        }
    }

    /**
     * 효과음 볼륨 설정
     */
    public SetSoundVolume(volume: number): void {
        this.soundVolume = Math.max(0, Math.min(1, volume)); // 0~1 사이로 제한
        if (this.audioSource) {
            this.audioSource.volume = this.soundVolume;
        }
    }

    /**
     * 효과음 클립 변경
     */
    public SetClickSound(sound: AudioClip): void {
        this.clickSound = sound;
    }

    /* ===== Singleton (선택사항) ===== */
    private static m_instance: DeliveryButtonUI = null;

    public static get instance(): DeliveryButtonUI {
        if (this.m_instance === null) {
            this.m_instance = GameObject.FindObjectOfType<DeliveryButtonUI>();
        }
        return this.m_instance;
    }
}
