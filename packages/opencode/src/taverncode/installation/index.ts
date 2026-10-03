export const Npm = {
  name: "@taverncode/cli",
  path: "@taverncode%2fcli",
}

export const Brew = {
  name: "tavern",
  tap: "Kilo-Org/tap",
  formula: "Kilo-Org/tap/tavern",
  api: "https://formulae.brew.sh/api/formula/tavern.json",
}

export const Choco = {
  name: "tavern",
  api: "https://community.chocolatey.org/api/v2/Packages?$filter=Id%20eq%20%27tavern%27%20and%20IsLatestVersion&$select=Version",
}

export const Scoop = {
  name: "tavern",
  manifest: "https://raw.githubusercontent.com/ScoopInstaller/Main/master/bucket/tavern.json",
}

export const Release = {
  install: "https://kilo.ai/cli/install",
}
