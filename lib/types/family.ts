export interface FamilyEvent {
  id: string
  title: string
  description: string | null
  date: string
  event_type: string
  location: string | null
  created_by: string
  created_at: string
  cover_image: string | null
  photoCount?: number
}

export interface FamilyPhoto {
  id: string
  url: string
  caption: string
  date: string
  event_type: string
  created_at: string
  created_by: string
}

export const EVENT_TYPES = [
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "holiday", label: "Holiday" },
  { value: "graduation", label: "Graduation" },
  { value: "wedding", label: "Wedding" },
  { value: "reunion", label: "Reunion" },
  { value: "other", label: "Other" },
]

export function getEventTypeLabel(value: string): string {
  const eventType = EVENT_TYPES.find((type) => type.value === value)
  return eventType ? eventType.label : "Other"
}
