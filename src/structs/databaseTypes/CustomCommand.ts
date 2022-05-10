import { CommandAccess } from "../CommandAccess";

export class CustomCommand {
    public name: string;
    public description: string;
    public access: CommandAccess;
    public outputs: string[];
}