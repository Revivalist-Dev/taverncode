package ai.taverncode.backend.cli

import kotlin.test.Test
import kotlin.test.assertEquals
import java.io.File
import java.nio.file.Files

class TavernCliConfigPathTest {

    @Test
    fun `tavern config dir overrides XDG config home`() {
        val dir = Files.createTempDirectory("tavern-config-dir").toFile()
        val xdg = Files.createTempDirectory("tavern-xdg-config").toFile()

        val path = TavernCliConfigPath.resolve(
            mapOf(
                "TAVERN_CONFIG_DIR" to dir.absolutePath,
                "XDG_CONFIG_HOME" to xdg.absolutePath,
            ),
        )

        assertEquals(dir.absoluteFile, path.absoluteFile)
    }

    @Test
    fun `XDG config home resolves to tavern subdirectory`() {
        val xdg = Files.createTempDirectory("tavern-xdg-config").toFile()

        val path = TavernCliConfigPath.resolve(mapOf("XDG_CONFIG_HOME" to xdg.absolutePath))

        assertEquals(File(xdg, "tavern").absoluteFile, path.absoluteFile)
    }

    @Test
    fun `default config home matches CLI xdg fallback`() {
        val home = Files.createTempDirectory("tavern-home").toFile()

        val path = TavernCliConfigPath.resolve(mapOf("HOME" to home.absolutePath))

        assertEquals(File(File(home, ".config"), "tavern").absoluteFile, path.absoluteFile)
    }

    @Test
    fun `USERPROFILE backs up HOME for default config home`() {
        val home = Files.createTempDirectory("tavern-userprofile").toFile()

        val path = TavernCliConfigPath.resolve(
            mapOf(
                "HOME" to "",
                "USERPROFILE" to home.absolutePath,
            ),
        )

        assertEquals(File(File(home, ".config"), "tavern").absoluteFile, path.absoluteFile)
    }

    @Test
    fun `blank config env values are ignored`() {
        val home = Files.createTempDirectory("tavern-home").toFile()

        val path = TavernCliConfigPath.resolve(
            mapOf(
                "TAVERN_CONFIG_DIR" to " ",
                "XDG_CONFIG_HOME" to "",
                "HOME" to home.absolutePath,
            ),
        )

        assertEquals(File(File(home, ".config"), "tavern").absoluteFile, path.absoluteFile)
    }

    @Test
    fun `legacy settings file resolves under global config dir`() {
        val home = Files.createTempDirectory("tavern-home").toFile()

        val path = TavernCliConfigPath.legacySettingsFile(mapOf("HOME" to home.absolutePath))

        assertEquals(File(File(File(home, ".config"), "tavern"), "legacy-settings.json").absoluteFile, path.absoluteFile)
    }
}
