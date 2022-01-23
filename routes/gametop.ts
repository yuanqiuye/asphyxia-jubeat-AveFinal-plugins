import Profile from "../models/profile";
import Shopinfo from "./shopinfo";
import { Score } from "../models/score";

export const getProfile = async (info: EamuseInfo, data: any, send: EamuseSend) => {
    console.dir("start!");
    let refId = $(data).str("data.player.refid");
    const name = $(data).str("data.player.name");

    console.dir(data, {depth:null});
    if (!refId) return send.deny();

    let profile = await DB.FindOne<Profile>(refId, { collection: "profile" });
    
    if (!profile && name) {
        const newProfile: Profile = {
          collection: "profile",
          jubeatId: Math.round(Math.random() * 99999999),
          name: name,
          isFirstplay: true,
          emo: [],
          lastShopname: "",
          lastAreaname: ""
        };
    
        await DB.Upsert<Profile>(refId, { collection: "profile" }, newProfile);
    
        profile = newProfile;
    }else if (!profile && !name) {
        return send.deny();
      }
    
    return send.object({
        data: {
            ...require("../templates/gameInfos.ts")(),

            player: {
                
                jid: K.ITEM("s32", profile.jubeatId),
                session_id: K.ITEM("s32", 1),
                name: K.ITEM("str", profile.name),
                event_flag: K.ITEM("u64", BigInt(0)),

                ...require("../templates/profiles.ts")(profile),

            }
        }
    }, {compress: true}
    );
};

export const Getinfo = (info: EamuseInfo, data: any, send: EamuseSend) =>{
  console.dir(data, {depth:null});
  send.object({ data: require("../templates/gameInfos")() }, { compress: true });
}

export const loadScore = async (info, data, send) => {
  console.dir(data,{depth:null});
  const mdata_ver = $(data).number("data.player.mdata_ver");
  const jubeatId = $(data).number("data.player.jid");
  if (!jubeatId) return send.deny();

  const profile = await DB.FindOne<Profile>(null, { collection: "profile", jubeatId });
  if (!profile) return send.deny();

  const scores = await DB.Find<Score>(profile.__refid, { collection: "score" });
  const scoreData: { [musicId: number]: { musicRate: number[], score: number[], clear: number[], playCnt: number[], clearCnt: number[], fcCnt: number[], exCnt: number[], bar: number[][] } } = {};

  for (const score of scores) {
    if (!scoreData[score.musicId]) {
      scoreData[score.musicId] = {
        musicRate: [0, 0, 0],
        playCnt: [0, 0, 0],
        clearCnt: [0, 0, 0],
        fcCnt: [0, 0, 0],
        exCnt: [0, 0, 0],
        clear: [0, 0, 0],
        score: [0, 0, 0],
        bar: [Array(30).fill(0), Array(30).fill(0), Array(30).fill(0)]
      };
    }

    const data = scoreData[score.musicId];
    data.musicRate[score.seq] = score.musicRate;
    data.playCnt[score.seq] = score.playCount;
    data.clearCnt[score.seq] = score.clearCount;
    data.fcCnt[score.seq] = score.fullcomboCount;
    data.exCnt[score.seq] = score.excellentCount;
    data.clear[score.seq] = score.clear;
    data.score[score.seq] = score.score;
    data.bar[score.seq] = score.bar;
  }

  var sendobj = {
    data: {
      player: {
        jid: K.ITEM("s32", jubeatId),

        mdata_list: {
            music: Object.keys(scoreData).map(musicId => K.ATTR({ music_id: String(musicId) }, {
              normal:{
                score: K.ARRAY("s32", scoreData[musicId].score),
                clear: K.ARRAY("s8", scoreData[musicId].clear),
                music_rate: K.ARRAY("s32", scoreData[musicId].musicRate),
                play_cnt: K.ARRAY("s32", scoreData[musicId].playCnt),
                clear_cnt: K.ARRAY("s32", scoreData[musicId].clearCnt),
                fc_cnt: K.ARRAY("s32", scoreData[musicId].fcCnt),
                ex_cnt: K.ARRAY("s32", scoreData[musicId].exCnt),
                bar: scoreData[musicId].bar.map((bar, seq) => K.ARRAY("u8", bar, { seq: String(seq) }))
              }
            }))
          }
        
      }
    }
  };
  if(mdata_ver!=1){
    sendobj = {
      data:{
        player:{
          jid: K.ITEM("s32", jubeatId),
          mdata_list: []
        }
      }
    }
  };
  console.dir(sendobj, {depth:null});
  return send.object(sendobj, {compress:true});
}

export const Meeting = (req: EamuseInfo, data: any, send: EamuseSend) => {
  return send.object({
    data: {
      meeting: {
        single: K.ATTR({ count: "0" }),
      },
      reward: {
        total: K.ITEM("s32", 0),
        point: K.ITEM("s32", 0),
      },
    },
  }, {compress:true});
};
