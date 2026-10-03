@file:Suppress("UnstableApiUsage")

package ai.taverncode.backend.rpc

import ai.taverncode.rpc.TavernRunRpcApi
import com.intellij.platform.rpc.backend.RemoteApiProvider
import fleet.rpc.remoteApiDescriptor

internal class TavernRunRpcApiProvider : RemoteApiProvider {
    override fun RemoteApiProvider.Sink.remoteApis() {
        remoteApi(remoteApiDescriptor<TavernRunRpcApi>()) {
            TavernRunRpcApiImpl()
        }
    }
}
