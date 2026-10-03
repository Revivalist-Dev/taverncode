import { Effect } from "effect"
import type { DatabaseMigration } from "../migration"

export default {
  id: "20260903104806_taverncode_board_reset",
  up(tx) {
    return Effect.gen(function* () {
      // taverncode_change start
      yield* tx.run(`ALTER TABLE \`kilo_board\` ADD \`cleared_seq\` integer DEFAULT 0 NOT NULL;`)
      // taverncode_change end
    })
  },
} satisfies DatabaseMigration.Migration
