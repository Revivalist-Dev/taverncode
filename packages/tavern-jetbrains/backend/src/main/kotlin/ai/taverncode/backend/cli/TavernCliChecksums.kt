package ai.taverncode.backend.cli

import java.util.Properties

object TavernCliChecksums {
    private const val RESOURCE = "tavern-cli-checksums.properties"

    private val values by lazy {
        val stream = TavernCliChecksums::class.java.classLoader.getResourceAsStream(RESOURCE)
            ?: return@lazy emptyMap()
        stream.use {
            Properties().apply { load(it) }
                .entries
                .associate { item -> item.key.toString() to item.value.toString() }
        }
    }

    fun load(): Map<String, String> = values
}
