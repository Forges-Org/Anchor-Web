"use client";
import { useEffect, useState } from "react";

export default function RequestsToday() {
	const [count, setCount] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [reloadKey, setReloadKey] = useState(0);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(false);
		fetch("/api/requests/today", { signal: controller.signal })
			.then((res) => {
				if (!res.ok) throw new Error(`Request failed: ${res.status}`);
				return res.json();
			})
			.then((data) => {
				if (Number.isSafeInteger(data?.count) && data.count >= 0) {
					setCount(data.count);
				} else {
					throw new Error("Invalid response");
				}
			})
			.catch(() => {
				if (!controller.signal.aborted) setError(true);
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});
		return () => {
			controller.abort();
		};
	}, [reloadKey]);

	if (loading) {
		return (
			<div role="status" aria-live="polite" className="rounded-md border p-4 text-sm text-zinc-500">
				Loading API requests today...
			</div>
		);
	}
	if (error) {
		return (
			<div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4">
				<p className="text-sm text-red-800">Unable to load API requests today.</p>
				<button
					type="button"
					onClick={() => setReloadKey((key) => key + 1)}
					className="mt-3 text-sm font-medium text-red-800 underline underline-offset-2"
				>
					Try again
				</button>
			</div>
		);
	}
	return (
		<section aria-labelledby="requests-today-title" className="rounded-md border bg-white p-4">
			<h2 id="requests-today-title" className="text-sm text-zinc-500">
				API requests today
			</h2>
			<p className="mt-1 text-2xl font-semibold tabular-nums">
				{new Intl.NumberFormat().format(count ?? 0)}
			</p>
		</section>
	);
}
