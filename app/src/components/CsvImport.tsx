import { useRef, useState } from 'react'
import { parseSubmissions } from '../loadSubmissions.ts'
import type { Submission } from '../types.ts'

interface Props {
  onImport: (submissions: Submission[], fileName: string, csvText: string) => void
}

export function CsvImport({ onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    try {
      const text = await file.text()
      const submissions = parseSubmissions(text)
      setError(null)
      onImport(submissions, file.name, text)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse CSV')
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset so the same file can be re-selected if needed
    e.target.value = ''
  }

  return (
    <div className="csv-import">
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <button className="import-button" onClick={() => inputRef.current?.click()}>
        Import CSV
      </button>
      {error && <p className="import-error">{error}</p>}
    </div>
  )
}
