'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data for portfolio performance
const data = [
  { date: '2024-01-01', value: 1000, yield: 0 },
  { date: '2024-01-02', value: 1012, yield: 1.2 },
  { date: '2024-01-03', value: 1025, yield: 2.5 },
  { date: '2024-01-04', value: 1018, yield: 1.8 },
  { date: '2024-01-05', value: 1035, yield: 3.5 },
  { date: '2024-01-06', value: 1042, yield: 4.2 },
  { date: '2024-01-07', value: 1058, yield: 5.8 },
  { date: '2024-01-08', value: 1071, yield: 7.1 },
  { date: '2024-01-09', value: 1089, yield: 8.9 },
  { date: '2024-01-10', value: 1095, yield: 9.5 },
  { date: '2024-01-11', value: 1112, yield: 11.2 },
  { date: '2024-01-12', value: 1128, yield: 12.8 },
  { date: '2024-01-13', value: 1145, yield: 14.5 },
  { date: '2024-01-14', value: 1162, yield: 16.2 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-gray-300 text-sm mb-1">{`Date: ${label}`}</p>
        <p className="text-blue-400 font-semibold">
          {`Value: ${payload[0].value.toFixed(2)} FLOW`}
        </p>
        <p className="text-green-400 font-semibold">
          {`Yield: +${payload[1].value.toFixed(1)}%`}
        </p>
      </div>
    )
  }
  return null
}

export function PortfolioChart() {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            fontSize={12}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tickFormatter={(value) => `${value} FLOW`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3B82F6" 
            strokeWidth={3}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="yield" 
            stroke="#10B981" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-300">Portfolio Value</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-300">Yield %</span>
        </div>
      </div>
    </div>
  )
}