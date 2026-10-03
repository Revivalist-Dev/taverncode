package ai.taverncode.rpc

const val WORKTREE_STORAGE = ".tavern/worktrees"

fun isManagedWorktreeStorage(path: String): Boolean {
    val rel = path.replace('\\', '/').trimStart('/')
    return rel == WORKTREE_STORAGE || rel.startsWith("$WORKTREE_STORAGE/")
}
