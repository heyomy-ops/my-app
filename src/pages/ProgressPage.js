import React from 'react';

// This is a reusable component to create the line charts.
const LineChart = ({ chartId, data, labels, title, color, recommendedValue, unit }) => {
    const chartRef = React.useRef(null);
    const [isChartJsLoaded, setIsChartJsLoaded] = React.useState(!!window.Chart);

    // Effect to check for Chart.js library availability
    React.useEffect(() => {
        if (isChartJsLoaded) return;
        
        const interval = setInterval(() => {
            if (window.Chart) {
                setIsChartJsLoaded(true);
                clearInterval(interval);
            }
        }, 100); // Check every 100ms for the library

        return () => clearInterval(interval);
    }, [isChartJsLoaded]);


    React.useEffect(() => {
        // Guard clause: Don't run if the library isn't loaded or there's no data
        if (!chartRef.current || !isChartJsLoaded || !data || data.length === 0) return;

        const ctx = chartRef.current.getContext('2d');
        const chartInstance = new window.Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Intake',
                        data: data,
                        borderColor: color,
                        backgroundColor: `${color}20`, // Slightly more visible fill
                        tension: 0.4,
                        pointBackgroundColor: color,
                        pointBorderColor: '#f6f8f8', // Use light background for contrast
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        borderWidth: 2.5, // Make line thicker
                        fill: true,
                    },
                    {
                        label: 'Recommended',
                        data: Array(labels.length).fill(recommendedValue),
                        borderColor: `${color}99`,
                        borderDash: [5, 5],
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                if (context.dataset.label === 'Recommended') {
                                    return `Recommended: ${context.formattedValue} ${unit}`;
                                }
                                return `Intake: ${context.formattedValue} ${unit}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { display: false } 
                    },
                    y: {
                        grid: { color: '#334444', borderDash: [2, 2] },
                        ticks: { color: '#9ca3af' },
                        beginAtZero: false,
                    }
                }
            }
        });

        return () => chartInstance.destroy();

    }, [isChartJsLoaded, data, labels, title, color, recommendedValue, unit]);

    return (
        <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
            <div className="h-40 relative">
                <canvas ref={chartRef}></canvas>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                {labels.map((label, index) => <span key={`${chartId}-${index}`}>{label}</span>)}
            </div>
        </div>
    );
};


const ProgressPage = ({ userName, historicalData, dailyGoal, dailyProteinGoal, dailyWaterGoal, setActivePage }) => {
    const [timeframe, setTimeframe] = React.useState('10D');

    const chartData = React.useMemo(() => {
        if (!historicalData) {
            return { labels: [], calories: [], protein: [], water: [] };
        }
        
        const recentData = historicalData.slice(-10);

        const labels = recentData.map((d, i) => i + 1);
        const calories = recentData.map(d => d.calories);
        const protein = recentData.map(d => d.protein);
        const water = recentData.map(d => d.water / 1000);

        return { labels, calories, protein, water };
    }, [historicalData]);

    if (!historicalData) {
        return (
            <div className="flex-grow p-6 flex items-center justify-center text-center">
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400">Loading your progress...</p>
                 </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col min-h-full">
            <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <button className="p-2" onClick={() => setActivePage('home')}>
                        <span className="material-symbols-outlined text-gray-700 dark:text-gray-300">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">Trends</h1>
                    <div className="w-10"></div>
                </div>
                <nav className="flex justify-around border-b border-gray-200 dark:border-gray-800">
                    <button className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Daily</button>
                    <button className="py-3 px-4 text-sm font-bold text-primary border-b-2 border-primary">10 days</button>
                    <button className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Monthly</button>
                </nav>
            </header>

            <main className="flex-grow p-4 space-y-6">
                <LineChart 
                    chartId="protein"
                    labels={chartData.labels}
                    data={chartData.protein}
                    title="Protein"
                    color="#8B5CF6"
                    recommendedValue={dailyProteinGoal}
                    unit="g"
                />
                <LineChart
                    chartId="water"
                    labels={chartData.labels}
                    data={chartData.water}
                    title="Water"
                    color="#42f0f0"
                    recommendedValue={dailyWaterGoal / 1000}
                    unit="L"
                />
                <LineChart
                    chartId="calories"
                    labels={chartData.labels}
                    data={chartData.calories}
                    title="Calories"
                    color="#F59E0B"
                    recommendedValue={dailyGoal}
                    unit="kcal"
                />
            </main>
        </div>
    );
};

export default ProgressPage;

