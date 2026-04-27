'use client'

import { CheckCircle2, Circle, Clock } from 'lucide-react'

type Step = {
  key: string
  label: string
  description: string
}

const STEPS: Step[] = [
  { key: 'created',  label: 'Auftrag erstellt',    description: 'Dein Auftrag ist live' },
  { key: 'offers',   label: 'Angebote eingegangen', description: 'Dienstleister haben Interesse' },
  { key: 'accepted', label: 'Angebot akzeptiert',   description: 'Du hast einen Anbieter gewählt' },
  { key: 'paid',     label: 'Zahlung erfolgt',       description: 'Betrag sicher hinterlegt' },
  { key: 'done',     label: 'Abgeschlossen',         description: 'Auftrag erledigt' },
]

type Props = {
  status: string       // open | in_progress | completed
  offersCount: number
  hasAcceptedOffer: boolean
  isPaid: boolean
}

export default function StatusTimeline({ status, offersCount, hasAcceptedOffer, isPaid }: Props) {
  // Determine which steps are active
  const activeIndex = (() => {
    if (status === 'completed') return 4
    if (isPaid) return 3
    if (hasAcceptedOffer) return 2
    if (offersCount > 0) return 1
    return 0
  })()

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Auftrags-Status</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />

        <div className="space-y-5">
          {STEPS.map((step, i) => {
            const done = i <= activeIndex
            const current = i === activeIndex
            return (
              <div key={step.key} className="flex items-start gap-4 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                  done
                    ? current
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                      : 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-300'
                }`}>
                  {done && !current
                    ? <CheckCircle2 size={16} />
                    : current
                    ? <Clock size={16} className="animate-pulse" />
                    : <Circle size={16} />
                  }
                </div>
                <div className="pt-1">
                  <p className={`text-sm font-semibold ${done ? 'text-gray-900' : 'text-gray-300'}`}>
                    {step.label}
                    {i === 1 && offersCount > 0 && (
                      <span className="ml-2 text-xs font-normal text-orange-500">({offersCount})</span>
                    )}
                  </p>
                  {done && (
                    <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
