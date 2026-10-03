package ai.taverncode.client.session.context

import junit.framework.TestCase

class TavernIgnoreTest : TestCase() {
    fun `test empty allows everything`() {
        val ignore = TavernIgnore.of("")
        assertFalse(ignore.ignored("src/App.kt"))
        assertFalse(ignore.ignored(".env"))
    }

    fun `test basename matches at any depth`() {
        val ignore = TavernIgnore.of("foo")
        assertTrue(ignore.ignored("foo"))
        assertTrue(ignore.ignored("a/b/foo"))
        assertTrue(ignore.ignored("foo/child.txt"))
        assertFalse(ignore.ignored("a/foobar"))
    }

    fun `test extension glob`() {
        val ignore = TavernIgnore.of("*.log")
        assertTrue(ignore.ignored("a.log"))
        assertTrue(ignore.ignored("nested/dir/a.log"))
        assertFalse(ignore.ignored("a.log.kt"))
    }

    fun `test directory only pattern matches contents`() {
        val ignore = TavernIgnore.of("node_modules/")
        assertTrue(ignore.ignored("node_modules/pkg/index.js"))
        assertTrue(ignore.ignored("a/node_modules/pkg.js"))
        assertFalse(ignore.ignored("node_modules"))
    }

    fun `test leading slash anchors to root`() {
        val ignore = TavernIgnore.of("/build")
        assertTrue(ignore.ignored("build/out.js"))
        assertFalse(ignore.ignored("src/build/out.js"))
    }

    fun `test middle slash anchors to root`() {
        val ignore = TavernIgnore.of("src/generated")
        assertTrue(ignore.ignored("src/generated/A.kt"))
        assertFalse(ignore.ignored("app/src/generated/A.kt"))
    }

    fun `test double star matches across directories`() {
        val ignore = TavernIgnore.of("**/dist")
        assertTrue(ignore.ignored("dist/a.js"))
        assertTrue(ignore.ignored("a/b/dist/a.js"))

        val nested = TavernIgnore.of("src/**/*.tmp")
        assertTrue(nested.ignored("src/a/b/c.tmp"))
        assertTrue(nested.ignored("src/x.tmp"))
        assertFalse(nested.ignored("lib/a.tmp"))
    }

    fun `test negation re-includes`() {
        val ignore = TavernIgnore.of("*.log\n!keep.log")
        assertTrue(ignore.ignored("debug.log"))
        assertFalse(ignore.ignored("keep.log"))
    }

    fun `test comments and blank lines ignored`() {
        val ignore = TavernIgnore.of("# a comment\n\n*.secret\n")
        assertTrue(ignore.ignored("api.secret"))
        assertFalse(ignore.ignored("# a comment"))
    }

    fun `test sensitive env patterns`() {
        val ignore = TavernIgnore.of(".env\n.env.*")
        assertTrue(ignore.ignored(".env"))
        assertTrue(ignore.ignored(".env.local"))
        assertTrue(ignore.ignored("cfg/.env.production"))
        assertFalse(ignore.ignored("env"))
        assertFalse(ignore.ignored("environment.ts"))
    }

    fun `test char class`() {
        val ignore = TavernIgnore.of("*.[oa]")
        assertTrue(ignore.ignored("main.o"))
        assertTrue(ignore.ignored("lib.a"))
        assertFalse(ignore.ignored("main.c"))
    }

    fun `test backslash separators normalized`() {
        val ignore = TavernIgnore.of("node_modules/")
        assertTrue(ignore.ignored("a\\node_modules\\pkg.js"))
    }

    fun `test malformed char class is skipped without throwing`() {
        val ignore = TavernIgnore.of("[z-a]\n[]\n[!]\n*.log")
        assertTrue(ignore.ignored("debug.log"))
        assertFalse(ignore.ignored("src/App.kt"))
    }
}
