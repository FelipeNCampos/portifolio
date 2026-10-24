import ts from 'typescript'
import { readFileSync, writeFileSync } from 'node:fs'

// Mechanical conversion of the existing typed initial data into the Python seed.
const source = readFileSync(new URL('../src/infrastructure/profile/initialCredentials.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
const { awsCredentials, pythonBootcamp, pythonWorlds } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
writeFileSync(new URL('../backend/infrastructure/credential_seed.json', import.meta.url), JSON.stringify([...awsCredentials, pythonBootcamp, ...pythonWorlds].map(item => ({ ...item, published: true })), null, 2) + '\n')
