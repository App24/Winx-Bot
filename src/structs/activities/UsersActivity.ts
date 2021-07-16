import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Activity } from "./Activity";

export class UsersActivity extends Activity{
    public async getActivity() : Promise<string>{
        const numUsers=await BotUser.shard.broadcastEval('this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)').then(results=>{
            return results[0];
        });
        return Localisation.getTranslation("activity.users", numUsers);
    }
}