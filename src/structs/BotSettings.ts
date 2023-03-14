import { readFileSync } from "fs";

export class BotSettings {
    public readonly cardGifsEnabled: boolean;
    public readonly commands: { name: string, enabled: boolean }[];

    public static getSettings(): BotSettings {
        const jsonData: any = readFileSync("botOptions.json");
        const botOptions = JSON.parse(jsonData);
        return botOptions;
    }
}