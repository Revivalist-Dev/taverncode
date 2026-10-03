@file:Suppress("UnstableApiUsage")

package ai.taverncode.backend.rpc

import ai.taverncode.rpc.TavernSessionRpcApi
import com.intellij.platform.rpc.backend.RemoteApiProvider
import fleet.rpc.remoteApiDescriptor

internal class TavernSessionRpcApiProvider : RemoteApiProvider {
    override fun RemoteApiProvider.Sink.remoteApis() {
        remoteApi(remoteApiDescriptor<TavernSessionRpcApi>()) {
            TavernSessionRpcApiImpl()
        }
    }
}
