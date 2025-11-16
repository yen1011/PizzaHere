import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Time, Mathf, GameObject } from 'UnityEngine';
import { UnityEvent } from 'UnityEngine.Events';
import { TextMeshProUGUI } from 'TMPro';
import ResultUI from './ResultUI';

/**
 * 2분 게임 타이머 시스템
 * - 게임 시작부터 종료까지 시간 관리
 * - 타이머 종료 시 ResultUI 표시
 */
export default class GameTimer extends ZepetoScriptBehaviour {

    /* ===== Timer Settings ===== */
    // 게임 지속 시간 (초)
    public gameDuration: number = 120.0; // 2분 = 120초

    // 시작 시 자동으로 타이머 시작 (false로 변경 - 게임 시작 버튼으로 시작)
    public startOnAwake: boolean = false;

    /* ===== UI References ===== */
    @SerializeField()
    private timerText: TextMeshProUGUI;

    /* ===== Events ===== */
    private _onTimerStart: UnityEvent;
    public get OnTimerStart(): UnityEvent {
        if (!this._onTimerStart) {
            this._onTimerStart = new UnityEvent();
        }
        return this._onTimerStart;
    }

    private _onTimerEnd: UnityEvent;
    public get OnTimerEnd(): UnityEvent {
        if (!this._onTimerEnd) {
            this._onTimerEnd = new UnityEvent();
        }
        return this._onTimerEnd;
    }

    private _onTimerTick: UnityEvent;
    public get OnTimerTick(): UnityEvent {
        if (!this._onTimerTick) {
            this._onTimerTick = new UnityEvent();
        }
        return this._onTimerTick;
    }

    /* ===== Private 변수 ===== */
    private timeRemaining: number = 0;
    private isRunning: boolean = false;
    private isFinished: boolean = false;
    private lastSecond: number = 0;

    private resultUI: ResultUI;

    /* ===== Properties (Getter) ===== */
    public get TimeRemaining(): number {
        return this.timeRemaining;
    }

    public get GameDuration(): number {
        return this.gameDuration;
    }

    public get IsRunning(): boolean {
        return this.isRunning;
    }

    public get IsFinished(): boolean {
        return this.isFinished;
    }

    /* ===== Unity Lifecycle ===== */
    private Start() {
        this.timeRemaining = this.gameDuration;
        this.lastSecond = Mathf.Ceil(this.timeRemaining);

        // ResultUI 찾기
        this.resultUI = ResultUI.instance;

        if (this.startOnAwake) {
            this.StartTimer();
        } else {
            this.UpdateTimerDisplay();
        }

        console.log('[GameTimer] 초기화 완료');
    }

    private Update() {
        if (!this.isRunning || this.isFinished) {
            return;
        }

        // 카운트다운
        this.timeRemaining -= Time.deltaTime;

        // 타이머 종료 체크
        if (this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            this.FinishTimer();
        }

        // UI 업데이트
        this.UpdateTimerDisplay();

        // 매 초마다 Tick 이벤트 발생
        const currentSecond = Mathf.Ceil(this.timeRemaining);
        if (currentSecond < this.lastSecond) {
            this.lastSecond = currentSecond;
            this.OnTimerTick?.Invoke();
        }
    }

    /* ===== 타이머 제어 메서드 ===== */

    /**
     * 타이머 시작
     */
    public StartTimer(): void {
        console.log('[GameTimer] StartTimer() 호출됨');
        console.log(`[GameTimer] 현재 상태 - isRunning: ${this.isRunning}, isFinished: ${this.isFinished}`);

        if (this.isRunning) {
            console.warn('[GameTimer] 타이머가 이미 실행 중입니다!');
            return;
        }

        this.timeRemaining = this.gameDuration;
        this.lastSecond = Mathf.Ceil(this.timeRemaining);
        this.isRunning = true;
        this.isFinished = false;

        console.log('[GameTimer] isRunning을 true로 설정함');

        this.OnTimerStart?.Invoke();
        console.log(`[GameTimer] 타이머 시작! (${this.gameDuration}초)`);
    }

    /**
     * 타이머 일시정지
     */
    public PauseTimer(): void {
        this.isRunning = false;
        console.log('[GameTimer] 타이머 일시정지');
    }

    /**
     * 타이머 재개
     */
    public ResumeTimer(): void {
        if (this.isFinished) {
            console.warn('[GameTimer] 종료된 타이머는 재개할 수 없습니다!');
            return;
        }

        this.isRunning = true;
        console.log('[GameTimer] 타이머 재개');
    }

    /**
     * 타이머 리셋 (재시작)
     */
    public ResetTimer(): void {
        this.timeRemaining = this.gameDuration;
        this.lastSecond = Mathf.Ceil(this.timeRemaining);
        this.isRunning = false;
        this.isFinished = false;

        this.UpdateTimerDisplay();
        console.log('[GameTimer] 타이머 리셋');
    }

    /**
     * 타이머 종료 처리
     */
    private FinishTimer(): void {
        this.isRunning = false;
        this.isFinished = true;

        console.log('[GameTimer] 타이머 종료! 게임 끝!');

        // OnTimerEnd 이벤트 발생
        this.OnTimerEnd?.Invoke();

        // ResultUI 표시
        if (this.resultUI) {
            this.resultUI.ShowResult();
        } else {
            console.warn('[GameTimer] ResultUI를 찾을 수 없습니다!');
        }
    }

    /* ===== UI 업데이트 ===== */

    /**
     * 타이머 UI 업데이트 (mm:ss 형식)
     */
    private UpdateTimerDisplay(): void {
        if (!this.timerText) return;

        const minutes = Mathf.FloorToInt(this.timeRemaining / 60);
        const seconds = Mathf.FloorToInt(this.timeRemaining % 60);

        // mm:ss 형식으로 표시
        const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
        const secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`;

        this.timerText.text = `${minutesStr}:${secondsStr}`;
    }

    /**
     * 타이머 텍스트 레퍼런스 설정
     */
    public SetTimerText(text: TextMeshProUGUI): void {
        this.timerText = text;
        this.UpdateTimerDisplay();
    }

    /**
     * 남은 시간을 문자열로 반환
     */
    public GetTimeString(): string {
        const minutes = Mathf.FloorToInt(this.timeRemaining / 60);
        const seconds = Mathf.FloorToInt(this.timeRemaining % 60);

        const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
        const secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`;

        return `${minutesStr}:${secondsStr}`;
    }

    /* ===== Singleton (선택사항) ===== */
    private static m_instance: GameTimer = null;

    public static get instance(): GameTimer {
        if (this.m_instance === null) {
            const go = GameObject.FindObjectOfType<GameTimer>();
            if (go) {
                this.m_instance = go;
            }
        }
        return this.m_instance;
    }

    private Awake() {
        // 싱글톤 설정
        if (GameTimer.m_instance !== null && GameTimer.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            GameTimer.m_instance = this;
        }
    }

    private OnDestroy() {
        // 싱글톤 인스턴스 정리
        if (GameTimer.m_instance === this) {
            GameTimer.m_instance = null;
        }
    }
}
