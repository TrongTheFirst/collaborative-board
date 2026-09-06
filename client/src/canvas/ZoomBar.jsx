function ZoomBar({zoomPercent, zoom}){
    return(
        <div className="fixed z-20 bottom-6 left-6">
            <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-xl shadow-sm px-1.5 py-1.5">
                <button
                    type="button"
                    aria-label="Zoom out"
                    title="Zoom out"
                    className="art-button w-7 h-7"
                    onClick={zoom.zoomOut}
                >
                    -
                </button>

                <button
                    type="button"
                    aria-label="Reset zoom"
                    title="Reset zoom"
                    className="px-2.5 h-7 flex items-center justify-center text-xs font-medium text-gray-600 hover:bg-gray-300 rounded-lg transition-colors cursor-pointer min-w-[44px]"
                    onClick={zoom.resetZoom}
                >
                    {`${zoomPercent}%`}
                </button>

                <button
                    type="button"
                    aria-label="Zoom in"
                    title="Zoom in"
                    className="art-button w-7 h-7"
                    onClick={zoom.zoomIn}
                >
                    +
                </button>
            </div>
        </div>
    )
}

export default ZoomBar;