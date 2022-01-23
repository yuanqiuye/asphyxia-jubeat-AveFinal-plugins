import {Score} from "../models/score"

export const saveProfile = async (info, {data}, send) => {
    console.log(U.toXML({
        call: K.ATTR({ model: info.model }, {
          [info.module]: K.ATTR({ method: info.method }, { data })
        })
    }));
    console.dir(data, {depth:null});
    const refId = $(data).str("player.refid");
    if (!refId) return send.deny();

    const profile = await DB.FindOne<Profile>(refId, { collection: "profile" });
    if (!profile) return send.deny();

    let lastMarker = 0;
    let lastTheme = 0;
    let lastTitle = 0;
    let lastParts = 0;
    let lastSort = 0;
    let lastFilter = 0;
    let lastCategory = 0;
    let lastMselStat = 0;
  
    const result = $(data).element("result");

    if (result) {
        var tunes = result.elements("tune");
        var historys = {};
        var historyNode = $(data).elements("player.history.tune");
    
        if (historyNode) {
          for (const history of historyNode) {
            historys[history.attr().log_id] = {
              timestamp: history.bigint("timestamp"),
              isHard: history.bool("player.result.is_hard_mode")
            };
          }
        }
    }

    for (const tune of tunes) {
        const tuneId = tune.attr().id;
  
        profile.musicId = tune.number("music");
        profile.seqId = parseInt(tune.attr("player.score").seq);

        await updateScore(refId, {
          bestmusicRate: tune.number("player.best_music_rate"),
          musicRate: tune.number("player.music_rate"),
          musicId: tune.number("music"),
          seq: parseInt(tune.attr("player.score").seq),
          score: tune.number("player.score"),
          clear: parseInt(tune.attr("player.score").clear),
          isHard: tune.bool("player.is_hard_mode"),
          bestScore: tune.number("player.best_score"),
          bestClear: tune.number("player.best_clear"),
          playCount: tune.number("player.play_cnt"),
          clearCount: tune.number("player.clear_cnt"),
          fullcomboCount: tune.number("player.fc_cnt"),
          excellentCount: tune.number("player.ex_cnt"),
          ...tune.element("player.mbar") && { mbar: tune.numbers("player.mbar") }
        });
    }
    
    lastMarker = $(data).number("player.last.settings.marker");
    lastTheme = $(data).number("player.last.settings.theme");
    lastTitle = $(data).number("player.last.settings.title");
    lastParts = $(data).number("player.last.settings.parts");
    lastSort = $(data).number("player.last.sort");
    lastCategory = $(data).number("player.last.category");
    profile.rankSort = $(data).number("player.last.settings.rank_sort");
    profile.comboDisp = $(data).number("player.last.settings.combo_disp");
  
    profile.lastPlayTime = Number($(data).bigint("info.time_gameend"));
    profile.lastShopname = $(data).str("info.shopname");
    profile.lastAreaname = $(data).str("info.areaname");

    //profile.jubility = $(data).number("player.info.jubility");
    //profile.jubilityYday = $(data).number("player.info.jubility_yday");
    profile.tuneCount = $(data).number("player.info.tune_cnt");
    profile.saveCount = $(data).number("player.info.save_cnt");
    profile.savedCount = $(data).number("player.info.saved_cnt");
    profile.fcCount = $(data).number("player.info.fc_cnt");
    profile.exCount = $(data).number("player.info.ex_cnt");
    profile.clearCount = $(data).number("player.info.clear_cnt");
    profile.matchCount = $(data).number("player.info.match_cnt");
    profile.expertOption = $(data).number("player.last.expert_option");
    profile.matching = $(data).number("player.last.settings.matching");
    profile.hazard =$(data).number("player.last.settings.hazard");
    profile.hard = $(data).number("player.last.settings.hard");
    profile.bonusPoints = $(data).number("player.info.bonus_tune_points");
    profile.isBonusPlayed = $(data).bool("player.info.is_bonus_tune_played");
    profile.totalBestScore = $(data).number("player.info.total_best_score.normal");
    profile.clearMaxLevel = $(data).number("player.info.clear_max_level");
    profile.fcMaxLevel = $(data).number("player.info.fc_max_level");
    profile.exMaxLevel = $(data).number("player.info.ex_max_level");
    profile.navi = Number($(data).bigint("player.navi.flag"));
    profile.marker = lastMarker;
    profile.theme = lastTheme;
    profile.title = lastTitle;
    profile.parts = lastParts;
    profile.sort = lastSort;
    profile.category = lastCategory;

    profile.commuList = $(data).numbers("player.item.commu_list");
    profile.secretList = $(data).numbers("player.item.secret_list");
    profile.themeList = $(data).number("player.item.theme_list");
    profile.markerList = $(data).numbers("player.item.marker_list");
    profile.titleList = $(data).numbers("player.item.title_list");
    profile.partsList = $(data).numbers("player.item.parts_list");
    profile.secretListNew = $(data).numbers("player.item.new.secret_list");
    profile.themeListNew =  $(data).numbers("player.item.new.theme_list");
    profile.markerListNew =  $(data).numbers("player.item.new.marker_list");
    //profile.titleListNew =  $(data).numbers("player.item.new.secret_list");
    console.dir(profile, {depth:null});
    try {
        await DB.Update<Profile>(refId, { collection: "profile" }, profile);
    
        return send.object({
          data: {
            player: { session_id: K.ITEM("s32", 1) },
            collabo: { deller: K.ITEM("s32", 0) }
          }
        }, {compress:true});
      } catch (e) {
        console.error(`Profile save failed: ${e.message}`);
        return send.deny();
      }
}

const updateScore = async (refId: string, data: any): Promise<boolean> => {
    try {
      await DB.Upsert<Score>(refId, {
        collection: "score",
        musicId: data.musicId,
        seq: data.seq,
        isHardMode: data.isHard,
      }, {
        $set: {
          musicId: data.musicId,
          seq: data.seq,
          score: data.bestScore,
          clear: data.bestClear,
          musicRate: data.musicRate>data.bestmusicRate?data.musicRate:data.bestmusicRate,
          ...data.mbar && { bar: data.mbar, },
          playCount: data.playCount,
          clearCount: data.clearCount,
          fullcomboCount: data.fullcomboCount,
          excellentCount: data.excellentCount,
          isHardMode: data.isHard
        }
      });
  
      return true;
    } catch (e) {
      console.error("Score saving failed: ", e.stack);
      return false;
    }
  };

  export const Final = async (req: EamuseInfo, data: any, send: EamuseSend) =>
  send.success({ compress: true });