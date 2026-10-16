---
title: "III. 基本开发环境和工具 / III.1 版本控制系统：Git 和 GitHub 协作开发"
---

# III.1 版本控制系统：Git 和 GitHub 协作开发

[**Git**](https://git-scm.com/) 是一种快速、可扩展的分布式版本控制系统。它跟踪文件更改，让开发者查看项目历史（谁在何时改了什么、为什么改）、恢复到以前的版本，并与他人协作。

核心概念包括：

- **仓库**：文件、文件夹及其修订历史的完整集合。
- **提交**：项目历史中的时间快照。
- **分支**：独立的开发线，实现隔离的开发测试和并行工作。

常用命令包括：`git init`、`git clone`、`git add`、`git commit`、`git status`、`git branch`、`git merge`、`git pull`、`git push`。

[**GitHub**](https://github.com/) 是流行的 Git 仓库托管平台，提供 issue 跟踪和 Pull Request（PR，拉取请求）等协作工具，支持代码审查并集成 CI/CD 工作流。除此之外，还有 **[GitLab](https://about.gitlab.com/)、[Gitee](https://gitee.com/)、[Bitbucket](https://bitbucket.org/product/)** 等仓库托管平台。

“Fork and Pull”模式（先 Fork 复刻仓库，再向原仓库提交 PR）是大型开源项目协作的基础。

## **III.1.1 Git 的核心心智模型：四层架构与状态流转**

理解 Git 的关键在于建立清晰的“数据在哪个区域”的心智模型，而非死记命令：

```text
[ 工作区 (Working Directory) ]
       │  git add
       ▼
[ 暂存区 (Staging Area / Index) ]
       │  git commit
       ▼
[ 本地仓库 (Local Repository / .git) ]
       │  ▲
       │  │  git push（↓ 上传本地提交）/ git fetch（↑ 下载远程提交）
       ▼  │
[ 远程仓库 (Remote Repository / GitHub) ]
```

- **工作区（Working Directory）**：磁盘上直接可见并编辑的项目源码文件。
- **暂存区（Staging Area / Index）**：准备随下一次提交记录的变更快照清单。暂存区使开发者能够把一次复杂的改动拆解为多次逻辑独立、职责单一的小粒度提交。
- **本地仓库（Local Repository）**：存储在 `.git` 目录下的完整历史提交记录、对象数据库和分支引用。
- **远程仓库（Remote Repository）**：托管在 GitHub / GitLab 等云端平台的集中式共享版本库。

文件的生命周期状态在 **未跟踪（Untracked）**、**未修改（Unmodified）**、**已修改（Modified）** 和 **已暂存（Staged）** 之间转换。

## **III.1.2 底层对象模型与 HEAD 指针机制**

不同于记录“文件行差异（Delta）”的传统版本控制系统，Git 是一个基于 SHA 哈希的内容寻址快照存储系统。`.git/objects` 维护着四类不可变对象：

1. **Blob**：存储纯文件数据内容，不包含文件名和权限元信息。
2. **Tree**：类似目录，记录当前层级包含的 Blob 文件名、权限以及子 Tree 节点的引用。
3. **Commit**：包含顶级 Tree 对象的哈希、父提交（Parent）哈希、作者/提交者信息、时间戳和提交说明。
4. **Tag**：对特定 Commit 的永久具名引用。

### **HEAD 指针与头指针分离（Detached HEAD）**

- **HEAD**：Git 中代表“当前检出位置”的符号指针。正常情况下，HEAD 指向一个具名分支引用（如 `refs/heads/main`），该分支再指向具体的 Commit。
- **Detached HEAD（头指针分离）**：直接检出某个提交（`git checkout <commit-id>`），或直接检出远程分支而不创建本地分支时，HEAD 会指向具体的 Commit 哈希，而不是某个分支。在此状态下所做的新提交不属于任何分支；切换到其他分支后，这些提交就不再被任何分支引用，reflog 记录过期后可能在 Git 垃圾回收（`git gc`）时被永久清理。

::: details 示例：精准暂存与利用 Reflog 挽救误删提交

### 场景一：利用 `git add -p` 拆分单一文件中的不同改动
当你在一个文件中同时修复了一个 bug 并添加了一段试验性代码时，不要盲目 `git add .`：

```bash
# 交互式挑选需要进入当前提交的代码块（Patch）
git add -p src/utils/format.ts
# 输入 y（暂存此块）、n（跳过此块）、s（拆分为更小块）
```

### 场景二：利用 `git reflog` 挽救 `git reset --hard` 误删的提交
当误执行硬重置导致分支回退、看似丢失最新提交时：

```bash
# 1. 查看本地 HEAD 移动的所有历史日志（包括分离 HEAD 状态下的提交和被重置丢弃的提交）
git reflog

# 输出示例：
# a1b2c3d HEAD@{0}: reset: moving to HEAD~1
# e4f5a6b HEAD@{1}: commit: feat: implement instant search

# 2. 根据 reflog 中的真实哈希重新找回提交并创建恢复分支
git switch -c recovery-branch e4f5a6b
```

被重置或丢弃的提交不会立即从磁盘抹去：reflog 记录默认保留 90 天，其中已不可达提交的记录保留 30 天，在此期间都能找回。`reflog` 是挽救误操作最常用的“后悔药”。

:::
