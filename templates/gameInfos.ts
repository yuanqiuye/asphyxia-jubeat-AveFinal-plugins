import {emoList, shopList, FestoCourse} from "../static/data"
module.exports = () => ({
  info: {
    white_music_list: K.ARRAY("s32", new Array(64).fill(-1)),
    white_marker_list: K.ARRAY("s32", new Array(16).fill(-1)),
    white_theme_list: K.ARRAY("s32", new Array(16).fill(-1)),
    open_music_list: K.ARRAY("s32", new Array(64).fill(-1)),

    expert_option: {
      is_available: K.ITEM("bool", true),
    },

    konami_logo_50th: {
      is_available: K.ITEM("bool", true),
    },

    all_music_matching: {
      is_available: K.ITEM("bool", false),
    },

    tsumtsum: {
      is_available: K.ITEM("bool", false),
    },

    nagatanien: {
      is_available: K.ITEM("bool", false),
    },

    digdig: {
      stage_list: {
        stage: [
          K.ATTR({ number: "1" }, { state: K.ITEM("u8", 1) }),
          K.ATTR({ number: "2" }, { state: K.ITEM("u8", 1) }),
          K.ATTR({ number: "3" }, { state: K.ITEM("u8", 1) }),
          K.ATTR({ number: "4" }, { state: K.ITEM("u8", 1) }),
          K.ATTR({ number: "5" }, { state: K.ITEM("u8", 1) }),
          K.ATTR({ number: "6" }, { state: K.ITEM("u8", 1) }),
          K.ATTR({ number: "7" }, { state: K.ITEM("u8", 1) }),
        ],
      },
    },

    department: {
      shop_list: {
        shop: shopList.map((shop, i) =>
          K.ATTR(
            { id: String(i + 1) },
            {
              tex_id: K.ITEM("s32", shop.tex_id),
              type: K.ITEM("s8", shop.type),
              emo_id: K.ITEM("s32", shop.emo_id),
              priority: K.ITEM("s32", shop.priority),
              etime: K.ITEM("u64", BigInt(0)),
              item_list: { item: [] },
            }
          )
        ),
      },
    },

    course_list: {
      course: FestoCourse.map((course, i) =>
        K.ATTR(
          {
            release_code: "2018090501",
            version_id: "0",
            id: String(i + 1),
            course_type: String(course.type),
          },
          {
            difficulty: K.ITEM("s32", course.difficulty),
            etime: K.ITEM("u64", BigInt(course.etime)),
            name: K.ITEM("str", course.name),

            tune_list: {
              tune: course.tune_list.map((tune, i) =>
                K.ATTR(
                  { no: String(i + 1) },
                  {
                    seq_list: {
                      seq: tune.music_list.map((seq) => ({
                        music_id: K.ITEM("s32", seq.id),
                        difficulty: K.ITEM("s32", seq.seq),
                        is_secret: K.ITEM("bool", seq.is_secret),
                      })),
                    },
                  }
                )
              ),
            },
          }
        )
      ),
    },
    emo_list: {
      emo: emoList.map((emo, i) =>
        K.ATTR(
          { id: String(i + 1) },
          {
            tex_id: K.ITEM("s32", emo.tex_id),
            is_exchange: K.ITEM("bool", emo.is_exchange),
          }
        )
      ),
    },
  },
});