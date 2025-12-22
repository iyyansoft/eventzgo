import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartProps {
    data: any[];
    dataKey: string;
    xAxisKey: string;
    color?: string;
    height?: number;
}

const BarChart: React.FC<BarChartProps> = ({
    data,
    dataKey,
    xAxisKey,
    color = '#8b5cf6',
    height = 300
}) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                    dataKey={xAxisKey}
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                />
                <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                />
                <Bar
                    dataKey={dataKey}
                    fill={color}
                    radius={[8, 8, 0, 0]}
                />
            </RechartsBarChart>
        </ResponsiveContainer>
    );
};

export default BarChart;
