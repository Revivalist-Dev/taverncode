package ai.taverncode.client.session.views.tool

import ai.taverncode.cli.TavernCliParser
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class TavernCliParserTest {
    @Test
    fun `tag extracts trimmed tool xml value`() {
        val text = """
            <path>
              /tmp/example.txt
            </path>
            <type>file</type>
        """.trimIndent()

        assertEquals("/tmp/example.txt", TavernCliParser.tag(text, "path"))
        assertEquals("file", TavernCliParser.tag(text, "type"))
    }

    @Test
    fun `tag returns null for blank or missing value`() {
        assertNull(TavernCliParser.tag("<path>   </path>", "path"))
        assertNull(TavernCliParser.tag("<type>file</type>", "path"))
    }
}
