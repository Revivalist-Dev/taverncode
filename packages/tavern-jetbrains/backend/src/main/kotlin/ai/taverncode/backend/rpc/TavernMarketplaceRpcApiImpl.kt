@file:Suppress("UnstableApiUsage")

package ai.taverncode.backend.rpc

import ai.taverncode.backend.app.TavernBackendAppService
import ai.taverncode.backend.marketplace.TavernBackendMarketplaceManager
import ai.taverncode.rpc.TavernMarketplaceRpcApi
import ai.taverncode.rpc.dto.MarketplaceItemDto
import ai.taverncode.rpc.dto.MarketplaceListDto
import ai.taverncode.rpc.dto.MarketplaceResultDto

class TavernMarketplaceRpcApiImpl(
    backend: TavernBackendAppService? = null,
    private val manager: TavernBackendMarketplaceManager = TavernBackendMarketplaceManager(backend),
) : TavernMarketplaceRpcApi {
    override suspend fun list(directory: String): MarketplaceListDto = manager.list(directory)

    override suspend fun install(
        directory: String,
        item: MarketplaceItemDto,
        target: String,
        parameters: Map<String, String>,
    ): MarketplaceResultDto = manager.install(directory, item, target, parameters)

    override suspend fun remove(directory: String, id: String, type: String, scope: String): MarketplaceResultDto =
        manager.remove(directory, id, type, scope)
}
