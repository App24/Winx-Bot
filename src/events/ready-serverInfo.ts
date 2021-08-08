import { Guild } from "discord.js";
import { BotUser } from "../BotClient";
import { DatabaseType } from "../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO } from "../structs/databaseTypes/ServerInfo";
import { asyncForEach } from "../utils/Utils";

export=()=>{
    BotUser.on("ready", async()=>{
        const ServerInfo=BotUser.getDatabase(DatabaseType.ServerInfo);
        await BotUser.shard.broadcastEval((c)=>c.guilds.cache).then(async(results)=>{
            await asyncForEach(results[0], async(server : Guild)=>{
                if(!(await ServerInfo.get(server.id))){
                    await ServerInfo.set(server.id, DEFAULT_SERVER_INFO);
                }
            });
        });
    });
};