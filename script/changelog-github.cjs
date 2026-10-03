// taverncode_change - new file
// Custom changelog generator that wraps @changesets/changelog-github
// but strips "Thanks @user!" for team members.
const github = require("@changesets/changelog-github")

const team = new Set([
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
])

const base = github.default || github

module.exports = {
  ...base,
  getReleaseLine: async (changeset, type, options) => {
    const line = await base.getReleaseLine(changeset, type, options)
    // Strip "Thanks @user!" for team members
    return line.replace(/ Thanks \[@([^\]]+)\]\([^)]+\)!/g, (match, user) => {
      if (team.has(user)) return ""
      return match
    })
  },
}
