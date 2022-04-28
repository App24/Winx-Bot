export class SuggestionStruct {
    public userId: string;
    public request: string;
    public state: SuggestionState;
}

export enum SuggestionState {
    Rejected = "rejected",
    Completed = "completed",
    Non = "non"
}