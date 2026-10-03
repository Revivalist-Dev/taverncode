package ai.taverncode.client.session.ui.model

import ai.taverncode.rpc.dto.ModelDto
import ai.taverncode.rpc.dto.ProviderDto
import ai.taverncode.rpc.dto.ProvidersDto
import com.intellij.testFramework.fixtures.BasePlatformTestCase

class ModelItemsTest : BasePlatformTestCase() {

    private fun providers(): ProvidersDto = ProvidersDto(
        providers = listOf(
            ProviderDto(
                "tavern", "Tavern",
                models = mapOf(
                    "gpt-5" to ModelDto("gpt-5", "GPT-5", variants = listOf("low", "high"), attachment = true),
                    "auto-small" to ModelDto("auto-small", "Auto Small"),
                ),
            ),
            ProviderDto("openai", "OpenAI", models = mapOf("o3" to ModelDto("o3", "o3"))),
            ProviderDto("anthropic", "Anthropic", models = mapOf("claude" to ModelDto("claude", "Claude"))),
        ),
        connected = listOf("openai"),
        defaults = emptyMap(),
    )

    fun `test drops small models and providers that are not connected`() {
        assertEquals(listOf("kilo/gpt-5", "openai/o3"), modelItems(providers()).map { it.key })
    }

    fun `test keeps small models when requested`() {
        assertEquals(
            setOf("kilo/gpt-5", "kilo/auto-small", "openai/o3"),
            modelItems(providers(), includeSmall = true).map { it.key }.toSet(),
        )
    }

    fun `test carries variants and attachment onto the item`() {
        val gpt = modelItems(providers()).first { it.key == "kilo/gpt-5" }
        assertEquals(listOf("low", "high"), gpt.variants)
        assertTrue(gpt.attachment)
    }

    fun `test null providers yields no items`() {
        assertTrue(modelItems(null).isEmpty())
    }
}
