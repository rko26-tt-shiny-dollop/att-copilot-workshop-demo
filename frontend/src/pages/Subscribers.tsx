import { api } from "../api/client";
import { useFetch } from "../api/useFetch";
import type { Subscriber } from "../api/types";

export default function Subscribers() {
  const { data, loading, error } = useFetch<Subscriber[]>(api.subscribers);

  if (loading) return <p className="text-slate-500">Loading subscribers…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Subscribers</h1>
      <table className="w-full overflow-hidden rounded-xl bg-white text-left text-sm shadow-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-3">Account</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((s) => (
            <tr key={s.id} className="border-t border-slate-100">
              <td className="px-4 py-3 font-mono">{s.accountNumber}</td>
              <td className="px-4 py-3">
                {s.firstName} {s.lastName}
              </td>
              <td className="px-4 py-3 text-slate-600">{s.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
