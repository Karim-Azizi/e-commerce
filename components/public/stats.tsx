import {
  Package,
  Store,
  FileText,
} from 'lucide-react'

type PublicStatsProps = {
  products: number
  vendors: number
  rfqs: number
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 mb-4">
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-bold text-slate-900">
        {value.toLocaleString()}
      </p>
    </div>
  )
}

export function PublicStats({ products, vendors, rfqs }: PublicStatsProps) {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900">
          Trusted Global B2B Marketplace
        </h2>
        <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
          Connect with verified suppliers and discover millions of products across industries.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <StatCard
            icon={<Package className="h-6 w-6" />}
            label="Active Products"
            value={products}
          />
          <StatCard
            icon={<Store className="h-6 w-6" />}
            label="Verified Suppliers"
            value={vendors}
          />
          <StatCard
            icon={<FileText className="h-6 w-6" />}
            label="Open RFQs"
            value={rfqs}
          />
        </div>
      </div>
    </section>
  )
}