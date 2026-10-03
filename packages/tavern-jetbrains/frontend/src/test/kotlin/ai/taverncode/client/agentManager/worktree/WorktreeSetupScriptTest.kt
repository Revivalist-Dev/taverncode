package ai.taverncode.client.agentManager.worktree

import ai.taverncode.rpc.dto.SetupScriptKind
import ai.taverncode.rpc.dto.SetupScriptTargetDto
import com.intellij.testFramework.fixtures.BasePlatformTestCase

class WorktreeSetupScriptTest : BasePlatformTestCase() {
    fun `test posix command invokes sh with a quoted path`() {
        val script = SetupScriptTargetDto("/repo/.tavern/setup-script", "/repo/.tavern/setup-script", true, SetupScriptKind.POSIX)

        assertEquals("sh '/repo/.tavern/setup-script'", setupScriptCommand(script))
    }

    fun `test powershell command uses NoProfile and Bypass with a quoted path`() {
        val script = SetupScriptTargetDto("C:\\repo\\.tavern\\setup-script.ps1", "C:\\repo\\.tavern\\setup-script.ps1", true, SetupScriptKind.POWERSHELL)

        assertEquals(
            "powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File \"C:\\repo\\.tavern\\setup-script.ps1\"",
            setupScriptCommand(script),
        )
    }

    fun `test cmd command uses d s c with a quoted path`() {
        val script = SetupScriptTargetDto("C:\\repo\\.tavern\\setup-script.cmd", "C:\\repo\\.tavern\\setup-script.cmd", true, SetupScriptKind.CMD)

        assertEquals("cmd.exe /d /s /c \"C:\\repo\\.tavern\\setup-script.cmd\"", setupScriptCommand(script))
    }

    fun `test posix quoting escapes an embedded single quote`() {
        val script = SetupScriptTargetDto("/repo/it's/.tavern/setup-script", "/repo/it's/.tavern/setup-script", true, SetupScriptKind.POSIX)

        assertEquals("sh '/repo/it'\\''s/.tavern/setup-script'", setupScriptCommand(script))
    }

    fun `test windows quoting doubles an embedded double quote`() {
        val script = SetupScriptTargetDto("C:\\repo \"copy\"\\.tavern\\setup-script.ps1", "", true, SetupScriptKind.POWERSHELL)

        assertEquals(
            "powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File \"C:\\repo \"\"copy\"\"\\.tavern\\setup-script.ps1\"",
            setupScriptCommand(script),
        )
    }

    fun `test posix quoting handles a path containing spaces`() {
        val script = SetupScriptTargetDto("/repo/my worktree/.tavern/setup-script", "", true, SetupScriptKind.POSIX)

        assertEquals("sh '/repo/my worktree/.tavern/setup-script'", setupScriptCommand(script))
    }
}
