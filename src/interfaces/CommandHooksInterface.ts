export interface CommandHook {
    (...args: any[]): void | Promise<void>;
}

export interface HookConfig {
    callback: CommandHook;
    command?: string;  // Commande spécifique sur laquelle le hook doit s'exécuter
}

export default interface CommandHooksInterface {
    beforeAll: HookConfig[];
    afterAll: HookConfig[];
    beforeCommand: HookConfig[];
    afterCommand: HookConfig[];
    onError: HookConfig[];
}
