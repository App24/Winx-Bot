import { ShardingManager } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const manager=new ShardingManager("dist/bot.js",
    {
        execArgv: ["--trace-warnings"],
        shardArgs: ["--ansi", "--color"],
        token: process.env.TOKEN
    });

manager.on("shardCreate", shard=>console.log(`Launched shard ${shard.id}`));
manager.spawn();