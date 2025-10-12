import React, { useEffect, useMemo, useRef } from 'react';
// FIX 1: Import Chart.js and its components
import { Chart, registerables } from 'chart.js';

// FIX 2: Register the components you'll use. This is a crucial step for Chart.js v3+.
Chart.register(...registerables);


// This is a reusable component to create the line charts.
const LineChart = ({ chartId, data, labels, title, color, recommendedValue, unit }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        // Guard clause: Don't run if there's no canvas context or no data
        if (!chartRef.current || !data || data.length === 0) return;

        const ctx = chartRef.current.getContext('2d');

        // Destroy previous chart instance if it exists to prevent memory leaks
        if (chartRef.current.chartInstance) {
            chartRef.current.chartInstance.destroy();
        }

        // FIX 3: Use the imported 'Chart' object directly, not 'window.Chart'
        const chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Intake',
                        data: data,
                        borderColor: color,
                        backgroundColor: `${color}20`,
                        tension: 0.4,
                        pointBackgroundColor: color,
                        pointBorderColor: '#f7f7f7',
                        pointHoverRadius: 7,
                        borderWidth: 2.5,
                        fill: true,
                    },
                    ...(recommendedValue && typeof recommendedValue === 'number' && recommendedValue > 0 ? [{
                        label: 'Recommended',
                        data: Array(labels.length).fill(recommendedValue),
                        borderColor: `${color}99`,
                        borderDash: [5, 5],
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false,
                    }] : [])
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
                        ticks: {
                            color: '#9ca3af',
                            maxRotation: 0,
                            minRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 7
                        }
                    },
                    y: {
                        grid: { color: '#334155', borderDash: [2, 2] },
                        ticks: { color: '#9ca3af' },
                        beginAtZero: false,
                    }
                }
            }
        });

        chartRef.current.chartInstance = chartInstance;

        // Cleanup function to destroy the chart when the component unmounts
        return () => {
            if(chartInstance) {
                 chartInstance.destroy();
            }
        };
    }, [data, labels, title, color, recommendedValue, unit]);

    // FIX 4: Added a check to prevent division by zero if data is empty
    const averageValue = data.length > 0 ? data.reduce((a, b) => a + b, 0) / data.length : 0;

    return (
        <div className="p-4 bg-card-light dark:bg-card-dark rounded-xl shadow-sm">
            <div className="flex justify-between items-center">
                 <h2 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-2">{title}</h2>
                 <div className="text-right">
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Avg Intake</p>
                    <p className="font-bold text-text-main-light dark:text-text-main-dark">{averageValue.toFixed(1)} {unit}</p>
                 </div>
            </div>
            <div className="h-40 relative">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
};


const ProgressPage = ({ historicalData, dailyGoal, dailyProteinGoal, dailyWaterGoal, setActivePage }) => {

    const chartData = useMemo(() => {
        if (!historicalData) {
            return { labels: [], calories: [], protein: [], water: [] };
        }

        const recentData = historicalData.slice(-10);

        const labels = recentData.map(d => {
            // Using a more robust date parsing method to avoid timezone issues.
            // Assuming d.date is in a format like 'YYYY-MM-DD'.
            const date = new Date(d.date + 'T00:00:00'); // Treat date as local
            return `${date.getDate()}/${date.getMonth() + 1}`;
        });
        const calories = recentData.map(d => d.calories);
        const protein = recentData.map(d => d.protein);
        const water = recentData.map(d => d.water / 1000); // Convert ml to L for chart

        return { labels, calories, protein, water };
    }, [historicalData]);

    if (!historicalData || historicalData.length === 0) {
        return (
            <div className="flex-grow p-6 flex items-center justify-center text-center">
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading your progress...</p>
                 </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full">
            <header className="p-4 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700/50">
                <button className="p-2" onClick={() => setActivePage('home')}>
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <h1 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">Your Trends</h1>
                <div className="w-10"></div> {/* Spacer */}
            </header>

            <main className="flex-grow p-4 space-y-6">
                 <LineChart
                    chartId="calories"
                    labels={chartData.labels}
                    data={chartData.calories}
                    title="Calories"
                    color="#F59E0B"
                    recommendedValue={dailyGoal}
                    unit="kcal"
                />
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
                    color="#3B82F6"
                    recommendedValue={dailyWaterGoal / 1000}
                    unit="L"
                />
            </main>
        </div>
    );
};

export default ProgressPage;