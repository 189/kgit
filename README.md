
A Simple & graceful git tool libary.

### Install

```
$ yarn add kgit
```

### Usage

```
import { getCurrentBranch } from "kgit";

;(async function(){
    const repo = your_repo_path;
    const branch = await getCurrentBranch(repo);
    console.log(branch)
})();

```


### API

- getCurrentBranch: (repoDirPath: string) => Promise<string>
- forceChangeBranch: (repoDirPath: string, branchName: string) => Promise<string>
- resetHard: (repoDirPath: string, toPoint: string) => Promise<string>
- cleanCurrentBranch: (repoDirPath: string) => Promise<string>
- pullCurrentBranch: (repoDirPath: string) => Promise<string>
- clearGitRepo: (repoDirPath: string) => Promise<void>
- submitCommit: (repoDirPath: string, commitMessage: string, modifyFileChecker?: string | string[] | ModifyFileChecker | undefined) => Promise<boolean>;
- hasConflict: (repoDirPath: string) => Promise<boolean> 
- isUnmodified: (repoDirPath: string) => Promise<boolean>


