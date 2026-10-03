import { $ } from "bun"
import semver from "semver"
import path from "path"

const rootPkgPath = path.resolve(import.meta.dir, "../../../package.json")
const rootPkg = await Bun.file(rootPkgPath).json()
const expectedBunVersion = rootPkg.packageManager?.split("@")[1]

if (!expectedBunVersion) {
  throw new Error("packageManager field not found in root package.json")
}

// relax version requirement
const expectedBunVersionRange = `^${expectedBunVersion}`

if (!semver.satisfies(process.versions.bun, expectedBunVersionRange)) {
  throw new Error(`This script requires bun@${expectedBunVersionRange}, but you are using bun@${process.versions.bun}`)
}
// taverncode_change start
const env = {
  TAVERN_CHANNEL: process.env["TAVERN_CHANNEL"],
  TAVERN_BUMP: process.env["TAVERN_BUMP"],
  TAVERN_VERSION: process.env["TAVERN_VERSION"],
  TAVERN_RELEASE: process.env["TAVERN_RELEASE"],
  TAVERN_PRE_RELEASE: process.env["TAVERN_PRE_RELEASE"],
}
// taverncode_change end
const CHANNEL = await (async () => {
  if (env.TAVERN_CHANNEL) return env.TAVERN_CHANNEL // taverncode_change
  // taverncode_change start - publish to "rc" channel for pre-releases
  if (env.TAVERN_PRE_RELEASE === "true") return "rc"
  // taverncode_change end
  if (env.TAVERN_BUMP) return "latest" // taverncode_change
  if (env.TAVERN_VERSION && !env.TAVERN_VERSION.startsWith("0.0.0-")) return "latest" // taverncode_change
  return await $`git branch --show-current`.text().then((x) => x.trim().replace(/[^0-9A-Za-z-]/g, "-")) // taverncode_change
})()
const IS_PREVIEW = CHANNEL !== "latest"

// taverncode_change start - shared helpers for version computation
function parseVersion(input: string) {
  const match = input.trim().match(/^v?(\d+)\.(\d+)\.(\d+)$/)
  if (!match) return
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    value: `${match[1]}.${match[2]}.${match[3]}`,
  }
}

function compareVersion(
  a: NonNullable<ReturnType<typeof parseVersion>>,
  b: NonNullable<ReturnType<typeof parseVersion>>,
) {
  if (a.major !== b.major) return a.major - b.major
  if (a.minor !== b.minor) return a.minor - b.minor
  return a.patch - b.patch
}

async function fetchLatest() {
  const data: any = await fetch("https://registry.npmjs.org/@taverncode/cli/latest").then((res) => {
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  })
  return data.version as string
}

async function fetchHighest() {
  if (!process.env.GH_REPO) return fetchLatest()
  const data: { tagName: string }[] = await $`gh release list --json tagName --limit 100 --repo ${process.env.GH_REPO}`
    .json()
    .catch(() => [])
  const versions = data.flatMap((item) => {
    const version = parseVersion(item.tagName)
    if (!version) return []
    return [version]
  })
  const highest = versions.sort(compareVersion).at(-1)
  if (highest) return highest.value
  return fetchLatest()
}

function bumpVersion(current: string, type: string) {
  const version = parseVersion(current)
  if (!version) throw new Error(`Invalid version: ${current}`)
  if (type === "major") return `${version.major + 1}.0.0`
  if (type === "minor") return `${version.major}.${version.minor + 1}.0`
  return `${version.major}.${version.minor}.${version.patch + 1}`
}
// taverncode_change end

const VERSION = await (async () => {
  if (env.TAVERN_VERSION) return env.TAVERN_VERSION
  if (IS_PREVIEW) {
    // taverncode_change start - rc releases use plain semver required by VS Code Marketplace
    if (env.TAVERN_BUMP && env.TAVERN_PRE_RELEASE === "true") {
      const current = await fetchHighest()
      return bumpVersion(current, env.TAVERN_BUMP.toLowerCase())
    }
    // taverncode_change end
    return `0.0.0-${CHANNEL}-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "")}`
  }
  const version = await fetchHighest() // taverncode_change
  return bumpVersion(version, env.TAVERN_BUMP?.toLowerCase() ?? "patch") // taverncode_change
})()

// taverncode_change start
const team = [
  "actions-user",
  "alexkgold",
  "arimesser",
  "arkadiykondrashov",
  "bturcotte520",
  "chrarnoldus",
  "codingelves",
  "dependabot[bot]",
  "dosire",
  "Drixled",
  "DScdng",
  "emilieschario",
  "eshurakov",
  "evanjacobson",
  "Helix-Tavern",
  "iscekic",
  "jeanduplessis",
  "jobrietbergen",
  "johnnyeric",
  "jrf0110",
  "tavern-code-bot",
  "tavern-code-bot[bot]",
  "tavern-maintainer[bot]",
  "taverncode-bot",
  "tavernconnect-lite[bot]",
  "tavernconnect[bot]",
  "kirillk",
  "lambertjosh",
  "marius-kilocode",
  "olearycrew",
  "pandemicsyn",
  "pedroheyerdahl",
  "RSO",
  "sbreitenother",
  "St0rmz1",
  "suhailkc2025",
]
// taverncode_change end

export const Script = {
  get channel() {
    return CHANNEL
  },
  get version() {
    return VERSION
  },
  get preview() {
    return IS_PREVIEW
  },
  get release(): boolean {
    return !!env.TAVERN_RELEASE
  },
  get team() {
    return team
  },
}
console.log(`tavern script`, JSON.stringify(Script, null, 2)) // taverncode_change
