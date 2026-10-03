@file:Suppress("UnstableApiUsage")

package ai.taverncode.backend.rpc

import ai.taverncode.rpc.TavernAgentBehaviorRpcApi
import com.intellij.platform.rpc.backend.RemoteApiProvider
import fleet.rpc.remoteApiDescriptor

internal class TavernAgentBehaviorRpcApiProvider : RemoteApiProvider {
    override fun RemoteApiProvider.Sink.remoteApis() {
        remoteApi(remoteApiDescriptor<TavernAgentBehaviorRpcApi>()) {
            TavernAgentBehaviorRpcApiImpl()
        }
    }
}
