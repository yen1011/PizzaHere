import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject } from 'UnityEngine'
import { GetRangeRankResponse, SetScoreResponse, LeaderboardAPI, ResetRule } from 'ZEPETO.Script.Leaderboard'

export default class LeaderboardManager extends ZepetoScriptBehaviour {

    // 싱글톤 인스턴스 추가
    private static m_instance: LeaderboardManager = null;
    public static get instance(): LeaderboardManager {
        if (this.m_instance === null) {
            this.m_instance = GameObject.FindObjectOfType<LeaderboardManager>();
        }
        return this.m_instance;
    }

    public leaderboardId: string = "8768c315-7244-4abc-acdf-2460cd7e8a3a";

    public SetScore(score: number) {
        // 공식 가이드의 호출 형식을 엄격히 따릅니다.
        LeaderboardAPI.SetScore(this.leaderboardId, score, 
            (result: SetScoreResponse) => {
                console.log(`[Leaderboard] 등록 결과: ${result.isSuccess}`);
            }, 
            (error: string) => {
                console.error(`[Leaderboard] 등록 에러: ${error}`);
            }
        );
    }

    public GetRankings() {
        // 공식 가이드의 GetRangeRank 형식을 따릅니다.
        LeaderboardAPI.GetRangeRank(this.leaderboardId, 1, 10, ResetRule.none, false, 
            (result: GetRangeRankResponse) => {
                if (result.rankInfo && result.rankInfo.rankList) {
                    for (let i = 0; i < result.rankInfo.rankList.length; ++i) {
                        const rank = result.rankInfo.rankList.get_Item(i);
                        console.log(`순위: ${rank.rank}, 점수: ${rank.score}`);
                    }
                }
            }, 
            (error: string) => {
                console.error(`[Leaderboard] 조회 에러: ${error}`);
            }
        );
    }

    private Awake() {
        if (LeaderboardManager.m_instance !== null && LeaderboardManager.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            LeaderboardManager.m_instance = this;
        }
    }
}