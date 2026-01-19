import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { GameObject, Vector3, Quaternion } from 'UnityEngine';
import { TextMeshProUGUI } from 'TMPro';
import { Button } from 'UnityEngine.UI'; 
import { GetRangeRankResponse, LeaderboardAPI, ResetRule } from 'ZEPETO.Script.Leaderboard';
import { ZepetoWorldHelper } from 'ZEPETO.World'; 
import ResultUI from './ResultUI'; 

export default class LeaderboardUI extends ZepetoScriptBehaviour {

    @SerializeField() private leaderboardId: string = "9769c3f5-7244-4abb-acdf-2468bd7e6a18";
    @SerializeField() private uiParent: GameObject; 
    @SerializeField() private rankItemPrefab: GameObject; 
    @SerializeField() private retryButton: Button; 
    @SerializeField() private leaderboardPanel: GameObject; 

    private static m_instance: LeaderboardUI = null;
    public static get instance(): LeaderboardUI {
        if (this.m_instance === null) {
            this.m_instance = GameObject.FindObjectOfType<LeaderboardUI>();
        }
        return this.m_instance;
    }

    private Awake() {
        if (LeaderboardUI.m_instance !== null && LeaderboardUI.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            LeaderboardUI.m_instance = this;
        }
    }

    private Start() {
        if (this.retryButton) {
            this.retryButton.onClick.AddListener(() => this.OnRetryButtonClicked());
        }
    }

    private OnRetryButtonClicked() {
        if (this.leaderboardPanel) this.leaderboardPanel.SetActive(false);
        if (ResultUI.instance) ResultUI.instance.RestartGame();
    }

    public ShowLeaderboard(): void {
        if (this.leaderboardPanel) this.leaderboardPanel.SetActive(true);
        this.RefreshRankings();
    }

    private RefreshRankings() {
        for (let i = this.uiParent.transform.childCount - 1; i >= 0; i--) {
            GameObject.Destroy(this.uiParent.transform.GetChild(i).gameObject);
        }

        LeaderboardAPI.GetRangeRank(this.leaderboardId, 1, 10, ResetRule.none, false, 
            (result: GetRangeRankResponse) => {
                if (result.isSuccess && result.rankInfo && result.rankInfo.rankList) {
                    const listCount = result.rankInfo.rankList.length;
                    for (let i = 0; i < listCount; ++i) {
                        const rankData = result.rankInfo.rankList.get_Item(i);
                        this.CreateRankRow(rankData.rank, rankData.member, rankData.score);
                    }
                }
            }, 
            (error: string) => {
                console.error(`[LeaderboardUI] 데이터 로드 실패: ${error}`);
            }
        );
    }

    private CreateRankRow(rank: number, userId: string, score: number) {
        if (!this.rankItemPrefab) return;

        // 프리팹 생성 및 초기화
        const row = GameObject.Instantiate(this.rankItemPrefab, this.uiParent.transform) as GameObject;
        row.transform.localPosition = Vector3.zero;
        row.transform.localScale = Vector3.one;

        // 자식 오브젝트의 이름을 기준으로 TMP 컴포넌트를 직접 찾습니다.
        const allTexts = row.GetComponentsInChildren<TextMeshProUGUI>();
        let rankTxt: TextMeshProUGUI;
        let nameTxt: TextMeshProUGUI;
        let scoreTxt: TextMeshProUGUI;

        allTexts.forEach(t => {
            if (t.name === "RankText") rankTxt = t;
            if (t.name === "NameText") nameTxt = t;
            if (t.name === "ScoreText") scoreTxt = t;
        });

        // 1. 순위 데이터 할당
        if (rankTxt) {
            rankTxt.text = rank.toString();
        } else {
            console.warn("[LeaderboardUI] RankText라는 이름의 TMP를 찾을 수 없습니다.");
        }

        // 2. 점수 데이터 할당 (화폐 기호 추가 가능)
        if (scoreTxt) {
            scoreTxt.text = `₩ ${score.toString()}`;
        }

        // 3. 닉네임 변환 및 할당
        if (nameTxt) {
            nameTxt.text = "Loading...";
            ZepetoWorldHelper.GetUserInfo([userId], (info) => {
                if (info && info.length > 0) {
                    nameTxt.text = info[0].name;
                }
            }, (error) => {
                nameTxt.text = userId;
            });
        }
    }
}