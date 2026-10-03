@file:Suppress("UnstableApiUsage")

package ai.taverncode.backend.rpc

import ai.taverncode.rpc.TavernMigrationRpcApi
import com.intellij.platform.rpc.backend.RemoteApiProvider
import fleet.rpc.remoteApiDescriptor

internal class TavernMigrationRpcApiProvider : RemoteApiProvider {
    override fun RemoteApiProvider.Sink.remoteApis() {
        remoteApi(remoteApiDescriptor<TavernMigrationRpcApi>()) {
            TavernMigrationRpcApiImpl()
        }
    }
}
