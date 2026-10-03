package ai.taverncode.client.vfs

import kotlinx.serialization.Serializable

@Serializable
data class TavernPath(
    val kind: String,
    val params: Map<String, String> = emptyMap(),
) {
    fun canonical(): TavernPath = copy(params = canonicalParams(params))
}

internal fun canonicalParams(params: Map<String, String>): Map<String, String> {
    if (params.size < 2) return params
    return params.toSortedMap()
}
