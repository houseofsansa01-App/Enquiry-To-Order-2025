import { useState, useEffect, useContext } from "react"
import { UsersIcon, AlertCircleIcon, TrendingUpIcon } from "../Icons"
import { AuthContext } from "../../App" // Import AuthContext

function DashboardMetrics() {
  const { currentUser, userType, isAdmin } = useContext(AuthContext) // Get user info and admin function
  const [metrics, setMetrics] = useState({
    totalEnquiry: "0",
    pendingEnquiry: "0"
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true)
        
        // Enquiry to Order sheet - For total enquiry and pending enquiry
        const enquiryUrl = "https://docs.google.com/spreadsheets/d/18y2Pcg_GW0pxw-oJ-nA3MJtj6NJ2ESGqbn5DErLpFpQ/gviz/tq?tqx=out:json&sheet=Enquiry to Order"
        const enquiryResponse = await fetch(enquiryUrl)
        const enquiryText = await enquiryResponse.text()
        
        // Extract JSON from Enquiry to Order sheet response
        const enquiryJsonStart = enquiryText.indexOf('{')
        const enquiryJsonEnd = enquiryText.lastIndexOf('}') + 1
        const enquiryJsonData = enquiryText.substring(enquiryJsonStart, enquiryJsonEnd)
        const enquiryData = JSON.parse(enquiryJsonData)
        
        // Calculate metrics
        let totalEnquiry = 0
        let pendingEnquiry = 0
        
        // Count from Enquiry to Order sheet with user filtering
        if (enquiryData && enquiryData.table && enquiryData.table.rows) {
          // Count total enquiries with user filtering (count column B total no. of rows with data)
          totalEnquiry = enquiryData.table.rows.slice(2).filter(row => {
            // Get the assigned user from column AQ (index 42)
            const assignedUser = row.c && row.c[56] ? row.c[56].v : ""
            
            // Check if this row should be included based on user permissions
            const shouldInclude = isAdmin() || (currentUser && assignedUser === currentUser.username)
            
            // Count all rows with data in column B (index 1)
            return row.c && row.c[1] && row.c[1].v && shouldInclude
          }).length
          
          // Count pending enquiries with user filtering (column AH is not null and AI is null)
          pendingEnquiry = enquiryData.table.rows.filter(row => {
            // Get the assigned user from column AQ (index 42)
            const assignedUser = row.c && row.c[56] ? row.c[56].v : ""
            
            // Check if this row should be included based on user permissions
            const shouldInclude = isAdmin() || (currentUser && assignedUser === currentUser.username)
            
            // Count pending enquiries where column AH (index 37) is not null and column AI (index 38) is null
            return row.c && 
                   row.c[11] && row.c[11].v && 
                   (!row.c[12] || !row.c[12].v) &&
                   shouldInclude
          }).length
        }
        
        // Update metrics state
        setMetrics({
          totalEnquiry: totalEnquiry.toString(),
          pendingEnquiry: pendingEnquiry.toString()
        })
        
      } catch (error) {
        console.error("Error fetching metrics:", error)
        setError(error.message)
        // Use fallback demo values
        setMetrics({
          totalEnquiry: "145",
          pendingEnquiry: "42"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMetrics()
  }, [currentUser, isAdmin]) // Add dependencies for user context

  return (
    <div className="space-y-8">
      {/* Enquiry to Order Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          {/* Display admin view indicator similar to FollowUp page */}
          {isAdmin() && <p className="text-green-600 font-semibold">Admin View: Showing all data</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <MetricCard
            title="Total Enquiry"
            value={isLoading ? "Loading..." : metrics.totalEnquiry}
            change="+15%"
            trend="up"
            icon={<UsersIcon className="h-5 w-5" />}
            color="from-cyan-500 to-blue-600"
          />
          
          <MetricCard
            title="Pending Enquiry"
            value={isLoading ? "Loading..." : metrics.pendingEnquiry}
            change="+7%"
            trend="up"
            icon={<AlertCircleIcon className="h-5 w-5" />}
            color="from-rose-500 to-red-600"
          />
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, change, trend, icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${color}`} />
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className={`p-2 rounded-full bg-gradient-to-r ${color} text-white`}>{icon}</div>
        </div>
        {/* <div className="flex items-center mt-4">
          {trend === "up" ? (
            <TrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
          ) : (
            <AlertCircleIcon className="h-4 w-4 text-rose-500 mr-1" />
          )}
          <span className={trend === "up" ? "text-emerald-500 text-sm" : "text-rose-500 text-sm"}>
            {change} from last month
          </span>
        </div> */}
      </div>
    </div>
  )
}

export default DashboardMetrics