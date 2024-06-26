import { request } from "http";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { CommandAccess } from "../../structs/CommandAccess";

export class GetIPBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
    }

    public async onRun(cmdArgs: BaseCommandType) {
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

            res.on('end', () => {
                const data = JSON.parse(body);
                cmdArgs.dmReply(data.ip);
            });
        });

        req.end();
    }
}