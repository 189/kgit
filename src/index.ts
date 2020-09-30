import { exec } from "child_process";

type UNMERGE = "DD" | "AU" | "UA" | "UD" | "DU" | "AA" | "UU";
type ModifyFileChecker = (files: string[]) => string[];

// see https://git-scm.com/docs/git-status
const UNMERGE_STATUS: UNMERGE[] = ["DD", "AU", "UA", "UD", "DU", "AA", "UU"];
interface Source {
	[propName: string]: any;
};

export const execCommand = function (command: string, cwd: string) {
	return new Promise<string>((resolve, reject) => {
		exec(command, {
			cwd,
			maxBuffer: 20 * 1024 * 1024
		}, (err, stdout, stderr) => {
			if (err) {
				reject(stderr);
			} else {
				resolve(stdout || stderr);
			}
		});
	});
};

export const getCurrentBranch = async function (repoDirPath: string) {
	return (await execCommand("git rev-parse --abbrev-ref HEAD", repoDirPath)).trim();
};

export const forceChangeBranch = async function (repoDirPath: string, branchName: string) {
	const currentBranch = await getCurrentBranch(repoDirPath);
	if (currentBranch === branchName) {
		return Promise.resolve("");
	}
	return execCommand(`git checkout ${branchName} -f`, repoDirPath);
};

export const resetHard = function (repoDirPath: string, toPoint: string) {
	return execCommand(`git reset --hard ${toPoint}`, repoDirPath);
};

export const cleanCurrentBranch = function (repoDirPath: string) {
	return execCommand(`git clean -f`, repoDirPath);
};

export const pullCurrentBranch = function (repoDirPath: string) {
	return execCommand(`git pull`, repoDirPath);
};

const isNeedCommit = async function (repoDirPath: string) {
	const content = await execCommand("git status --porcelain", repoDirPath);
	return content.trim() !== "";
};

const checkIsPushSuccess = async function (repoDirPath: string) {
	const currentBranch = await getCurrentBranch(repoDirPath);
	const localRev = (await execCommand(`git rev-parse --verify ${currentBranch}`, repoDirPath)).trim();
	const remoteRev = (await execCommand(`git rev-parse --verify origin/${currentBranch}`, repoDirPath)).trim();
	return localRev === remoteRev;
};

export const clearGitRepo = async function (repoDirPath: string, toPoint: number = 1) {
	await resetHard(repoDirPath, toPoint ? "HEAD~" + toPoint : "HEAD");
	await cleanCurrentBranch(repoDirPath);
	await pullCurrentBranch(repoDirPath);
};


function buildChecker(conditions: string | string[]) {
	conditions = typeof conditions === "string" ? [conditions] : conditions;
	const regArray = conditions.map((condition) => (new RegExp(`\\.${condition}$`)));
	return function (files: string[]) {
		return files.filter((file) => (regArray.some((reg) => (reg.test(file)))));
	};
}

export const submitCommit = async function (repoDirPath: string, commitMessage: string, modifyFileChecker?: ModifyFileChecker | string | string[]) {
	if (await isNeedCommit(repoDirPath)) {
		modifyFileChecker = typeof modifyFileChecker !== "function" && typeof modifyFileChecker !== "undefined" ? buildChecker(modifyFileChecker) : modifyFileChecker;

		const out = await execCommand("git diff --name-only --diff-filter=M", repoDirPath);
		const files = out.replace(/\s+$/, "").split("\n");
		const modifiedFiles = typeof modifyFileChecker !== "undefined" ? modifyFileChecker(files) : [];

		if (modifiedFiles.length > 0) {
			throw new Error(`files can not be modified: ${modifiedFiles.join(",")}`);
		}
		await execCommand("git add -A", repoDirPath);
		await execCommand(`git commit -m "${commitMessage.replace(/"/g, `\\"`)}"`, repoDirPath);
	}
	const isSameWithRemote = await checkIsPushSuccess(repoDirPath);
	if (!isSameWithRemote) {
		await execCommand(`git push`, repoDirPath);
	}
	return await checkIsPushSuccess(repoDirPath);
};



/**
 * 
 * @param repoDirPath 仓库路径
 * @returns ["状态 文件1", "状态 文件2", ...]
 */
export const status = async function (repoDirPath: string) {
	let content = await execCommand("git status --porcelain", repoDirPath);
	content = content.replace("\r", "").trim();
	return content === "" ? [] : content.split("\n");
}

/**
 * 
 * @param repoDirPath 仓库路径
 * @returns {[状态]: [文件] } 如  { "M" : [...], "A" : [...], "UU" : [...] } | ""
 */
export const transferStatus = async function (repoDirPath: string) {
	const results = await status(repoDirPath), ret: Source = {};
	if (results.length) {
		results.forEach(function (result: string) {
			const [mark, file] = result.trim().replace(/\s+/g, " ").split(" ");
			ret[mark] = ret[mark] || [];
			ret[mark].push(file);
		});
		return ret;
	}
	return "";
}

/**
 * 
 * @param repoDirPath 仓库路径
 * @returns 当前仓库是否未修改
 */
export const isUnmodified = async function (repoDirPath: string) {
	return await !isNeedCommit(repoDirPath);
}

/**
 * 
 * @param repoDirPath 仓库地址
 * @returns 是否有冲突
 */
export const hasConflict = async function (repoDirPath: string) {
	const status = await transferStatus(repoDirPath);
	return status === "" ? false : UNMERGE_STATUS.some(function (mergeStatus) {
		return Array.isArray(status[mergeStatus]) && status[mergeStatus].length > 0;
	})
};

