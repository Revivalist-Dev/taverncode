package ai.taverncode.backend.rpc

import ai.taverncode.backend.app.ConfigWarning
import ai.taverncode.backend.app.LoadError
import ai.taverncode.backend.workspace.AgentData
import ai.taverncode.backend.workspace.AgentInfo
import ai.taverncode.backend.workspace.CommandInfo
import ai.taverncode.backend.workspace.TavernWorkspaceLoadProgress
import ai.taverncode.backend.workspace.ModelInfo
import ai.taverncode.backend.workspace.ProviderData
import ai.taverncode.backend.workspace.ProviderInfo
import ai.taverncode.backend.workspace.SkillInfo
import ai.taverncode.rpc.dto.ModelAutoRoutingDto
import ai.taverncode.rpc.dto.ModelCacheCostDto
import ai.taverncode.rpc.dto.ModelCapabilitiesDto
import ai.taverncode.rpc.dto.ModelCostDto
import ai.taverncode.rpc.dto.AgentDto
import ai.taverncode.rpc.dto.AgentsDto
import ai.taverncode.rpc.dto.CommandDto
import ai.taverncode.rpc.dto.ConfigWarningDto
import ai.taverncode.rpc.dto.TavernWorkspaceLoadProgressDto
import ai.taverncode.rpc.dto.LoadErrorDto
import ai.taverncode.rpc.dto.ModelDto
import ai.taverncode.rpc.dto.ModelInputCapabilitiesDto
import ai.taverncode.rpc.dto.ModelLimitDto
import ai.taverncode.rpc.dto.ModelOptionsDto
import ai.taverncode.rpc.dto.ModelTerminalBenchDto
import ai.taverncode.rpc.dto.ProviderDto
import ai.taverncode.rpc.dto.ProvidersDto
import ai.taverncode.rpc.dto.SkillDto

internal object TavernWorkspaceDtoMapper {
    fun error(e: LoadError) = LoadErrorDto(
        resource = e.resource,
        status = e.status,
        detail = e.detail,
    )

    fun progress(p: TavernWorkspaceLoadProgress) = TavernWorkspaceLoadProgressDto(
        providers = p.providers,
        agents = p.agents,
        commands = p.commands,
        skills = p.skills,
    )

    fun providers(d: ProviderData) = ProvidersDto(
        providers = d.providers.map(::provider),
        connected = d.connected,
        defaults = d.defaults,
    )

    fun agents(d: AgentData) = AgentsDto(
        agents = d.agents.map(::agent),
        all = d.all.map(::agent),
        default = d.default,
    )

    fun command(c: CommandInfo) = CommandDto(
        name = c.name,
        description = c.description,
        agent = c.agent,
        model = c.model,
        variant = c.variant,
        source = c.source,
        hints = c.hints,
        subtask = c.subtask,
    )

    fun skill(s: SkillInfo) = SkillDto(
        name = s.name,
        description = s.description,
        location = s.location,
        content = s.content,
        editable = false,
    )

    fun warning(w: ConfigWarning) = ConfigWarningDto(
        path = w.path,
        message = w.message,
        detail = w.detail,
    )

    private fun provider(p: ProviderInfo) = ProviderDto(
        id = p.id,
        name = p.name,
        source = p.source,
        models = p.models.mapValues { (_, m) -> model(m) },
    )

    private fun model(m: ModelInfo) = ModelDto(
        id = m.id,
        name = m.name,
        inputPrice = m.inputPrice,
        outputPrice = m.outputPrice,
        contextLength = m.contextLength,
        releaseDate = m.releaseDate,
        latest = m.latest,
        attachment = m.attachment,
        reasoning = m.reasoning,
        temperature = m.temperature,
        toolCall = m.toolCall,
        free = m.free,
        byok = m.byok,
        status = m.status,
        recommendedIndex = m.recommendedIndex,
        variants = m.variants,
        limit = m.limit?.let { ModelLimitDto(it.context, it.input, it.output) },
        cost = m.cost?.let { cost ->
            ModelCostDto(
                input = cost.input,
                output = cost.output,
                cache = cost.cache?.let { ModelCacheCostDto(it.read, it.write) },
            )
        },
        capabilities = m.capabilities?.let { cap ->
            ModelCapabilitiesDto(
                reasoning = cap.reasoning,
                input = cap.input?.let { ModelInputCapabilitiesDto(it.text, it.image, it.audio, it.video, it.pdf) },
            )
        },
        options = m.options?.let { ModelOptionsDto(it.description) },
        autoRouting = m.autoRouting?.let { ModelAutoRoutingDto(it.models) },
        terminalBench = m.terminalBench?.let { ModelTerminalBenchDto(it.overallScore, it.avgAttemptCostUsd) },
        mayTrainOnYourPrompts = m.mayTrainOnYourPrompts,
    )

    private fun agent(a: AgentInfo) = AgentDto(
        name = a.name,
        displayName = a.displayName,
        description = a.description,
        mode = a.mode,
        native = a.native,
        hidden = a.hidden,
        color = a.color,
        deprecated = a.deprecated,
    )
}
