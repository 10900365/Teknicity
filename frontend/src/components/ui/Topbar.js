import React from 'react';

const Topbar = ({ title = 'TekniCity', onOpenMobile, onBack }) => {
	return (
		<div className="w-full bg-white border-b md:hidden sticky top-0 z-30">
			<div className="flex items-center justify-between px-4 py-2">
				<button
					onClick={onOpenMobile}
					aria-label="Open menu"
					className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
				>
					<svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>

				<div className="text-lg font-semibold text-gray-800">{title}</div>

				{onBack ? (
					<button
						onClick={onBack}
						aria-label="Back"
						className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
					>
						<svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>
				) : (
					<div className="w-8" />
				)}
			</div>
		</div>
	);
};

export default Topbar;

