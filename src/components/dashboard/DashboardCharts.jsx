"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../App" // Import AuthContext
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Fallback data in case of errors
const fallbackLeadData = [
  { month: "Jan", enquiries: 30, orders: 12 },
  { month: "Feb", enquiries: 35, orders: 15 },
  { month: "Mar", enquiries: 32, orders: 14 },
  { month: "Apr", enquiries: 45, orders: 20 },
  { month: "May", enquiries: 40, orders: 18 },
  { month: "Jun", enquiries: 38, orders: 16 },
]

const fallbackConversionData = [
  { name: "Enquiries", value: 82, color: "#8b5cf6" },
  // { name: "Quotations", value: 56, color: "#d946ef" },
  { name: "Orders", value: 27, color: "#ec4899" },
]

const fallbackSourceData = [
  { name: "Indiamart", value: 0, color: "#06b6d4" },
  { name: "Justdial", value: 0, color: "#0ea5e9" },
  { name: "Social Media", value: 0, color: "#3b82f6" },
  { name: "Website", value: 0, color: "#6366f1" },
  { name: "Referrals", value: 0, color: "#8b5cf6" },
]

function DashboardCharts() {
  const { currentUser, userType, isAdmin } = useContext(AuthContext) // Get user info and admin function
  const [leadData, setLeadData] = useState(fallbackLeadData)
  const [conversionData, setConversionData] = useState(fallbackConversionData)
  const [sourceData, setSourceData] = useState(fallbackSourceData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch data from Enquiry to Order sheet
        const enquiryUrl =
          "https://docs.google.com/spreadsheets/d/18y2Pcg_GW0pxw-oJ-nA3MJtj6NJ2ESGqbn5DErLpFpQ/gviz/tq?tqx=out:json&sheet=Enquiry to Order"
        const enquiryResponse = await fetch(enquiryUrl)
        const enquiryText = await enquiryResponse.text()

        // Extract JSON from Enquiry to Order sheet response
        const enquiryJsonStart = enquiryText.indexOf("{")
        const enquiryJsonEnd = enquiryText.lastIndexOf("}") + 1
        const enquiryJsonData = enquiryText.substring(enquiryJsonStart, enquiryJsonEnd)
        const enquiryData = JSON.parse(enquiryJsonData)

        // Process data for the Overview chart (monthly data)
        if (enquiryData && enquiryData.table && enquiryData.table.rows) {
          // Initialize counters by month
          const monthlyData = {
            Jan: { enquiries: 0, orders: 0 },
            Feb: { enquiries: 0, orders: 0 },
            Mar: { enquiries: 0, orders: 0 },
            Apr: { enquiries: 0, orders: 0 },
            May: { enquiries: 0, orders: 0 },
            Jun: { enquiries: 0, orders: 0 },
            Jul: { enquiries: 0, orders: 0 },
            Aug: { enquiries: 0, orders: 0 },
            Sep: { enquiries: 0, orders: 0 },
            Oct: { enquiries: 0, orders: 0 },
            Nov: { enquiries: 0, orders: 0 },
            Dec: { enquiries: 0, orders: 0 },
          }

          // Count enquiries by month (filtering by user)
          enquiryData.table.rows.forEach((row) => {
            if (row.c && row.c[0] && row.c[0].v) {
              // Get the assigned user from column AQ (index 42)
              const assignedUser = row.c[56] ? row.c[56].v : ""

              // Check if this row should be included based on user permissions
              const shouldInclude = isAdmin() || (currentUser && assignedUser === currentUser.username)

              // Only process rows that match the user filter
              if (shouldInclude) {
                // Extract month from date (assuming format is DD/MM/YYYY)
                const dateStr = row.c[0].v
                let month

                // Handle different date formats
                if (typeof dateStr === "string") {
                  if (dateStr.includes("/")) {
                    // Format: DD/MM/YYYY
                    const parts = dateStr.split("/")
                    if (parts.length === 3) {
                      const monthNum = Number.parseInt(parts[1]) - 1 // 0-indexed
                      month = new Date(2000, monthNum, 1).toLocaleString("en-US", { month: "short" })
                    }
                  } else if (dateStr.startsWith("Date(")) {
                    // Format: Date(YYYY,MM,DD)
                    const matches = dateStr.match(/Date\((\d+),(\d+),(\d+)/)
                    if (matches && matches.length >= 3) {
                      const monthNum = Number.parseInt(matches[2])
                      month = new Date(2000, monthNum, 1).toLocaleString("en-US", { month: "short" })
                    }
                  }
                } else if (dateStr instanceof Date) {
                  month = dateStr.toLocaleString("en-US", { month: "short" })
                }

                if (month && monthlyData[month]) {
                  monthlyData[month].enquiries++
                  
                  // Check if this is an order (both AH and AI are not null)
                  if (row.c[11] && row.c[11].v && row.c[12] && row.c[12].v) {
                    monthlyData[month].orders++
                  }
                }
              }
            }
          })

          // Convert to array format for the chart
          const chartData = Object.entries(monthlyData).map(([month, data]) => ({
            month,
            enquiries: data.enquiries,
            orders: data.orders,
          }))

          // Filter to only include months with data
          const nonEmptyMonths = chartData.filter((month) => month.enquiries > 0 || month.orders > 0)

          // Update state if we have data
          if (nonEmptyMonths.length > 0) {
            setLeadData(nonEmptyMonths)
          }
        }

        // Process data for the Conversion Funnel (filtering by user)
        if (enquiryData && enquiryData.table && enquiryData.table.rows) {
          // Count total enquiries from Enquiry to Order sheet (filtered by user)
          const totalEnquiries = enquiryData.table.rows.slice(2).filter((row) => {
            // Get the assigned user from column AQ (index 42)
            const assignedUser = row.c && row.c[56] ? row.c[56].v : ""

            // Check if this row should be included based on user permissions
            const shouldInclude = isAdmin() || (currentUser && assignedUser === currentUser.username)

            // Count rows with data in column B (index 1)
            return row.c && row.c[1] && row.c[1].v && shouldInclude
          }).length

          // Count total quotations from Enquiry to Order sheet where column AH is not null (filtered by user)
          // const totalQuotations = enquiryData.table.rows.filter((row) => {
          //   // Get the assigned user from column AQ (index 42)
          //   const assignedUser = row.c && row.c[56] ? row.c[56].v : ""

          //   // Check if this row should be included based on user permissions
          //   const shouldInclude = isAdmin() || (currentUser && assignedUser === currentUser.username)

          //   return row.c && row.c[37] && row.c[37].v && shouldInclude
          // }).length

          // Count total orders from Enquiry to Order sheet where both AH and AI are not null (filtered by user)
          const totalOrders = enquiryData.table.rows.filter((row) => {
            // Get the assigned user from column AQ (index 42)
            const assignedUser = row.c && row.c[56] ? row.c[56].v : ""

            // Check if this row should be included based on user permissions
            const shouldInclude = isAdmin() || (currentUser && assignedUser === currentUser.username)

            return row.c && row.c[11] && row.c[11].v && row.c[12] && row.c[12].v && shouldInclude
          }).length

          // Create conversion data
          const newConversionData = [
            { name: "Enquiries", value: totalEnquiries, color: "#8b5cf6" },
            // { name: "Quotations", value: totalQuotations, color: "#d946ef" },
            { name: "Orders", value: totalOrders, color: "#ec4899" },
          ]

          setConversionData(newConversionData)
        }

        // Process data for the Lead Sources chart (filtering by user)
        if (enquiryData && enquiryData.table && enquiryData.table.rows) {
          // Count enquiries by source from Enquiry to Order sheet column C (index 2)
          const sourceCounter = {}

          // Define a color palette that will cycle through different colors
          const colorPalette = [
            "#06b6d4", // cyan
            "#0ea5e9", // sky
            "#3b82f6", // blue
            "#6366f1", // indigo
            "#8b5cf6", // violet
            "#a855f7", // purple
            "#d946ef", // fuchsia
            "#ec4899", // pink
            "#f43f5e", // rose
            "#ef4444", // red
            "#f97316", // orange
            "#f59e0b", // amber
            "#eab308", // yellow
            "#84cc16", // lime
            "#22c55e", // green
            "#10b981", // emerald
            "#14b8a6", // teal
          ]

          enquiryData.table.rows.slice(1).forEach((row) => {
            if (row.c && row.c[2] && row.c[2].v) {
              // Get the assigned user from column AQ (index 42)
              const assignedUser = row.c[56] ? row.c[56].v : ""

              // Check if this row should be included based on user permissions
              const shouldInclude = isAdmin() || (currentUser && assignedUser === currentUser.username)

              // Only count sources for rows that match the user filter
              if (shouldInclude) {
                const source = row.c[2].v
                sourceCounter[source] = (sourceCounter[source] || 0) + 1
              }
            }
          })

          // Convert to array format for the chart with dynamic color assignment
          const sourceNames = Object.keys(sourceCounter)
          const newSourceData = sourceNames.map((name, index) => ({
            name,
            value: sourceCounter[name],
            color: colorPalette[index % colorPalette.length], // Cycle through colors
          }))

          // Sort by value (descending)
          newSourceData.sort((a, b) => b.value - a.value)

          // Update state if we have data
          if (newSourceData.length > 0) {
            setSourceData(newSourceData)
          }
        }
      } catch (error) {
        console.error("Error fetching chart data:", error)
        setError(error.message)
        // Fallback to demo data is already handled since we initialized state with it
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentUser, isAdmin]) // Add dependencies for user context

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Sales Analytics (Enquiry To Order)</h3>
        {/* Display admin view indicator similar to FollowUp page */}
        {isAdmin() && <p className="text-green-600 font-semibold">Admin View: Showing all data</p>}
      </div>

      {isLoading ? (
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-slate-500">Loading chart data...</p>
        </div>
      ) : error ? (
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-red-500">Error loading data. Using fallback data.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overview Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold mb-4 text-slate-800">Monthly Overview</h4>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enquiries" name="Enquiries" fill="#8b5cf6" />
                  <Bar dataKey="orders" name="Orders" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Conversion Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold mb-4 text-slate-800">Conversion Funnel</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={conversionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {conversionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col justify-center">
                <h5 className="text-md font-medium mb-4 text-slate-700">Conversion Details</h5>
                <div className="space-y-4">
                  {conversionData.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${(item.value / (conversionData[0].value || 1)) * 100}%`,
                            backgroundColor: item.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lead Sources Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold mb-4 text-slate-800">Lead Sources</h4>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardCharts