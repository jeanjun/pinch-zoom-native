import minimist from 'minimist'
import { execSync } from 'child_process'

const argv = minimist(process.argv.slice(2))
let command = 'turbo run dev'

if (argv.select) {
  const appName = argv.select

  command = `turbo run dev --filter=${appName}...`
}

try {
  execSync(command, { stdio: 'inherit' })
} catch (error) {
  console.error('Error executing command:', error)
  process.exit(1)
}