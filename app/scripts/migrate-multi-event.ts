/**
 * migrate-multi-event.ts
 *
 * One-time migration script: converts a Pickup project JSON file from the legacy
 * single-event-per-stage-per-day format to the new multi-event format.
 *
 * Changes made:
 *   - stage.schedule[day]: StageSchedule  →  stage.schedule[day]: StageSchedule[]
 *   - SlotAssignment.eventIndex (missing)  →  eventIndex: 0
 *
 * Usage:
 *   npx ts-node scripts/migrate-multi-event.ts <input-file.pickup.json> [output-file.pickup.json]
 *
 * If no output file is given, the result is written back to the input file.
 * If "--stdout" is passed as the second argument, the result is printed to stdout.
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import process from 'node:process'
import { migrateProject } from '../src/migrateMultiEvent.ts'
import type { LegacyProject } from '../src/migrateMultiEvent.ts'

function main() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error('Usage: ts-node scripts/migrate-multi-event.ts <input.pickup.json> [output.pickup.json | --stdout]')
    process.exit(1)
  }

  const inputPath = path.resolve(args[0])
  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`)
    process.exit(1)
  }

  const raw = fs.readFileSync(inputPath, 'utf-8')
  let project: LegacyProject
  try {
    project = JSON.parse(raw) as LegacyProject
  } catch {
    console.error('Input file is not valid JSON.')
    process.exit(1)
  }

  if (!Array.isArray(project.stages) || !Array.isArray(project.assignments)) {
    console.error('Input file does not appear to be a valid Pickup project.')
    process.exit(1)
  }

  const migrated = migrateProject(project)
  const output = JSON.stringify(migrated, null, 2)

  if (args[1] === '--stdout') {
    process.stdout.write(output + '\n')
  } else {
    const outputPath = args[1] ? path.resolve(args[1]) : inputPath
    fs.writeFileSync(outputPath, output, 'utf-8')
    console.log(`Migrated project written to: ${outputPath}`)
  }
}

main()
