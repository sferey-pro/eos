import { $ } from "bun";
import { join } from "path";

export interface GitStatus {
	isGit: boolean;
	branch?: string;
	behind?: number;
	ahead?: number;
	mainBranch?: string;
}

export async function getGitStatus(projectPath: string): Promise<GitStatus> {
	try {
		// Check if it's a git repo
		const isGitCheck = await $`git rev-parse --is-inside-work-tree`
			.cwd(projectPath)
			.quiet()
			.nothrow();
		if (isGitCheck.exitCode !== 0) {
			return { isGit: false };
		}

		// Get current branch
		const branchCmd = await $`git branch --show-current`
			.cwd(projectPath)
			.quiet();
		const currentBranch = branchCmd.text().trim();

		// Try to detect remote main branch
		let mainBranch = "origin/main";
		const remoteHeadCmd = await $`git symbolic-ref refs/remotes/origin/HEAD`
			.cwd(projectPath)
			.quiet()
			.nothrow();
		if (remoteHeadCmd.exitCode === 0) {
			mainBranch = remoteHeadCmd.text().trim().replace("refs/remotes/", "");
		} else {
			// Fallback: check if origin/master exists
			const hasMaster = await $`git rev-parse --verify origin/master`
				.cwd(projectPath)
				.quiet()
				.nothrow();
			if (hasMaster.exitCode === 0) mainBranch = "origin/master";
		}

		// Check distance
		let behind = 0;
		let ahead = 0;
		const distanceCmd =
			await $`git rev-list --left-right --count HEAD...${mainBranch}`
				.cwd(projectPath)
				.quiet()
				.nothrow();

		if (distanceCmd.exitCode === 0) {
			const parts = distanceCmd.text().trim().split(/\s+/);
			if (parts.length === 2) {
				ahead = parseInt(parts[0] || "0", 10);
				behind = parseInt(parts[1] || "0", 10);
			}
		}

		return {
			isGit: true,
			branch: currentBranch,
			behind,
			ahead,
			mainBranch: mainBranch.replace("origin/", ""),
		};
	} catch (e) {
		return { isGit: false };
	}
}
