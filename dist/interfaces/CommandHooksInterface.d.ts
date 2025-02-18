export interface CommandHook {
    (...args: any[]): void | Promise<void>;
}
export default interface CommandHooksInterface {
    beforeAll?: CommandHook[];
    afterAll?: CommandHook[];
    beforeCommand?: CommandHook[];
    afterCommand?: CommandHook[];
    onError?: CommandHook[];
}
