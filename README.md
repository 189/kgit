
A Simple & graceful git tool libary.

### Install

```
$ yarn add kgit
```


### API

####  getCurrentBranch: (repoDirPath: string) => Promise<string>
```
import { getCurrentBranch } from "kgit";

const repo = your_repo_path;
;(async function(){
    const branch = await getCurrentBranch(repo);
    console.log(branch)
})();

```

#### submitCommit
```
import { forceChangeBranch, clearGitRepo, submitCommit } from "kgit";

const repo = your_repo_path;
;(async function(){
    // Same as `git checkout -f master`
    await forceChangeBranch(repo, "master"); 

    // equal to `git reset --hard HEAD~5` && `git clean -f` && `git pull`
    await clearGitRepo(repo, 5);
    
    // it will work step by step:
    // step1: check submit is necessary（by check differences between the index file and the current HEAD commit ）
    // step2: git add -A
    // step3: git commit -m "your commit message"
    // step4: git push
    // step5: check push if success by comparing current HEAD and remote HEAD
    await submitCommit(repo, "your commit message")
})();
```

#### Some Api
> Works as theirs name.

- forceChangeBranch: (repoDirPath: string, branchName: string) => Promise<string>  
- resetHard: (repoDirPath: string, toPoint: string) => Promise<string>
- cleanCurrentBranch: (repoDirPath: string) => Promise<string>
- pullCurrentBranch: (repoDirPath: string) => Promise<string>
- clearGitRepo: (repoDirPath: string, toPoint: number = 1) => Promise<void>
- submitCommit: (repoDirPath: string, commitMessage: string, modifyFileChecker?: string | string[] | ModifyFileChecker | undefined) => Promise<boolean>;
- hasConflict: (repoDirPath: string) => Promise<boolean> 
- isUnmodified: (repoDirPath: string) => Promise<boolean>


