@file:Suppress("UnstableApiUsage")

package ai.taverncode.backend.rpc

import ai.taverncode.backend.app.TavernAppState
import ai.taverncode.backend.app.TavernBackendAppService
import ai.taverncode.backend.telemetry.TavernBackendTelemetry
import ai.taverncode.backend.app.LoadError
import ai.taverncode.backend.app.LoadProgress
import ai.taverncode.backend.app.ProfileResult
import ai.taverncode.backend.cli.TavernCliPlatform
import ai.taverncode.backend.cli.TavernProps
import ai.taverncode.backend.cli.TavernRepoCli
import ai.taverncode.backend.workspace.TavernWorktreeIndexSettings
import ai.taverncode.jetbrains.api.model.TavernProfile200Response
import ai.taverncode.log.TavernLog
import ai.taverncode.log.LogConfig
import ai.taverncode.rpc.dto.ConfigPatchDto
import ai.taverncode.rpc.TavernAppRpcApi
import ai.taverncode.rpc.dto.DeviceAuthDto
import ai.taverncode.rpc.dto.HealthDto
import ai.taverncode.rpc.dto.TavernAppStateDto
import ai.taverncode.rpc.dto.TavernAppStatusDto
import ai.taverncode.rpc.dto.LoadErrorDto
import ai.taverncode.rpc.dto.LoadProgressDto
import ai.taverncode.rpc.dto.LogConfigDto
import ai.taverncode.rpc.dto.LogFileDto
import ai.taverncode.rpc.dto.ModelFavoriteUpdateDto
import ai.taverncode.rpc.dto.ModelSelectionUpdateDto
import ai.taverncode.rpc.dto.ModelStateDto
import ai.taverncode.rpc.dto.ModelVariantUpdateDto
import ai.taverncode.rpc.dto.ProfileBalanceDto
import ai.taverncode.rpc.dto.ProfileDto
import ai.taverncode.rpc.dto.ProfileTavernPassDto
import ai.taverncode.rpc.dto.ProfileOrganizationDto
import ai.taverncode.rpc.dto.ProfileStatusDto
import ai.taverncode.rpc.dto.RetentionStatusDto
import ai.taverncode.rpc.dto.TelemetryCaptureDto
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.application.writeAction
import com.intellij.openapi.components.service
import com.intellij.openapi.project.ProjectManager
import com.intellij.openapi.project.RootsChangeRescanningInfo
import com.intellij.openapi.roots.ex.ProjectRootManagerEx
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import java.nio.file.Files

/**
 * Backend implementation of [TavernAppRpcApi].
 *
 * Delegates directly to the app-level [TavernBackendAppService] —
 * no project resolution needed since all operations are app-scoped.
 */
class TavernAppRpcApiImpl : TavernAppRpcApi {

    private val app: TavernBackendAppService get() = service()

    override suspend fun connect() = app.connect()

    override suspend fun state(): Flow<TavernAppStateDto> =
        combine(app.appState, app.capabilities) { state, caps -> appStateDto(state, caps) }
            .distinctUntilChanged()

    override suspend fun health(): HealthDto = app.health()

    override suspend fun cliVersion(): String = TavernProps.cliVersion()

    override suspend fun cliPlatform(): String = TavernCliPlatform.current()

    override suspend fun cliBundled(): Boolean = TavernRepoCli.available()

    override suspend fun retry() = app.retry()

    override suspend fun restart() = app.restart()

    override suspend fun reinstall() = app.reinstall()

    override suspend fun modelState(): ModelStateDto {
        app.requireReady()
        return app.models.state()
    }

    override suspend fun updateModelFavorite(update: ModelFavoriteUpdateDto): ModelStateDto {
        app.requireReady()
        return app.models.favorite(update)
    }

    override suspend fun updateModelSelection(update: ModelSelectionUpdateDto): ModelStateDto {
        app.requireReady()
        return app.models.selection(update)
    }

    override suspend fun updateModelVariant(update: ModelVariantUpdateDto): ModelStateDto {
        app.requireReady()
        return app.models.variant(update)
    }

    override suspend fun updateConfig(patch: ConfigPatchDto): TavernAppStateDto {
        app.requireReady()
        return appStateDto(app.updateConfig(patch), app.capabilities.value)
    }

    override suspend fun retentionStatus(): RetentionStatusDto = app.retention.status()

    override suspend fun runRetention(force: Boolean): RetentionStatusDto = app.retention.run(force)

    override suspend fun applyLogConfig(config: LogConfigDto) {
        LogConfig.apply(config.level, config.contentMode, config.previewMax)
    }

    override suspend fun indexWorktrees(): Boolean = TavernWorktreeIndexSettings.get()

    override suspend fun setIndexWorktrees(value: Boolean) {
        if (TavernWorktreeIndexSettings.get() == value) return
        TavernWorktreeIndexSettings.set(value)
        if (ApplicationManager.getApplication() == null) return
        for (project in ProjectManager.getInstance().openProjects) {
            if (project.isDisposed) continue
            writeAction {
                ProjectRootManagerEx.getInstanceEx(project)
                    .makeRootsChange({}, RootsChangeRescanningInfo.RESCAN_DEPENDENCIES_IF_NEEDED)
            }
        }
    }

    override suspend fun backendLogFile(): LogFileDto? = withContext(Dispatchers.IO) {
        val path = TavernLog.logFile()
        if (!Files.exists(path)) return@withContext null
        LogFileDto(path.fileName.toString(), Files.readString(path))
    }

    override suspend fun refreshProfile(): ProfileDto? = app.refreshProfile()?.let(::profileDto)

    override suspend fun startLogin(directory: String?): DeviceAuthDto = app.startLogin(directory)

    override suspend fun completeLogin(directory: String?): ProfileDto? = app.completeLogin(directory)?.let(::profileDto)

    override suspend fun logout(): Boolean = app.logout()

    override suspend fun setOrganization(organizationId: String?): ProfileDto? =
        app.setOrganization(organizationId)?.let(::profileDto)

    override suspend fun captureTelemetry(capture: TelemetryCaptureDto) {
        service<TavernBackendTelemetry>().capture(app.http, app.port, capture.event, capture.properties)
    }

}

internal fun appStateDto(state: TavernAppState, backgroundSubagents: Boolean = false): TavernAppStateDto =
    when (state) {
        TavernAppState.Disconnected -> TavernAppStateDto(TavernAppStatusDto.DISCONNECTED)
        is TavernAppState.Downloading -> TavernAppStateDto(
            status = TavernAppStatusDto.DOWNLOADING,
            downloadPercent = state.percent,
            downloadVersion = state.version,
            downloadPlatform = state.platform,
        )
        TavernAppState.Connecting -> TavernAppStateDto(TavernAppStatusDto.CONNECTING)
        is TavernAppState.Loading -> TavernAppStateDto(
            status = TavernAppStatusDto.LOADING,
            progress = progress(state.progress),
        )
        is TavernAppState.MigrationRequired -> TavernAppStateDto(
            status = TavernAppStatusDto.MIGRATION_REQUIRED,
            migration = MigrationRpcMapper.toDto(state.detection),
        )
        is TavernAppState.Ready -> TavernAppStateDto(
            status = TavernAppStatusDto.READY,
            progress = LoadProgressDto(
                config = true,
                notifications = true,
                profile = if (state.data.profile != null) ProfileStatusDto.LOADED
                    else ProfileStatusDto.NOT_LOGGED_IN,
            ),
            config = state.data.config,
            profile = state.data.profile?.let(::profileDto),
            backgroundSubagents = backgroundSubagents,
        )
        is TavernAppState.Error -> TavernAppStateDto(
            status = TavernAppStatusDto.ERROR,
            error = state.message,
            errors = state.errors.map(::error),
        )
    }

internal fun profileDto(p: TavernProfile200Response): ProfileDto = ProfileDto(
    email = p.profile.email,
    name = p.profile.name,
    organizations = p.profile.organizations.orEmpty().map { org ->
        ProfileOrganizationDto(id = org.id, name = org.name, role = org.role)
    },
    // The pinned CLI release does not expose hasPersonalAccount yet, so default to
    // showing the personal account. Flip back to p.profile.hasPersonalAccount once a
    // CLI release ships the field.
    hasPersonalAccount = true,
    balance = p.balance?.balance?.let { ProfileBalanceDto(balance = it) },
    tavernPass = p.tavernPass?.let {
        val base = it.currentPeriodBaseCreditsUsd
        val usage = it.currentPeriodUsageUsd
        val bonus = it.currentPeriodBonusCreditsUsd
        ProfileTavernPassDto(
            currentPeriodBaseCreditsUsd = base,
            currentPeriodUsageUsd = usage,
            currentPeriodBonusCreditsUsd = bonus,
            nextBillingAt = it.nextBillingAt,
        )
    },
    currentOrgId = p.currentOrgId,
)

private fun progress(p: LoadProgress) = LoadProgressDto(
    config = p.config,
    notifications = p.notifications,
    profile = when (p.profile) {
        ProfileResult.PENDING -> ProfileStatusDto.PENDING
        ProfileResult.LOADED -> ProfileStatusDto.LOADED
        ProfileResult.NOT_LOGGED_IN -> ProfileStatusDto.NOT_LOGGED_IN
    },
)

private fun error(e: LoadError) = LoadErrorDto(
    resource = e.resource,
    status = e.status,
    detail = e.detail,
)
