package ai.taverncode.backend.cli

import java.util.Properties

object TavernProps {
    private val props by lazy {
        val stream = TavernProps::class.java.classLoader.getResourceAsStream("tavern.properties")
            ?: throw IllegalStateException("tavern.properties resource not found")
        stream.use {
            Properties().apply { load(it) }
        }
    }

    fun cliVersion(): String = props.getProperty("cli.version")
        ?: throw IllegalStateException("cli.version missing from tavern.properties")

    fun pinned(): Boolean = pinned(props)

    internal fun pinned(props: Properties): Boolean = props.getProperty("cli.pinned")?.toBoolean() ?: true
}
