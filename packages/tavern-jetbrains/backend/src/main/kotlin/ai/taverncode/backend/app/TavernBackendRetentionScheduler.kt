package ai.taverncode.backend.app

import ai.taverncode.log.TavernLog
import com.intellij.openapi.components.Service
import com.intellij.openapi.components.service
import com.intellij.openapi.project.Project
import com.intellij.openapi.startup.ProjectActivity
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.first
import java.util.concurrent.atomic.AtomicBoolean

@Service
class TavernBackendRetentionScheduler(private val cs: CoroutineScope) {
    private val started = AtomicBoolean()

    fun start() {
        if (!started.compareAndSet(false, true)) return
        cs.launch {
            retentionSchedule(
                attempt = {
                    val app = service<TavernBackendAppService>()
                    app.appState.first { it is TavernAppState.Ready }
                    app.retention.run(false)
                },
                wait = { delay(it) },
                failed = { LOG.warn("Automatic session cleanup failed", it) },
            )
        }
    }

    private companion object {
        val LOG = TavernLog.create(TavernBackendRetentionScheduler::class.java)
    }
}

class TavernBackendRetentionStartupActivity : ProjectActivity {
    override suspend fun execute(project: Project) {
        service<TavernBackendRetentionScheduler>().start()
    }
}

internal suspend fun retentionSchedule(
    attempt: suspend () -> Unit,
    wait: suspend (Long) -> Unit,
    failed: (Throwable) -> Unit,
) {
    wait(RETENTION_INITIAL_DELAY_MS)
    while (currentCoroutineContext().isActive) {
        try {
            attempt()
        } catch (e: CancellationException) {
            throw e
        } catch (e: Throwable) {
            failed(e)
        }
        wait(RETENTION_INTERVAL_MS)
    }
}

internal const val RETENTION_INITIAL_DELAY_MS = 2 * 60_000L
internal const val RETENTION_INTERVAL_MS = 24 * 60 * 60_000L
