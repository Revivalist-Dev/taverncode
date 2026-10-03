package ai.taverncode.backend.app

import ai.taverncode.jetbrains.api.model.KilocodeRetentionRun200Response
import ai.taverncode.jetbrains.api.model.KilocodeRetentionRunRequest
import ai.taverncode.jetbrains.api.model.KilocodeRetentionStatus200Response
import ai.taverncode.rpc.dto.RetentionPolicyDto
import ai.taverncode.rpc.dto.RetentionProgressDto
import ai.taverncode.rpc.dto.RetentionResultDto
import ai.taverncode.rpc.dto.RetentionStatusDto
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.longOrNull

class TavernBackendRetentionManager(private val app: TavernBackendAppService) {
    suspend fun status(): RetentionStatusDto {
        app.requireReady()
        val api = app.api ?: throw IllegalStateException("Tavern API client is unavailable")
        return withContext(Dispatchers.IO) { api.kilocodeRetentionStatus(null, null) }.dto()
    }

    suspend fun run(force: Boolean): RetentionStatusDto {
        app.requireReady()
        val api = app.api ?: throw IllegalStateException("Tavern API client is unavailable")
        return withContext(Dispatchers.IO) {
            api.kilocodeRetentionRun(null, null, KilocodeRetentionRunRequest(force))
        }.dto()
    }
}

private fun KilocodeRetentionStatus200Response.dto() = RetentionStatusDto(
    policy = RetentionPolicyDto(policy.enabled, policy.maxAgeDays.int(30)),
    last = last?.let { RetentionResultDto(
        at = it.at.long(), scanned = it.scanned.int(), deleted = it.deleted.int(),
        skippedActive = it.skippedActive.int(), failed = it.failed.int(), durationMs = it.durationMs.long(),
    ) },
    progress = progress?.let { RetentionProgressDto(
        phase = it.phase.value, total = it.total.toInt(), processed = it.processed.toInt(),
        deleted = it.deleted.toInt(), failed = it.failed.toInt(), skippedActive = it.skippedActive.toInt(),
    ) },
)

private fun KilocodeRetentionRun200Response.dto() = RetentionStatusDto(
    policy = RetentionPolicyDto(policy.enabled, policy.maxAgeDays.int(30)),
    last = last?.let { RetentionResultDto(
        at = it.at.long(), scanned = it.scanned.int(), deleted = it.deleted.int(),
        skippedActive = it.skippedActive.int(), failed = it.failed.int(), durationMs = it.durationMs.long(),
    ) },
    progress = progress?.let { RetentionProgressDto(
        phase = it.phase.value, total = it.total.toInt(), processed = it.processed.toInt(),
        deleted = it.deleted.toInt(), failed = it.failed.toInt(), skippedActive = it.skippedActive.toInt(),
    ) },
)

private fun JsonElement.long(fallback: Long = 0): Long = jsonPrimitive.longOrNull ?: fallback
private fun JsonElement.int(fallback: Int = 0): Int =
    jsonPrimitive.longOrNull?.takeIf { it in Int.MIN_VALUE..Int.MAX_VALUE }?.toInt() ?: fallback
