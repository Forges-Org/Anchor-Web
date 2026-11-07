"use client";

import {
	type KeyboardEvent,
	useCallback,
	useEffect,
	useState,
} from "react";
import { NetworkProvider } from "@/context/NetworkContext";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
	return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
}

function DashboardLayoutShell({ children }: DashboardLayoutProps) {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const closeSidebar = useCallback(() => {
		setSidebarOpen(false);
	}, []);

	const toggleSidebar = useCallback(() => {
		setSidebarOpen((prev) => !prev);
	}, []);

	// Lock body scroll when sidebar is open on mobile
	useEffect(() => {
		const previousOverflow = document.body.style.overflow;
		if (sidebarOpen) {
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [sidebarOpen]);

	// Close sidebar on Escape key press
	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			if (event.key === "Escape" && sidebarOpen) {
				closeSidebar();
			}
		},
		[sidebarOpen, closeSidebar],
	);

	// Touch swipe to close on mobile - track touch start position
	const touchStartX = useRef<number | null>(null);

	const handleTouchStart = useCallback(
		(e: React.TouchEvent<HTMLDivElement>) => {
			touchStartX.current = e.touches[0]?.clientX ?? null;
		},
		[],
	);

	const handleTouchEnd = useCallback(
		(e: React.TouchEvent<HTMLDivElement>) => {
			if (touchStartX.current === null || !sidebarOpen) return;
			const endX = e.changedTouches[0]?.clientX ?? 0;
			const deltaX = endX - touchStartX.current;
			// If swiped left by more than 50px, close the sidebar
			if (deltaX < -50) {
				closeSidebar();
			}
			touchStartX.current = null;
		},
		[sidebarOpen, closeSidebar],
	);

	return (
		<NetworkProvider>
			<div
				className="relative flex min-h-screen bg-gray-50"
				onKeyDown={handleKeyDown}
				onTouchStart={handleTouchStart}
				onTouchEnd={handleTouchEnd}
			>
				{/* Mobile Overlay */}
				{sidebarOpen && (
					<button
						type="button"
						aria-label="Close navigation"
						tabIndex={-1}
						className="fixed inset-0 z-40 bg-black/50 lg:hidden"
						onClick={closeSidebar}
					/>
				)}

				{/* Sidebar */}
				<Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

				<div className="flex flex-col flex-1 min-w-0">
					{/* TopNav */}
					<TopNav onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />

					{/* Main */}
					<a
						href="#main-content"
						className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-blue-700 focus:shadow"
					>
						Skip to content
					</a>
					<main id="main-content" className="flex-1" tabIndex={-1}>
						<div className="py-6">
							<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
								{children}
							</div>
						</div>
					</main>
				</div>
			</div>
		</NetworkProvider>
	);
}
