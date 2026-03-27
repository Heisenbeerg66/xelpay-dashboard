export default function LoadingGateways() {
    return (
        <div className="p-4 md:p-8 w-full max-w-6xl mx-auto min-h-screen bg-gray-50/50">
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-3">
                    <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-4 w-72 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="h-12 w-40 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-40 animate-pulse flex flex-col justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gray-100 rounded-xl"></div>
                            <div className="space-y-2 flex-1">
                                <div className="h-5 w-24 bg-gray-200 rounded"></div>
                                <div className="h-3 w-32 bg-gray-100 rounded"></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
                            <div className="h-8 w-8 bg-gray-100 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}