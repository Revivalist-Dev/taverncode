package ai.taverncode.client.diff

import ai.taverncode.client.app.TavernAppService
import ai.taverncode.client.app.TavernSessionService
import ai.taverncode.client.app.TavernWorkspaceService
import ai.taverncode.client.plugin.TavernBundle
import ai.taverncode.client.telemetry.Telemetry
import ai.taverncode.client.ui.UiStyle
import ai.taverncode.client.ui.layout.Stack
import ai.taverncode.client.vfs.TavernEditorKind
import ai.taverncode.client.vfs.TavernEditorKindRegistry
import ai.taverncode.client.vfs.TavernVfsManager
import ai.taverncode.client.vfs.TavernVirtualFile
import ai.taverncode.log.TavernLog
import ai.taverncode.rpc.dto.DiffFileDto
import ai.taverncode.rpc.dto.TavernAppStatusDto
import com.intellij.openapi.Disposable
import com.intellij.openapi.components.Service
import com.intellij.openapi.components.service
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.Disposer
import com.intellij.openapi.util.io.FileUtil
import com.intellij.ui.AnimatedIcon
import com.intellij.ui.components.ActionLink
import com.intellij.ui.components.JBLabel
import com.intellij.util.concurrency.annotations.RequiresEdt
import com.intellij.util.ui.Centerizer
import com.intellij.util.ui.JBUI
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.awt.BorderLayout
import java.util.concurrent.atomic.AtomicBoolean
import javax.swing.JComponent
import javax.swing.JPanel

internal object TavernDiffEditorKind : TavernEditorKind {
    const val ID = "tavern-diff"

    override val id: String = ID

    override fun title(params: Map<String, String>): String {
        params["title"].takeIfPresent()?.let { return it }
        val comparison = TavernDiffComparison.entries.firstOrNull { it.source == params["source"] }
        return comparison?.title(params["branch"].takeIfPresent())
            ?: params["branch"].takeIfPresent()?.let { TavernBundle.message("diff.editor.branch.title.named", it) }
            ?: TavernBundle.message("diff.editor.session.title")
    }

    override fun presentablePath(params: Map<String, String>): String = title(params)

    override fun isValid(params: Map<String, String>): Boolean {
        val dir = params["directory"].takeIfPresent() ?: return false
        if (dir.isBlank()) return false
        if (params["source"] == "branch" || params["source"] == "local") return true
        if (params["source"] == "inline") return params["token"].takeIfPresent() != null
        return params["sessionId"].takeIfPresent() != null
    }

    @RequiresEdt
    override fun createContent(project: Project, file: TavernVirtualFile, parent: Disposable): JComponent {
        val panel = JPanel(BorderLayout())
        panel.add(connecting(), BorderLayout.CENTER)
        val service = project.service<TavernDiffEditorService>()
        var current: Disposable? = null
        fun render(data: DiffEditorData) {
            current?.let { Disposer.dispose(it) }
            val child = Disposer.newDisposable(parent, "Tavern diff editor content")
            current = child
            panel.removeAll()
            panel.add(
                when (data) {
                    DiffEditorData.Connecting -> connecting()
                    DiffEditorData.Empty -> emptyChangesComponent()
                    is DiffEditorData.Error -> failed(data.message)
                    is DiffEditorData.Files -> buildDiffEditor(
                        project,
                        file.path.params,
                        data.files,
                        child,
                        data.branch,
                        service.scope,
                        { done -> service.refresh(file.path.params, done) },
                        ::render,
                    )
                },
                BorderLayout.CENTER,
            )
            panel.revalidate()
            panel.repaint()
        }
        service.load(file.path.params, parent, ::render)
        return panel
    }
}

@Service(Service.Level.PROJECT)
internal class TavernDiffEditorService(
    private val project: Project,
    private val cs: CoroutineScope,
) {
    internal val scope: CoroutineScope
        get() = cs

    @RequiresEdt
    fun open(directory: String, comparison: TavernDiffComparison, branch: String?, parent: Disposable) {
        if (project.isDisposed || Disposer.isDisposed(parent) || !cs.isActive) return
        val dir = FileUtil.toCanonicalPath(FileUtil.toSystemIndependentName(directory), '/', true)
            .takeIfPresent() ?: return
        val name = branch.takeIfPresent()
        if (name != null) {
            show(dir, comparison, name)
            return
        }
        val job = cs.launch {
            val branch = service<TavernWorkspaceService>().branchName(dir)
            withContext(Dispatchers.Main) {
                if (!project.isDisposed && !Disposer.isDisposed(parent)) show(dir, comparison, branch)
            }
        }
        val guard = Disposable { job.cancel() }
        Disposer.register(parent, guard)
        job.invokeOnCompletion { Disposer.dispose(guard) }
    }

    @RequiresEdt
    private fun show(dir: String, comparison: TavernDiffComparison, branch: String?) {
        ensureDiffEditorKind()
        val opened = project.service<TavernVfsManager>().open(
            TavernDiffEditorKind.ID,
            diffParams(comparison.source, dir, null, comparison.title(branch), branch),
        )
        if (opened) Telemetry.send("Diff Editor Opened", mapOf("source" to comparison.source))
    }

    fun load(params: Map<String, String>, parent: Disposable, done: (DiffEditorData) -> Unit) {
        val disposed = AtomicBoolean(false)
        val job = cs.launch {
            val app = service<TavernAppService>()
            app.connect()
            withContext(Dispatchers.Main) {
                if (alive(disposed)) done(DiffEditorData.Connecting)
            }
            val state = app.state.first { it.status == TavernAppStatusDto.READY || it.status == TavernAppStatusDto.ERROR }
            if (state.status == TavernAppStatusDto.ERROR) {
                withContext(Dispatchers.Main) {
                    if (alive(disposed)) done(DiffEditorData.Error(TavernBundle.message("session.connection.error.app")))
                }
                return@launch
            }
            val data = runCatching { fetch(params) }
                .getOrElse {
                    if (it is CancellationException) throw it
                    LOG.warn("diff editor load failed source=${params["source"]} dir=${params["directory"]}", it)
                    DiffEditorData.Error(it.message ?: it::class.java.simpleName)
                }
            withContext(Dispatchers.Main) {
                if (alive(disposed)) done(data)
            }
        }
        Disposer.register(parent) {
            disposed.set(true)
            job.cancel()
        }
    }

    fun refresh(params: Map<String, String>, done: (DiffEditorData) -> Unit) = cs.launch {
        val data = runCatching { fetch(params) }
            .getOrElse {
                if (it is CancellationException) throw it
                LOG.warn("diff editor refresh failed source=${params["source"]} dir=${params["directory"]}", it)
                DiffEditorData.Error(it.message ?: it::class.java.simpleName)
            }
        withContext(Dispatchers.Main) {
            if (!project.isDisposed) done(data)
        }
    }

    private fun alive(disposed: AtomicBoolean): Boolean = !project.isDisposed && !disposed.get()

    internal suspend fun fetch(params: Map<String, String>): DiffEditorData {
        val dir = params["directory"].takeIfPresent() ?: return DiffEditorData.Empty
        val workspace = service<TavernWorkspaceService>()
        val store = project.service<TavernInlineDiffStore>()
        val session = project.service<TavernSessionService>()
        val files = when (params["source"]) {
            "branch" -> workspace.branchDiff(dir)
            "local" -> workspace.localDiff(dir)
            "inline" -> store.get(params["token"].orEmpty()).orEmpty()
            else -> session.diff(params["sessionId"].orEmpty(), dir)
        }
        if (files.isEmpty()) return DiffEditorData.Empty
        val branch = params["branch"].takeIfPresent()
            ?: if (params["source"] == "branch" || params["source"] == "local") workspace.branchName(dir) else null
        return DiffEditorData.Files(detail(params, dir, files, session), branch)
    }

    // Enrich modified files with full before/after content so the editor shows whole-file diffs.
    // Added/deleted/binary files already render fully from their patch, so they skip the round-trip;
    // a null result (working tree drifted from the patch) falls back to the hunk view.
    private suspend fun detail(
        params: Map<String, String>,
        dir: String,
        files: List<DiffFileDto>,
        session: TavernSessionService,
    ): List<DiffFileDto> {
        // Revert diffs already carry range-scoped patches from the CLI's `revert.diff`. Whole-file
        // enrichment has no per-message scope for a revert here, so the authoritative endpoint would
        // return the whole-session before/after and splice in changes from kept turns. Render the
        // scoped hunk patches directly instead.
        if (params["token"].takeIfPresent()?.startsWith("revert:") == true) return files
        if (params["source"] == "branch" || params["source"] == "local") return files
        val sessionId = params["sessionId"].takeIfPresent()
        val message = message(params)
        LOG.info("diff editor detail source=${params["source"]} files=${files.size} session=${!sessionId.isNullOrBlank()} message=${!message.isNullOrBlank()}")
        return files.map { file ->
            val patch = file.patch
            if (patch.isNullOrBlank() || DiffPatchReconstruct.added(patch) || DiffPatchReconstruct.deleted(patch)) {
                LOG.info("diff editor detail skip file=${file.file} patch=${!patch.isNullOrBlank()} status=${file.status}")
                file
            } else {
                val detail = runCatching { session.diffSides(sessionId, dir, file, message) }
                    .onFailure { LOG.warn("diff editor detail failed file=${file.file}", it) }
                    .getOrNull()
                LOG.info("diff editor detail file=${file.file} full=${detail?.before != null && detail?.after != null} before=${detail?.before?.length ?: 0} after=${detail?.after?.length ?: 0}")
                detail ?: file
            }
        }
    }

    // Turn diffs carry "turn:<sessionId>:<turnId>" and single-edit diffs carry "tool:<sessionId>:<messageId>";
    // the third segment is the message the CLI scopes the authoritative snapshot diff to. Other sources
    // (session, branch) have no per-message scope.
    private fun message(params: Map<String, String>): String? {
        val parts = params["token"].takeIfPresent()?.split(":", limit = 3) ?: return null
        return if (parts.size == 3 && (parts[0] == "turn" || parts[0] == "tool")) parts[2].takeIfPresent() else null
    }

    private companion object {
        private val LOG = TavernLog.create(TavernDiffEditorService::class.java)
    }
}

internal sealed interface DiffEditorData {
    data object Connecting : DiffEditorData
    data object Empty : DiffEditorData
    data class Error(val message: String) : DiffEditorData
    data class Files(val files: List<DiffFileDto>, val branch: String? = null) : DiffEditorData
}

internal fun diffParams(source: String, directory: String, sessionId: String?, title: String, branch: String? = null, token: String? = null): Map<String, String> =
    linkedMapOf(
        "source" to source,
        "directory" to directory,
        "title" to title,
    ).apply {
        if (!sessionId.isNullOrBlank()) put("sessionId", sessionId)
        if (!branch.isNullOrBlank()) put("branch", branch)
        if (!token.isNullOrBlank()) put("token", token)
    }

fun ensureDiffEditorKind() {
    service<TavernEditorKindRegistry>().register(TavernDiffEditorKind)
}

enum class TavernDiffComparison(internal val source: String, private val title: String, private val named: String) {
    BASE("branch", "diff.editor.branch.title", "diff.editor.branch.title.named"),
    LOCAL("local", "diff.editor.local.title", "diff.editor.local.title.named"),
    ;

    internal fun title(branch: String?): String =
        branch.takeIfPresent()?.let { TavernBundle.message(named, it) } ?: TavernBundle.message(title)
}

@RequiresEdt
fun openTavernDiff(
    project: Project,
    directory: String,
    comparison: TavernDiffComparison,
    branch: String? = null,
    parent: Disposable = project,
) {
    if (project.isDisposed || Disposer.isDisposed(parent)) return
    project.service<TavernDiffEditorService>().open(directory, comparison, branch, parent)
}

private fun connecting(): JComponent = Stack.horizontal(gap = UiStyle.Gap.sm()).apply {
    border = JBUI.Borders.empty(UiStyle.Gap.pad())
    next(JBLabel(AnimatedIcon.Default()))
    next(JBLabel(TavernBundle.message("session.connection.connecting")))
}.let { Centerizer(it, Centerizer.TYPE.BOTH) }

private fun failed(message: String): JComponent = Stack.horizontal(gap = UiStyle.Gap.sm()).apply {
    border = JBUI.Borders.empty(UiStyle.Gap.pad())
    next(JBLabel(message))
    next(ActionLink(TavernBundle.message("session.connection.retry")) {
        service<TavernAppService>().retryAsync()
    })
}.let { Centerizer(it, Centerizer.TYPE.BOTH) }

private fun String?.takeIfPresent(): String? = takeIf { !it.isNullOrBlank() }
