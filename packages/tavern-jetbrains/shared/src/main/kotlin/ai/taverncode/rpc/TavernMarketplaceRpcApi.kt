package ai.taverncode.rpc

import ai.taverncode.rpc.dto.MarketplaceItemDto
import ai.taverncode.rpc.dto.MarketplaceListDto
import ai.taverncode.rpc.dto.MarketplaceResultDto
import com.intellij.platform.rpc.RemoteApiProviderService
import fleet.rpc.RemoteApi
import fleet.rpc.Rpc
import fleet.rpc.remoteApiDescriptor

@Rpc
interface TavernMarketplaceRpcApi : RemoteApi<Unit> {
    companion object {
        suspend fun getInstance(): TavernMarketplaceRpcApi {
            return RemoteApiProviderService.resolve(remoteApiDescriptor<TavernMarketplaceRpcApi>())
        }
    }

    suspend fun list(directory: String): MarketplaceListDto

    suspend fun install(
        directory: String,
        item: MarketplaceItemDto,
        target: String,
        parameters: Map<String, String>,
    ): MarketplaceResultDto

    suspend fun remove(directory: String, id: String, type: String, scope: String): MarketplaceResultDto
}
