"use client";

import {
	Bars3Icon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNetwork } from "@/context/NetworkContext";

interface TopNavProps {
	onMenuClick: () => void;
	sidebarOpen: boolean;
}

const searchablePages = [
	{ name: "Dashboard", href: "/dashboard" },
	{ name: "Analytics", href: "/dashboard/analytics" },
	{ name: "Wallets", href: "/dashboard/wallets" },
	{ name: "Users", href: "/dashboard/users" },
	{ name: "API Keys", href: "/dashboard/api-keys" },
	{ name: "Spending Limits", href: "/dashboard/spending-limits" },
	{ name: "Settings", href: "/dashboard/settings" },
];

const networkLabel = { mainnet: "Mainnet", testnet: "Testnet" } as const;
const networkBadgeClass = {
	mainnet: "bg-blue-100 text-blue-800",
	testnet: "bg-amber-100 text-amber-800",
} as const;

export function TopNav({ onMenuClick, sidebarOpen }: TopNavProps) {
	const [searchOpen, setSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const searchInputRef = useRef<HTMLInputElement>(null);
	const pathname = usePathname();
	const { user, isLoading } = useAuth();
	const { network, setNetwork } = useNetwork();

	// Get current page title from pathname
	const pageTitle = (() => {
		const segment = pathname.split("/").filter(Boolean).pop() ?? "dashboard";
		const titleMap: Record<string, string> = {
			dashboard: "Dashboard",
			analytics: "Analytics",
			users: "Users",
			documents: "Documents",
			settings: "Settings",
			wallets: "Wallets",
			"api-keys": "API Keys",
			"spending-limits": "Spending Limits",
		};
		return titleMap[segment] ?? segment.replace(/-/g, " ");
	})();

	useEffect(() => {
		document.title = `${pageTitle} · ${networkLabel[network]} — Mux`;
	}, [pageTitle, network]);

	useEffect(() => {
		if (searchOpen) searchInputRef.current?.focus();
	}, [searchOpen]);

	const searchResults = searchablePages.filter((page) =>
		page.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
	);

	return (
		<header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/95 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 backdrop-blur supports-backdrop-filter:bg-white/60">
			{/* Menu button for mobile */}
			<button
				type="button"
				onClick={onMenuClick}
				aria-expanded={sidebarOpen}
				aria-controls="dashboard-sidebar"
				className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
			>
				<span className="sr-only">Open sidebar</span>
				<Bars3Icon className="h-6 w-6" aria-hidden="true" />
			</button>

			{/* Separator */}
			<div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

			{/* Page title and breadcrumbs */}
			<div className="flex flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
				<div className="flex flex-1 items-center">
					<h1 className="flex items-center gap-2 text-lg font-semibold text-gray-900 sm:text-xl">
						{pageTitle}
						<span
							className={`rounded-full px-2 py-0.5 text-xs font-medium ${networkBadgeClass[network]}`}
						>
							{networkLabel[network]}
						</span>
					</h1>

					{/* Breadcrumbs - hidden on mobile */}
					<nav
						aria-label="Breadcrumb"
						className="hidden lg:ml-6 lg:flex lg:items-center"
					>
						<ol className="flex items-center space-x-2 text-sm">
							<li>
								<Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
									Home
								</Link>
							</li>
							<li className="text-gray-400">/</li>
							<li
								aria-current="page"
								className="font-medium text-gray-900"
							>
								{pageTitle}
							</li>
						</ol>
					</nav>
				</div>

				{/* Right side actions */}
				<div className="flex items-center gap-x-3 sm:gap-x-6">
					{/* Network Switcher */}
					<div
						role="group"
						aria-label="Select network"
						className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-sm font-medium"
					>
						<button
							type="button"
							onClick={() => setNetwork("testnet")}
							aria-pressed={network === "testnet"}
							className={`rounded-md px-3 py-1 transition-colors ${
								network === "testnet"
									? "bg-amber-100 text-amber-800"
									: "text-gray-500 hover:text-gray-700"
							}`}
						>
							Testnet
						</button>
						<button
							type="button"
							onClick={() => setNetwork("mainnet")}
							aria-pressed={network === "mainnet"}
							className={`rounded-md px-3 py-1 transition-colors ${
								network === "mainnet"
									? "bg-blue-100 text-blue-800"
									: "text-gray-500 hover:text-gray-700"
							}`}
						>
							Mainnet
						</button>
					</div>

					{/* Search pages */}
					<div className="relative">
						<div
							className={`${searchOpen ? "w-48 sm:w-64" : "w-0"} overflow-hidden transition-all duration-300 lg:w-64 lg:transition-none`}
						>
							<div className="relative">
								<MagnifyingGlassIcon
									className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
									aria-hidden="true"
								/>
								<input
									id="dashboard-search"
									ref={searchInputRef}
									type="search"
									value={searchQuery}
									aria-label="Search dashboard pages"
									placeholder="Search pages..."
									onChange={(event) => setSearchQuery(event.target.value)}
									onFocus={() => setSearchOpen(true)}
									onKeyDown={(event) => {
										if (event.key === "Escape") {
											setSearchOpen(false);
											setSearchQuery("");
										}
									}}
									className="block w-full rounded-lg border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
								/>
							</div>
						</div>
						{searchOpen && searchQuery.trim() && (
							<div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
								{searchResults.length ? (
									searchResults.map((page) => (
										<Link
											key={page.href}
											href={page.href}
											className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
											onClick={() => {
												setSearchOpen(false);
												setSearchQuery("");
											}}
										>
											{page.name}
										</Link>
									))
								) : (
									<p className="px-3 py-2 text-sm text-gray-500" role="status">
										No matching pages
									</p>
								)}
							</div>
						)}
					</div>

					<button
						type="button"
						onClick={() => setSearchOpen((open) => !open)}
						aria-controls="dashboard-search"
						aria-expanded={searchOpen}
						className="p-2 text-gray-400 hover:text-gray-500 lg:hidden"
					>
						<span className="sr-only">Search</span>
						<MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
					</button>

					<div className="flex min-w-8 items-center gap-2">
						{isLoading ? (
							<div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" aria-label="Loading profile" />
						) : user ? (
							<>
								<div
									className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-cyan-600 text-xs font-semibold text-white"
									aria-hidden="true"
								>
									{user.name
										.split(" ")
										.map((namePart) => namePart[0])
										.slice(0, 2)
										.join("")
										.toUpperCase()}
								</div>
								<span className="hidden max-w-32 truncate text-sm font-medium text-gray-900 lg:block">
									{user.name}
								</span>
							</>
						) : (
							<span className="hidden text-sm text-gray-500 lg:block">Not signed in</span>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
