import { useRef, useState } from 'react'
import { parseSubmissions } from '../loadSubmissions.ts'
import type { Submission } from '../types.ts'
import { listSubmissionConverters } from '../submissionConverters.ts'

interface Props {
  onImport: (
    submissions: Submission[],
    fileName: string,
    csvText: string,
    converterId: string
  ) => void
}

export function CsvImport({ onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const converters = listSubmissionConverters()
  const [converterId, setConverterId] = useState<string>(converters[0]?.id ?? '')

  async function handleFile(file: File) {
    try {
      const text = await file.text()
      const submissions = parseSubmissions(text, converterId)
      setError(null)
      onImport(submissions, file.name, text, converterId)
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
      <label className="converter-select-wrap">
        <span className="converter-select-label">Converter</span>
        <select
          className="converter-select"
          value={converterId}
          onChange={(e) => setConverterId(e.target.value)}
        >
          {converters.map((converter) => (
            <option key={converter.id} value={converter.id}>
              {converter.name}
            </option>
          ))}
        </select>
      </label>
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
