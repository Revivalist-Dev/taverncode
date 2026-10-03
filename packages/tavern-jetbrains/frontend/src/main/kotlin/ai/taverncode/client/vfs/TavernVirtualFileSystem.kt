package ai.taverncode.client.vfs

import com.intellij.openapi.components.service
import com.intellij.openapi.diagnostic.logger
import com.intellij.openapi.vfs.NonPhysicalFileSystem
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.openapi.vfs.VirtualFileListener
import com.intellij.openapi.vfs.VirtualFilePathWrapper
import com.intellij.openapi.vfs.VirtualFileSystem
import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import java.util.concurrent.ConcurrentHashMap
import kotlinx.serialization.json.Json

class TavernVirtualFileSystem : VirtualFileSystem(), NonPhysicalFileSystem {
    private val files = ConcurrentHashMap<TavernPath, TavernVirtualFile>()

    fun getPath(path: TavernPath): String = json.encodeToString(TavernPath.serializer(), path.canonical())

    fun findOrCreateFile(path: TavernPath): VirtualFile? {
        service<TavernVirtualFileKindRegistry>().get(path.kind) ?: return null
        return files.computeIfAbsent(path.canonical()) { TavernVirtualFile(it) }
    }

    fun cached(path: TavernPath): TavernVirtualFile? = files[path.canonical()]

    fun release(path: TavernPath) {
        files.remove(path.canonical())
    }

    fun clear() {
        files.clear()
    }

    override fun findFileByPath(path: String): VirtualFile? {
        val parsed = decode(path) ?: return null
        return findOrCreateFile(parsed)
    }

    override fun refreshAndFindFileByPath(path: String): VirtualFile? = findFileByPath(path)

    override fun extractPresentableUrl(path: String): String {
        return (refreshAndFindFileByPath(path) as? VirtualFilePathWrapper)?.presentablePath ?: path
    }

    override fun refresh(asynchronous: Boolean) {}

    override fun getProtocol(): String = PROTOCOL

    override fun addVirtualFileListener(listener: VirtualFileListener) {}

    override fun removeVirtualFileListener(listener: VirtualFileListener) {}
    override fun isReadOnly(): Boolean = true
    override fun deleteFile(requestor: Any?, file: VirtualFile) = unsupported()
    override fun moveFile(requestor: Any?, file: VirtualFile, newParent: VirtualFile) = unsupported()
    override fun renameFile(requestor: Any?, file: VirtualFile, newName: String) = unsupported()
    override fun createChildFile(requestor: Any?, file: VirtualFile, name: String): VirtualFile = unsupported()
    override fun createChildDirectory(requestor: Any?, file: VirtualFile, name: String): VirtualFile = unsupported()
    override fun copyFile(requestor: Any?, file: VirtualFile, newParent: VirtualFile, copyName: String): VirtualFile = unsupported()

    private fun unsupported(): Nothing = throw UnsupportedOperationException("Tavern virtual files are read-only")

    companion object {
        const val PROTOCOL = "tavern"

        private val json = Json
        private val log = logger<TavernVirtualFileSystem>()
        private val local = TavernVirtualFileSystem()

        fun getInstance(): TavernVirtualFileSystem = local

        fun decode(path: String): TavernPath? {
            return try {
                val raw = raw(path) ?: return null
                json.decodeFromString(TavernPath.serializer(), raw).canonical()
            } catch (err: Exception) {
                log.warn("Cannot deserialize $path", err)
                null
            }
        }

        private fun raw(path: String): String? {
            if (path.startsWith("{")) return path
            if (!path.startsWith("$PROTOCOL://")) return null
            val raw = path.substringAfter("://")
            if (raw.startsWith("{")) return raw
            if (!raw.startsWith("%7B", ignoreCase = true)) return null
            return URLDecoder.decode(raw, StandardCharsets.UTF_8)
        }
    }
}
