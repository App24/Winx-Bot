import { BotUser } from "../BotClient";
import { Localisation } from "../localisation";

export=()=>{
    BotUser.on("shardReady", (shardId)=>{
        console.log(Localisation.getTranslation("shard.ready", shardId));
    });
}