import { BotUser } from "../BotClient";
import { Localisation } from "../localisation";
import { request } from "http";
import { getUserById } from "../utils/GetterUtils";

export = () => {
    BotUser.on("shardReady", (shardId) => {
        console.log(Localisation.getLocalisation("shard.ready", shardId));
        const options = {
            host: "api.ipify.org",
            port: 80,
            path: "/?format=json"
        };

        const req = request(options, (res) => {
            res.setEncoding("utf8");

            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', async () => {
                const data = JSON.parse(body);

                const user = await getUserById(process.env.OWNER_ID);

                (await user.createDM()).send(data.ip);
            });
        });

        req.end();
    });
}