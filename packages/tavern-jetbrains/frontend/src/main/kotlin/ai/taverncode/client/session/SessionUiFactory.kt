package ai.taverncode.client.session

import ai.taverncode.client.app.TavernAppService
import ai.taverncode.client.app.TavernSessionService
import ai.taverncode.client.app.Workspace
import ai.taverncode.client.util.UiTimerSource
import ai.taverncode.client.util.UiTimers
import com.intellij.openapi.components.Service
import com.intellij.openapi.components.service
import com.intellij.openapi.project.Project
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob

@Service(Service.Level.APP)
class SessionUiFactory(
    private val cs: CoroutineScope,
) {
    fun create(
        project: Project,
        workspace: Workspace,
        manager: SessionManager,
        ref: SessionRef? = null,
        timers: UiTimerSource = UiTimers,
    ): SessionUi = SessionUi(
        project = project,
        workspace = workspace,
        sessions = project.service<TavernSessionService>(),
        app = service<TavernAppService>(),
        cs = scope(),
        ref = ref,
        manager = manager,
        timers = timers,
    )

    fun scope(): CoroutineScope {
        val parent = cs.coroutineContext[Job]
        return CoroutineScope(cs.coroutineContext + SupervisorJob(parent))
    }
}
