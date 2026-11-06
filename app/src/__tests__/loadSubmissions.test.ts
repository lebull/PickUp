import { describe, expect, it } from 'vitest'
import { parseSubmissions } from '../loadSubmissions'
import { listSubmissionConverters } from '../submissionConverters'

describe('parseSubmissions converter support', () => {
  it('parses legacy moonlight format with moonlight fields', () => {
    const csv = [
      'Submission #,Timestamp,Email Address,DJ Name,Fur Name,Email for communication,Telegram/Discord,Social Media,Phone Number,Submission Link,Mix Genre,Have you played other shows,Format,Tell us about you,What days are you available,Notes for judges,First Choice,Second Choice,Third Choice,Fourth Choice,Fifth Choice,Are you interested in DJing for the Moonlight,Why do you want to perform for moonlight,Moonlight Festival Music Genre,Moonlight Festival Specific Submission,Judge 1: Technical,Judge 1: Flow,Judge 1: Entertainment,Judge 1: Notes,Judge 2: Technical,Judge 2: Flow,Judge 2: Entertainment,Judge 2: Notes,Judge 3: Technical,Judge 3: Flow,Judge 3: Entertainment,Judge 3: Notes,Judge ML: Technical,Judge ML: Flow,Judge ML: Entertainment,Judge ML: Vibefit,Judge ML: Notes',
      '100,2026-01-01,user@example.com,DJ Legacy,Fur Legacy,dj@example.com,@legacy,@legacy,555-0100,https://example.com/mix,House,Yes,CDJs,Legacy bio,Friday,Legacy note,Main Stage,Second Stage,,, ,Yes,For the crowd,Progressive,https://example.com/ml,8,7,9,Good,7,7,8,Solid,9,8,8,Strong,8,8,7,High,Great',
    ].join('\n')

    const rows = parseSubmissions(csv, 'nyff-2025-moonlight')

    expect(rows).toHaveLength(1)
    expect(rows[0].moonlightInterest).toBe(true)
    expect(rows[0].stagePreferences).toEqual(['Main Stage', 'Second Stage'])
    expect(rows[0].mlScore.avg).toBe(7.67)
    expect(rows[0].mainScore.avg).toBe(7.89)
  })

  it('parses standard format without moonlight-specific columns', () => {
    const csv = [
      'Submission #,Timestamp,Email Address,DJ Name,Fur Name,Email for communication,Telegram/Discord,Phone Number (Only for use when all other contact methods fail),Submission Link,Mix Genre?,Have you played other shows/cons? (Virtual Events included!),Format,Tell us about you! ,What days are you available?,Notes for Judges,Judge 1: Technical,Judge 1: Flow,Judge 1: Entertainment,Judge 1: Notes,Judge 2: Technical,Judge 2: Flow,Judge 2: Entertainment,Judge 2: Notes,Judge 3: Technical,Judge 3: Flow,Judge 3: Entertainment,Judge 3: Notes',
      '200,2026-08-01,user2@example.com,DJ Modern,Fur Modern,modern@example.com,@modern,555-0101,https://example.com/mix2,DnB,No,Laptop,Modern bio,Saturday,Modern note,9,8,7,Judge1 note,8,8,8,Judge2 note,7,7,7,Judge3 note',
    ].join('\n')

    const rows = parseSubmissions(csv, 'nyff-2026-standard')

    expect(rows).toHaveLength(1)
    expect(rows[0].moonlightInterest).toBe(false)
    expect(rows[0].stagePreferences).toEqual([])
    expect(rows[0].mlScore.avg).toBeNull()
    expect(rows[0].mainScore.avg).toBe(7.67)
  })

  it('marks standard three-judge submissions partial when only two judges have scored', () => {
    const csv = [
      'Submission #,Timestamp,Email Address,DJ Name,Fur Name,Email for communication,Telegram/Discord,Phone Number (Only for use when all other contact methods fail),Submission Link,Mix Genre?,Have you played other shows/cons? (Virtual Events included!),Format,Tell us about you! ,What days are you available?,Notes for Judges,Judge 1: Technical,Judge 1: Flow,Judge 1: Entertainment,Judge 1: Notes,Judge 2: Technical,Judge 2: Flow,Judge 2: Entertainment,Judge 2: Notes,Judge 3: Technical,Judge 3: Flow,Judge 3: Entertainment,Judge 3: Notes',
      '201,2026-08-02,user3@example.com,DJ Partial,Fur Partial,partial@example.com,@partial,555-0102,https://example.com/mix3,House,No,Laptop,Partial bio,Sunday,Partial note,9,8,7,Judge1 note,8,9,8,Judge2 note,,,',
    ].join('\n')

    const rows = parseSubmissions(csv, 'nyff-2026-standard')

    expect(rows[0].mainScore.partial).toBe(true)
    expect(rows[0].mainScore.avg).toBe(8.16)
  })
})

describe('submission converter ordering', () => {
  it('lists newest converters first', () => {
    const converters = listSubmissionConverters()
    expect(converters[0].id).toBe('nyff-2026-standard')
    expect(converters[1].id).toBe('nyff-2025-moonlight')
  })
})
