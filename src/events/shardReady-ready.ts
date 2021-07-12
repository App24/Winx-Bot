import { BotUser } from "../BotClient";

export=()=>{
    BotUser.on("shardReady", (shardId)=>{
        console.log(`Shard ${shardId} is ready!`);
    });
}