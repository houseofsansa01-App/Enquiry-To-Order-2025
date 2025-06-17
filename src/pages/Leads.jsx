"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../App"

function Leads() {
  const [leadSources, setLeadSources] = useState([])
  const [receiverOptions, setReceiverOptions] = useState([])
  const [productCategories, setProductCategories] = useState([])
  const [enquiryStates, setEnquiryStates] = useState([])
  const [lastEnquiryNo, setLastEnquiryNo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showNotification } = useContext(AuthContext)

  const [enquiryData, setEnquiryData] = useState({
    enquiryReceiverName: "",
    enquirySource: "",
    customerName: "",
    enquiryStatus: "",
    enquiryReceivedDate: "",
    personName: "",
    phoneNumber: "",
    emailAddress: "",
    requirementProduct: "",
  })

  // Script URL
  const scriptUrl =
    "https://script.google.com/macros/s/AKfycbyjlPq-aK7aSzTf9NkpXDeBoNYxc_CS0glI60FCZemm5w0nrymsqNdownKf3Cag6sre/exec"

  // Function to format date as dd/mm/yyyy
  const formatDateToDDMMYYYY = (dateValue) => {
    if (!dateValue) return ""

    try {
      const date = new Date(dateValue)
      if (!isNaN(date.getTime())) {
        return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
      }
      return dateValue
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateValue
    }
  }

  // Fetch dropdown data when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchDropdownData()
        await fetchLastEnquiryNumber()
      } catch (error) {
        console.error("Error during initial data fetch:", error)
      }
    }

    fetchInitialData()
  }, [])

  // Function to fetch the last enquiry number from the spreadsheet
  const fetchLastEnquiryNumber = async () => {
    try {
      const publicUrl =
        "https://docs.google.com/spreadsheets/d/18y2Pcg_GW0pxw-oJ-nA3MJtj6NJ2ESGqbn5DErLpFpQ/gviz/tq?tqx=out:json&sheet=ENQUIRY TO ORDER"

      const response = await fetch(publicUrl)
      const text = await response.text()

      const jsonStart = text.indexOf("{")
      const jsonEnd = text.lastIndexOf("}") + 1
      const jsonData = text.substring(jsonStart, jsonEnd)

      const data = JSON.parse(jsonData)

      if (data && data.table && data.table.rows && data.table.rows.length > 0) {
        const enquiryNumbers = data.table.rows
          .filter((row) => row.c && row.c[1] && row.c[1].v)
          .map((row) => row.c[1].v.toString())

        let maxNumber = 0
        enquiryNumbers.forEach((num) => {
          if (num.startsWith("En-")) {
            const numPart = Number.parseInt(num.substring(3), 10)
            if (!isNaN(numPart) && numPart > maxNumber) {
              maxNumber = numPart
            }
          }
        })

        const nextNumber = maxNumber + 1
        const nextEnquiryNo = `En-${nextNumber.toString().padStart(2, "0")}`

        setLastEnquiryNo(nextEnquiryNo)
      } else {
        setLastEnquiryNo("En-01")
      }
    } catch (error) {
      console.error("Error fetching last enquiry number:", error)
      setLastEnquiryNo("En-01")
    }
  }

  // Function to fetch dropdown data from DROPDOWN sheet
  const fetchDropdownData = async () => {
    try {
      const publicUrl =
        "https://docs.google.com/spreadsheets/d/18y2Pcg_GW0pxw-oJ-nA3MJtj6NJ2ESGqbn5DErLpFpQ/gviz/tq?tqx=out:json&sheet=DROPDOWN"

      const response = await fetch(publicUrl)
      const text = await response.text()

      const jsonStart = text.indexOf("{")
      const jsonEnd = text.lastIndexOf("}") + 1
      const jsonData = text.substring(jsonStart, jsonEnd)

      const data = JSON.parse(jsonData)

      if (data && data.table && data.table.rows) {
        const sources = []
        const states = []
        const productItems = []
        const receivers = []

        data.table.rows.slice(0).forEach((row) => {
          if (row.c) {
            if (row.c[1] && row.c[1].v) {
              sources.push(row.c[1].v.toString())
            }
            if (row.c[6] && row.c[6].v) {
              states.push(row.c[6].v.toString())
            }
            if (row.c[76] && row.c[76].v) {
              productItems.push(row.c[76].v.toString())
            }
            if (row.c[74] && row.c[74].v) {
              receivers.push(row.c[74].v.toString())
            }
          }
        })

        setLeadSources([...new Set(sources.filter(Boolean))])
        setEnquiryStates([...new Set(states.filter(Boolean))])
        setProductCategories([...new Set(productItems.filter(Boolean))])
        setReceiverOptions([...new Set(receivers.filter(Boolean))])
      }
    } catch (error) {
      console.error("Error fetching dropdown values:", error)
      setLeadSources(["Website", "Justdial", "Sulekha", "Indiamart", "Referral", "Other"])
      setEnquiryStates(["Open", "In Progress", "Closed", "On Hold"])
      setProductCategories(["Product 1", "Product 2", "Product 3"])
      setReceiverOptions(["Receiver 1", "Receiver 2", "Receiver 3"])
    }
  }

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const currentDate = new Date()
      const formattedCurrentDate = formatDateToDDMMYYYY(currentDate)

      // Create the row data array with timestamp and enquiry number included
      const submissionData = {
        timestamp: formattedCurrentDate,
        enquiryNo: lastEnquiryNo,
        enquiryReceiverName: enquiryData.enquiryReceiverName,
        enquirySource: enquiryData.enquirySource,
        customerName: enquiryData.customerName,
        enquiryStatus: enquiryData.enquiryStatus,
        enquiryReceivedDate: enquiryData.enquiryReceivedDate ? formatDateToDDMMYYYY(enquiryData.enquiryReceivedDate) : "",
        personName: enquiryData.personName,
        phoneNumber: enquiryData.phoneNumber,
        emailAddress: enquiryData.emailAddress,
        requirementProduct: enquiryData.requirementProduct,
      }

      const rowData = [
        submissionData.timestamp, // Current timestamp
        submissionData.enquiryNo, // Auto-generated enquiry number
        submissionData.enquirySource,
        submissionData.customerName,
        submissionData.phoneNumber,
        submissionData.personName,
        // "", // location (keeping empty as per your request)
        submissionData.emailAddress,
        // "", // shipping address (keeping empty)
        submissionData.enquiryReceiverName,
        // "", // enquiry assign to project (keeping empty)
        // "", // gst number (keeping empty)
        submissionData.enquiryReceivedDate,
        submissionData.requirementProduct,
        submissionData.enquiryStatus,
      ]

      // Add empty values for items (keeping original structure)
      // for (let i = 0; i < 10; i++) {
      //   rowData.push("") // item name
      //   rowData.push("") // item quantity
      // }

      // // Add requirement product and other fields
      // rowData.push("") // next action
      // rowData.push("") // next call date  
      // rowData.push("") // next call time

      // // Pad to reach target index and add requirement product
      // const currentLength = rowData.length
      // const targetIndex = 75

      // while (rowData.length < targetIndex) {
      //   rowData.push("")
      // }

      // rowData.push(submissionData.requirementProduct) // Add at index 75
      // rowData.push(submissionData.enquiryStatus) // Add status at next position

      console.log("Submitting data:", submissionData) // Debug log
      console.log("Row data array:", rowData) // Debug log

      const params = {
        sheetName: "ENQUIRY TO ORDER",
        action: "insert",
        rowData: JSON.stringify(rowData),
      }

      const urlParams = new URLSearchParams()
      for (const key in params) {
        urlParams.append(key, params[key])
      }

      const response = await fetch(scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlParams,
      })

      const result = await response.json()

      if (result.success) {
        showNotification("Enquiry created successfully", "success")

        // Reset form
        setEnquiryData({
          enquiryReceiverName: "",
          enquirySource: "",
          customerName: "",
          enquiryStatus: "",
          enquiryReceivedDate: "",
          personName: "",
          phoneNumber: "",
          emailAddress: "",
          requirementProduct: "",
        })

        // Fetch new enquiry number for next form
        await fetchLastEnquiryNumber()
      } else {
        showNotification("Error creating enquiry: " + (result.error || "Unknown error"), "error")
      }
    } catch (error) {
      showNotification("Error submitting form: " + error.message, "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            New Enquiry
          </h1>
          <p className="text-slate-600 mt-1">Enter the details of the new enquiry</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">New Enquiry</h2>
          <p className="text-sm text-slate-500">Fill in the enquiry information below</p>
          {lastEnquiryNo && (
            <p className="text-sm font-medium text-blue-600 mt-1">Next Enquiry Number: {lastEnquiryNo}</p>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-2">
                <label htmlFor="enquiryReceiverName" className="block text-sm font-medium text-gray-700">
                  Enquiry Receiver Name *
                </label>
                <select
                  id="enquiryReceiverName"
                  value={enquiryData.enquiryReceiverName}
                  onChange={(e) => setEnquiryData({ ...enquiryData, enquiryReceiverName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select receiver</option>
                  {receiverOptions.map((receiver, index) => (
                    <option key={index} value={receiver}>
                      {receiver}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="enquirySource" className="block text-sm font-medium text-gray-700">
                  Enquiry Source *
                </label>
                <select
                  id="enquirySource"
                  value={enquiryData.enquirySource}
                  onChange={(e) => setEnquiryData({ ...enquiryData, enquirySource: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select source</option>
                  {leadSources.map((source, index) => (
                    <option key={index} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                  Customer Name *
                </label>
                <input
                  id="customerName"
                  type="text"
                  value={enquiryData.customerName}
                  onChange={(e) => setEnquiryData({ ...enquiryData, customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="enquiryStatus" className="block text-sm font-medium text-gray-700">
                  Enquiry Status *
                </label>
                <select
                  id="enquiryStatus"
                  value={enquiryData.enquiryStatus}
                  onChange={(e) => setEnquiryData({ ...enquiryData, enquiryStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select status</option>
                  {enquiryStates.map((state, index) => (
                    <option key={index} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="enquiryReceivedDate" className="block text-sm font-medium text-gray-700">
                  Enquiry Received Date *
                </label>
                <input
                  id="enquiryReceivedDate"
                  type="date"
                  value={enquiryData.enquiryReceivedDate}
                  onChange={(e) => setEnquiryData({ ...enquiryData, enquiryReceivedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="personName" className="block text-sm font-medium text-gray-700">
                  Person Name *
                </label>
                <input
                  id="personName"
                  type="text"
                  value={enquiryData.personName}
                  onChange={(e) => setEnquiryData({ ...enquiryData, personName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter person name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={enquiryData.phoneNumber}
                  onChange={(e) => setEnquiryData({ ...enquiryData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="emailAddress"
                  type="email"
                  value={enquiryData.emailAddress}
                  onChange={(e) => setEnquiryData({ ...enquiryData, emailAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
  <label htmlFor="requirementProduct" className="block text-sm font-medium text-gray-700">
    Requirement Product *
  </label>
  <input
    id="requirementProduct"
    type="text"
    value={enquiryData.requirementProduct}
    onChange={(e) => setEnquiryData({ ...enquiryData, requirementProduct: e.target.value })}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter requirement product"
    required
  />
</div>

            </div>
          </div>

          <div className="p-6 border-t flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Enquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Leads