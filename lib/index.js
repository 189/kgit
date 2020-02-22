"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
// see https://git-scm.com/docs/git-status
const UNMERGE_STATUS = ["DD", "AU", "UA", "UD", "DU", "AA", "UU"];
;
exports.execCommand = function (command, cwd) {
    return new Promise((resolve, reject) => {
        child_process_1.exec(command, {
            cwd,
            maxBuffer: 20 * 1024 * 1024
        }, (err, stdout, stderr) => {
            if (err) {
                reject(stderr);
            }
            else {
                resolve(stdout || stderr);
            }
        });
    });
};
exports.getCurrentBranch = function (repoDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield exports.execCommand("git rev-parse --abbrev-ref HEAD", repoDirPath)).trim();
    });
};
exports.forceChangeBranch = function (repoDirPath, branchName) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentBranch = yield exports.getCurrentBranch(repoDirPath);
        if (currentBranch === branchName) {
            return Promise.resolve("");
        }
        return exports.execCommand(`git checkout ${branchName} -f`, repoDirPath);
    });
};
exports.resetHard = function (repoDirPath, toPoint) {
    return exports.execCommand(`git reset --hard ${toPoint}`, repoDirPath);
};
exports.cleanCurrentBranch = function (repoDirPath) {
    return exports.execCommand(`git clean -f`, repoDirPath);
};
exports.pullCurrentBranch = function (repoDirPath) {
    return exports.execCommand(`git pull`, repoDirPath);
};
const isNeedCommit = function (repoDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const content = yield exports.execCommand("git status --porcelain", repoDirPath);
        return content.trim() !== "";
    });
};
const checkIsPushSuccess = function (repoDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentBranch = yield exports.getCurrentBranch(repoDirPath);
        const localRev = (yield exports.execCommand(`git rev-parse --verify ${currentBranch}`, repoDirPath)).trim();
        const remoteRev = (yield exports.execCommand(`git rev-parse --verify origin/${currentBranch}`, repoDirPath)).trim();
        return localRev === remoteRev;
    });
};
exports.clearGitRepo = function (repoDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        yield exports.resetHard(repoDirPath, "HEAD~5");
        yield exports.cleanCurrentBranch(repoDirPath);
        yield exports.pullCurrentBranch(repoDirPath);
    });
};
function buildChecker(conditions) {
    conditions = typeof conditions === "string" ? [conditions] : conditions;
    const regArray = conditions.map((condition) => (new RegExp(`\\.${condition}$`)));
    return function (files) {
        return files.filter((file) => (regArray.some((reg) => (reg.test(file)))));
    };
}
exports.submitCommit = function (repoDirPath, commitMessage, modifyFileChecker) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield isNeedCommit(repoDirPath)) {
            modifyFileChecker = typeof modifyFileChecker !== "function" && typeof modifyFileChecker !== "undefined" ? buildChecker(modifyFileChecker) : modifyFileChecker;
            const out = yield exports.execCommand("git diff --name-only --diff-filter=M", repoDirPath);
            const files = out.replace(/\s+$/, "").split("\n");
            const modifiedFiles = typeof modifyFileChecker !== "undefined" ? modifyFileChecker(files) : [];
            if (modifiedFiles.length > 0) {
                throw new Error(`files can not be modified: ${modifiedFiles.join(",")}`);
            }
            yield exports.execCommand("git add -A", repoDirPath);
            yield exports.execCommand(`git commit -m "${commitMessage.replace(/"/g, `\\"`)}"`, repoDirPath);
        }
        const isSameWithRemote = yield checkIsPushSuccess(repoDirPath);
        if (!isSameWithRemote) {
            yield exports.execCommand(`git push`, repoDirPath);
        }
        return yield checkIsPushSuccess(repoDirPath);
    });
};
/**
 *
 * @param repoDirPath 仓库路径
 * @returns ["状态 文件1", "状态 文件2", ...]
 */
exports.status = function (repoDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let content = yield exports.execCommand("git status --porcelain", repoDirPath);
        content = content.replace("\r", "").trim();
        return content === "" ? [] : content.split("\n");
    });
};
/**
 *
 * @param repoDirPath 仓库路径
 * @returns {[状态]: [文件] } 如  { "M" : [...], "A" : [...], "UU" : [...] } | ""
 */
exports.transferStatus = function (repoDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield exports.status(repoDirPath), ret = {};
        results.length && results.forEach(function (result) {
            const [mark, file] = result.trim().replace(/\s+/g, " ").split(" ");
            ret[mark] = ret[mark] || [];
            ret[mark].push(file);
        });
        return results.length ? ret : "";
    });
};
/**
 *
 * @param repoDirPath 仓库路径
 * @returns 当前仓库是否未修改
 */
exports.isUnmodified = function (repoDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield !isNeedCommit(repoDirPath);
    });
};
/**
 *
 * @param repoDirPath 仓库地址
 * @returns 是否有冲突
 */
exports.hasConflict = function (repoDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const status = yield exports.transferStatus(repoDirPath);
        return status === "" ? false : UNMERGE_STATUS.some(function (mergeStatus) {
            return Array.isArray(status[mergeStatus]) && status[mergeStatus].length > 0;
        });
    });
};
