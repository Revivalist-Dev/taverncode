package ai.taverncode.backend.workspace

import com.intellij.openapi.project.ProjectManager
import com.intellij.openapi.vfs.VfsUtilCore
import com.intellij.testFramework.fixtures.BasePlatformTestCase

class TavernWorktreeExcludePolicyTest : BasePlatformTestCase() {
    override fun tearDown() {
        try {
            TavernWorktreeIndexSettings.set(false)
        } finally {
            super.tearDown()
        }
    }

    fun `test excludes tavern worktrees under the project base path by default`() {
        val base = project.basePath!!
        val policy = TavernWorktreeExcludePolicy(project)

        assertOrderedEquals(
            policy.getExcludeUrlsForProject().toList(),
            listOf(VfsUtilCore.pathToUrl("$base/.tavern/worktrees")),
        )
    }

    fun `test returns nothing when indexing worktrees is enabled`() {
        TavernWorktreeIndexSettings.set(true)
        val policy = TavernWorktreeExcludePolicy(project)

        assertEmpty(policy.getExcludeUrlsForProject().toList())
    }

    fun `test returns nothing when the project has no base path`() {
        val default = ProjectManager.getInstance().defaultProject
        val policy = TavernWorktreeExcludePolicy(default)

        assertEmpty(policy.getExcludeUrlsForProject().toList())
    }
}
