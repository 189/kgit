declare type ModifyFileChecker = (files: string[]) => string[];
interface Source {
    [propName: string]: any;
}
export declare const execCommand: (command: string, cwd: string) => Promise<string>;
export declare const getCurrentBranch: (repoDirPath: string) => Promise<string>;
export declare const forceChangeBranch: (repoDirPath: string, branchName: string) => Promise<string>;
export declare const resetHard: (repoDirPath: string, toPoint: string) => Promise<string>;
export declare const cleanCurrentBranch: (repoDirPath: string) => Promise<string>;
export declare const pullCurrentBranch: (repoDirPath: string) => Promise<string>;
export declare const clearGitRepo: (repoDirPath: string) => Promise<void>;
export declare const submitCommit: (repoDirPath: string, commitMessage: string, modifyFileChecker?: string | string[] | ModifyFileChecker | undefined) => Promise<boolean>;
/**
 *
 * @param repoDirPath 仓库路径
 * @returns ["状态 文件1", "状态 文件2", ...]
 */
export declare const status: (repoDirPath: string) => Promise<string[]>;
/**
 *
 * @param repoDirPath 仓库路径
 * @returns {[状态]: [文件] } 如  { "M" : [...], "A" : [...], "UU" : [...] } | ""
 */
export declare const transferStatus: (repoDirPath: string) => Promise<Source | "">;
/**
 *
 * @param repoDirPath 仓库路径
 * @returns 当前仓库是否未修改
 */
export declare const isUnmodified: (repoDirPath: string) => Promise<boolean>;
/**
 *
 * @param repoDirPath 仓库地址
 * @returns 是否有冲突
 */
export declare const hasConflict: (repoDirPath: string) => Promise<boolean>;
export {};
