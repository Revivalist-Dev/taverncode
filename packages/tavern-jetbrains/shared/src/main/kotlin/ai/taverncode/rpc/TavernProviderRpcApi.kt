@file:Suppress("UnstableApiUsage")

package ai.taverncode.rpc

import ai.taverncode.rpc.dto.CustomModelFetchDto
import ai.taverncode.rpc.dto.CustomModelFetchResultDto
import ai.taverncode.rpc.dto.CustomProviderSaveDto
import ai.taverncode.rpc.dto.ProviderActionResultDto
import ai.taverncode.rpc.dto.ProviderConnectDto
import ai.taverncode.rpc.dto.ProviderDisconnectDto
import ai.taverncode.rpc.dto.ProviderEnableDto
import ai.taverncode.rpc.dto.ProviderOAuthAuthorizeDto
import ai.taverncode.rpc.dto.ProviderOAuthCallbackDto
import ai.taverncode.rpc.dto.ProviderOAuthReadyDto
import ai.taverncode.rpc.dto.ProviderSettingsDto
import com.intellij.platform.rpc.RemoteApiProviderService
import fleet.rpc.RemoteApi
import fleet.rpc.Rpc
import fleet.rpc.remoteApiDescriptor

@Rpc
interface TavernProviderRpcApi : RemoteApi<Unit> {
    companion object {
        suspend fun getInstance(): TavernProviderRpcApi {
            return RemoteApiProviderService.resolve(remoteApiDescriptor<TavernProviderRpcApi>())
        }
    }

    suspend fun state(directory: String): ProviderSettingsDto
    suspend fun connect(input: ProviderConnectDto): ProviderActionResultDto
    suspend fun authorize(input: ProviderOAuthAuthorizeDto): ProviderOAuthReadyDto
    suspend fun callback(input: ProviderOAuthCallbackDto): ProviderActionResultDto
    suspend fun disconnect(input: ProviderDisconnectDto): ProviderActionResultDto
    suspend fun enable(input: ProviderEnableDto): ProviderActionResultDto
    suspend fun saveCustom(input: CustomProviderSaveDto): ProviderActionResultDto
    suspend fun fetchCustomModels(input: CustomModelFetchDto): CustomModelFetchResultDto
}
