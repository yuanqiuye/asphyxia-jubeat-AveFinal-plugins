import ShopInfo from "./routes/shopinfo";
import {getProfile, Getinfo, loadScore, Meeting} from "./routes/gametop";
import { saveProfile, Final } from "./routes/gameend";
import {Check, Entry, Refresh, Report} from "./routes/lobby";
export function register() {
    if (CORE_VERSION_MAJOR <= 1 && CORE_VERSION_MINOR < 31) {
      console.error("The current version of Asphyxia Core is not supported. Requires version '1.31' or later.");
      return;
    }

    R.GameCode("L44");
  
    R.Route("gametop.regist",getProfile);
    R.Route("gametop.get_info", Getinfo);
    R.Route("gametop.get_pdata", getProfile);
    R.Route("gametop.get_mdata", loadScore);
    //R.Route("gametop.get_course", getCourse);
    R.Route("gametop.get_meeting", Meeting);
    //R.Route("gametop.get_collabo", getCollabo);
  
    R.Route("gameend.final", Final);
    R.Route("gameend.regist", saveProfile);
    //R.Route("gameend.log", true);
    //R.Route("gameend.set_collabo", true);
  
    R.Route("shopinfo.regist", ShopInfo);
    /*R.Route("demodata.get_news", demodata.getNews);
    R.Route("demodata.get_data", demodata.getData);
    R.Route("demodata.get_hitchart", demodata.getHitchart);*/
    R.Route("lobby.check", Check);
    R.Route("lobby.entry", Entry);
    R.Route("lobby.refresh", Refresh);
    R.Route("lobby.report", Report);
  
    R.Route("netlog.send", true);
    R.Route("logger.report", true);
    R.Unhandled();
  }