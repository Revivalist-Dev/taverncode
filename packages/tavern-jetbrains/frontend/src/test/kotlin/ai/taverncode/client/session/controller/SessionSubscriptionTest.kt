package ai.taverncode.client.session.controller

import ai.taverncode.client.testing.TestLog
import ai.taverncode.rpc.dto.ConfigDto
import ai.taverncode.rpc.dto.TavernAppStateDto
import ai.taverncode.rpc.dto.TavernAppStatusDto
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.flow

class SessionSubscriptionTest : SessionControllerTestBase() {

    override fun setUp() {
        super.setUp()
        rpc.session = rpc.session.copy(id = "ses_test")
        appRpc.state.value = TavernAppStateDto(TavernAppStatusDto.READY, config = ConfigDto(model = "kilo/gpt-5"))
        projectRpc.state.value = workspaceReady()
    }

    fun `test controller event subscription logs failures`() {
        val log = TestLog()
        rpc.eventFlow = { _, _ -> flow { throw IllegalStateException("stream failed") } }

        controller("ses_test", log = log)
        flush()

        assertTrue(log.messages.joinToString("\n"), log.messages.any { it.contains("kind=subscription route=controller-events failed message=stream failed") })
    }

    fun `test controller event subscription rethrows cancellation without failure log`() {
        val log = TestLog()
        rpc.eventFlow = { _, _ -> flow { throw CancellationException("stop") } }

        controller("ses_test", log = log)
        flush()

        assertFalse(log.messages.joinToString("\n"), log.messages.any { it.contains("route=controller-events failed") })
    }
}
