"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../App"

function Leads() {
  const [leadSources, setLeadSources] = useState([])
  const [scNameOptions, setScNameOptions] = useState([])
  const [enquiryStates, setEnquiryStates] = useState([])
  const [nobOptions, setNobOptions] = useState([])
  const [salesTypes, setSalesTypes] = useState([])
  const [enquiryApproachOptions, setEnquiryApproachOptions] = useState([])
  const [productCategories, setProductCategories] = useState([])
  const [companyOptions, setCompanyOptions] = useState([])
  const [companyDetailsMap, setCompanyDetailsMap] = useState({})
  const [lastEnquiryNo, setLastEnquiryNo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receiverOptions, setReceiverOptions] = useState([])
  const [assignToProjectOptions, setAssignToProjectOptions] = useState([])
  const { showNotification } = useContext(AuthContext)

  const [newCallTrackerData, setNewCallTrackerData] = useState({
    enquiryNo: "",
    leadSource: "",
    scName: "",
    companyName: "",
    phoneNumber: "",
    salesPersonName: "",
    location: "",
    emailAddress: "",
    shippingAddress: "",
    enquiryReceiverName: "",
    enquiryAssignToProject: "",
    gstNumber: "",
    isCompanyAutoFilled: true,
  })

  const [enquiryFormData, setEnquiryFormData] = useState({
    enquiryDate: "",
    enquiryState: "",
    projectName: "",
    salesType: "",
    enquiryApproach: "",
  })

  const [items, setItems] = useState([{ id: "1", name: "", quantity: "" }])
  const [isCompanyAutoFilled, setIsCompanyAutoFilled] = useState(false)

  const [expectedFormData, setExpectedFormData] = useState({
    nextAction: "",
    nextCallDate: "",
    nextCallTime: "",
  })

  // Script URL
  const scriptUrl =
    "https://script.google.com/macros/s/AKfycbyjlPq-aK7aSzTf9NkpXDeBoNYxc_CS0glI60FCZemm5w0nrymsqNdownKf3Cag6sre/exec"

  // Function to format date as dd/mm/yyyy
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Fetch dropdown data when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchDropdownData()
        await fetchCompanyData()
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
        setNewCallTrackerData((prev) => ({
          ...prev,
          enquiryNo: nextEnquiryNo,
        }))
      } else {
        setLastEnquiryNo("En-01")
        setNewCallTrackerData((prev) => ({
          ...prev,
          enquiryNo: "En-01",
        }))
      }
    } catch (error) {
      console.error("Error fetching last enquiry number:", error)
      setLastEnquiryNo("En-01")
      setNewCallTrackerData((prev) => ({
        ...prev,
        enquiryNo: "En-01",
      }))
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
        const scNames = []
        const states = []
        const salesTypeOptions = []
        const productItems = []
        const nobItems = []
        const approachOptions = []
        const receivers = []
        const assignToProjects = []

        data.table.rows.slice(0).forEach((row) => {
          if (row.c) {
            if (row.c[1] && row.c[1].v) {
              sources.push(row.c[1].v.toString())
            }
            if (row.c[36] && row.c[36].v) {
              scNames.push(row.c[36].v.toString())
            }
            if (row.c[2] && row.c[2].v) {
              states.push(row.c[2].v.toString())
            }
            if (row.c[3] && row.c[3].v) {
              salesTypeOptions.push(row.c[3].v.toString())
            }
            if (row.c[76] && row.c[76].v) {
              productItems.push(row.c[76].v.toString())
            }
            if (row.c[37] && row.c[37].v) {
              nobItems.push(row.c[37].v.toString())
            }
            if (row.c[38] && row.c[38].v) {
              approachOptions.push(row.c[38].v.toString())
            }
            if (row.c[74] && row.c[74].v) {
              receivers.push(row.c[74].v.toString())
            }
            if (row.c[75] && row.c[75].v) {
              assignToProjects.push(row.c[75].v.toString())
            }
          }
        })

        setLeadSources([...new Set(sources.filter(Boolean))])
        setScNameOptions([...new Set(scNames.filter(Boolean))])
        setEnquiryStates([...new Set(states.filter(Boolean))])
        setSalesTypes([...new Set(salesTypeOptions.filter(Boolean))])
        setProductCategories([...new Set(productItems.filter(Boolean))])
        setNobOptions([...new Set(nobItems.filter(Boolean))])
        setEnquiryApproachOptions([...new Set(approachOptions.filter(Boolean))])
        setReceiverOptions([...new Set(receivers.filter(Boolean))])
        setAssignToProjectOptions([...new Set(assignToProjects.filter(Boolean))])
      }
    } catch (error) {
      console.error("Error fetching dropdown values:", error)
      setLeadSources(["Website", "Justdial", "Sulekha", "Indiamart", "Referral", "Other"])
      setScNameOptions(["SC 1", "SC 2", "SC 3"])
      setEnquiryStates(["Maharashtra", "Gujarat", "Karnataka", "Tamil Nadu", "Delhi"])
      setNobOptions(["NOB 1", "NOB 2", "NOB 3"])
      setSalesTypes(["NBD", "CRR", "NBD_CRR"])
      setEnquiryApproachOptions(["Approach 1", "Approach 2", "Approach 3"])
      setProductCategories(["Product 1", "Product 2", "Product 3"])
      setReceiverOptions(["Receiver 1", "Receiver 2", "Receiver 3"])
      setAssignToProjectOptions(["Project 1", "Project 2", "Project 3"])
    }
  }

  // Function to fetch company data
  const fetchCompanyData = async () => {
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
        const companies = []
        const detailsMap = {}

        data.table.rows.slice(0).forEach((row) => {
          if (row.c && row.c[49] && row.c[49].v !== null) {
            const companyName = row.c[49].v.toString()
            companies.push(companyName)

            detailsMap[companyName] = {
              phoneNumber: row.c[51] && row.c[51].v !== null ? row.c[51].v.toString() : "",
              salesPerson: row.c[50] && row.c[50].v !== null ? row.c[50].v.toString() : "",
              gstNumber: row.c[53] && row.c[53].v !== null ? row.c[53].v.toString() : "",
              billingAddress: row.c[54] && row.c[54].v !== null ? row.c[54].v.toString() : "",
            }
          }
        })

        setCompanyOptions(companies)
        setCompanyDetailsMap(detailsMap)
      }
    } catch (error) {
      console.error("Error fetching company data:", error)
      setCompanyOptions([])
      setCompanyDetailsMap({})
    }
  }

  // Handle company name change and auto-fill other fields
  const handleCompanyChange = (companyName) => {
    setNewCallTrackerData((prev) => ({
      ...prev,
      companyName: companyName,
      isCompanyAutoFilled: true,
    }))

    if (companyName) {
      const companyDetails = companyDetailsMap[companyName] || {}
      setNewCallTrackerData((prev) => ({
        ...prev,
        phoneNumber: companyDetails.phoneNumber || "",
        salesPersonName: companyDetails.salesPerson || "",
        location: companyDetails.billingAddress || "",
        gstNumber: companyDetails.gstNumber || "",
        isCompanyAutoFilled: true,
      }))
    }
  }

  // Function to handle adding a new item
  const addItem = () => {
    if (items.length < 10) {
      const newId = (items.length + 1).toString()
      setItems([...items, { id: newId, name: "", quantity: "" }])
    }
  }

  // Function to handle removing an item
  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  // Function to update an item
  const updateItem = (id, field, value) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  // Helper function to format date to DD/MM/YYYY
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

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const currentDate = new Date()
      const formattedDate = formatDateToDDMMYYYY(currentDate)

      const rowData = [
        formattedDate,
        newCallTrackerData.enquiryNo,
        newCallTrackerData.leadSource,
        newCallTrackerData.companyName,
        newCallTrackerData.phoneNumber,
        newCallTrackerData.salesPersonName,
        newCallTrackerData.location,
        newCallTrackerData.emailAddress,
        newCallTrackerData.shippingAddress,
        newCallTrackerData.enquiryReceiverName,
        newCallTrackerData.enquiryAssignToProject,
        newCallTrackerData.gstNumber,
      ]

      rowData.push(
        enquiryFormData.enquiryDate ? formatDateToDDMMYYYY(enquiryFormData.enquiryDate) : "",
        // enquiryFormData.enquiryState,
        // enquiryFormData.projectName,
        // enquiryFormData.salesType,
        // enquiryFormData.enquiryApproach,
      )

      const allItems = [...items]
      while (allItems.length < 5) {
        allItems.push({ id: `empty-${allItems.length + 1}`, name: "", quantity: "" })
      }

      allItems.slice(0, 5).forEach((item) => {
        rowData.push(item.name)
        rowData.push(item.quantity)
      })

      rowData.push(
        expectedFormData.nextAction || "",
        expectedFormData.nextCallDate || "",
        expectedFormData.nextCallTime || "",
      )

      const currentLength = rowData.length
      const targetIndex = 75

      while (rowData.length < targetIndex) {
        rowData.push("")
      }

      rowData.push(newCallTrackerData.scName || "")

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
        showNotification("Call tracker created successfully", "success")

        // Reset form
        setNewCallTrackerData({
          enquiryNo: "",
          leadSource: "",
          scName: "",
          companyName: "",
          phoneNumber: "",
          salesPersonName: "",
          location: "",
          emailAddress: "",
          shippingAddress: "",
          enquiryReceiverName: "",
          enquiryAssignToProject: "",
          gstNumber: "",
          isCompanyAutoFilled: true,
        })
        setEnquiryFormData({
          enquiryDate: "",
          enquiryState: "",
          projectName: "",
          salesType: "",
          enquiryApproach: "",
        })
        setItems([{ id: "1", name: "", quantity: "" }])
        setExpectedFormData({
          nextAction: "",
          nextCallDate: "",
          nextCallTime: "",
        })
      } else {
        showNotification("Error creating call tracker: " + (result.error || "Unknown error"), "error")
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
             New Enquriy
          </h1>
          <p className="text-slate-600 mt-1">Enter the details of the new enquiry</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">New Enquiry</h2>
          <p className="text-sm text-slate-500">Fill in the enquiry tracker information below</p>
          {lastEnquiryNo && (
            <p className="text-sm font-medium text-blue-600 mt-1">Next Enquiry Number: {lastEnquiryNo}</p>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="leadSource" className="block text-sm font-medium text-gray-700">
                  Enquiry Source
                </label>
                <select
                  id="leadSource"
                  value={newCallTrackerData.leadSource}
                  onChange={(e) => setNewCallTrackerData({ ...newCallTrackerData, leadSource: e.target.value })}
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
                <label htmlFor="scName" className="block text-sm font-medium text-gray-700">
                  SC Name
                </label>
                <select
                  id="scName"
                  value={newCallTrackerData.scName}
                  onChange={(e) => setNewCallTrackerData({ ...newCallTrackerData, scName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select SC Name</option>
                  {scNameOptions.map((scName, index) => (
                    <option key={index} value={scName}>
                      {scName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  list="companyOptions"
                  id="companyName"
                  value={newCallTrackerData.companyName}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <datalist id="companyOptions">
                  {companyOptions.map((company, index) => (
                    <option key={index} value={company} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  value={newCallTrackerData.phoneNumber}
                  onChange={(e) => setNewCallTrackerData({ ...newCallTrackerData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number will auto-fill"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="salesPersonName" className="block text-sm font-medium text-gray-700">
                  Person Name
                </label>
                <input
                  id="salesPersonName"
                  value={newCallTrackerData.salesPersonName}
                  onChange={(e) => setNewCallTrackerData({ ...newCallTrackerData, salesPersonName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sales person name will auto-fill"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Billing Address
                </label>
                <input
                  id="location"
                  value={newCallTrackerData.location}
                  onChange={(e) => setNewCallTrackerData({ ...newCallTrackerData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Location will auto-fill"
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
                  value={newCallTrackerData.emailAddress}
                  onChange={(e) => setNewCallTrackerData({ ...newCallTrackerData, emailAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email will auto-fill"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700">
                  Shipping Address
                </label>
                <input
                  id="shippingAddress"
                  value={newCallTrackerData.shippingAddress}
                  onChange={(e) => setNewCallTrackerData({ ...newCallTrackerData, shippingAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter shipping address"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="enquiryReceiverName" className="block text-sm font-medium text-gray-700">
                  Enquiry Receiver Name
                </label>
                <select
                  id="enquiryReceiverName"
                  value={newCallTrackerData.enquiryReceiverName}
                  onChange={(e) =>
                    setNewCallTrackerData({ ...newCallTrackerData, enquiryReceiverName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label htmlFor="enquiryAssignToProject" className="block text-sm font-medium text-gray-700">
                  Enquiry Assign to Project
                </label>
                <select
                  id="enquiryAssignToProject"
                  value={newCallTrackerData.enquiryAssignToProject}
                  onChange={(e) =>
                    setNewCallTrackerData({ ...newCallTrackerData, enquiryAssignToProject: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select project</option>
                  {assignToProjectOptions.map((project, index) => (
                    <option key={index} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700">
                  GST Number
                </label>
                <input
                  id="gstNumber"
                  value={newCallTrackerData.gstNumber}
                  onChange={(e) => setNewCallTrackerData({ ...newCallTrackerData, gstNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter GST number"
                />
              </div>
            </div>

            {/* Enquiry Details Section */}
            <div className="space-y-6 border p-4 rounded-md mt-4">
              <h3 className="text-lg font-medium">Enquiry Details</h3>
              <hr className="border-gray-200" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="enquiryDate" className="block text-sm font-medium text-gray-700">
                    Enquiry Received Date
                  </label>
                  <input
                    id="enquiryDate"
                    type="date"
                    value={enquiryFormData.enquiryDate}
                    onChange={(e) => setEnquiryFormData({ ...enquiryFormData, enquiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* <div className="space-y-2">
                  <label htmlFor="enquiryState" className="block text-sm font-medium text-gray-700">
                    Enquiry for State
                  </label>
                  <select
                    id="enquiryState"
                    value={enquiryFormData.enquiryState}
                    onChange={(e) => setEnquiryFormData({ ...enquiryFormData, enquiryState: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select state</option>
                    {enquiryStates.map((state, index) => (
                      <option key={index} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div> */}

                {/* <div className="space-y-2">
                  <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                    NOB
                  </label>
                  <select
                    id="projectName"
                    value={enquiryFormData.projectName}
                    onChange={(e) => setEnquiryFormData({ ...enquiryFormData, projectName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select NOB</option>
                    {nobOptions.map((nob, index) => (
                      <option key={index} value={nob}>
                        {nob}
                      </option>
                    ))}
                  </select>
                </div> */}

                {/* <div className="space-y-2">
                  <label htmlFor="salesType" className="block text-sm font-medium text-gray-700">
                    Enquiry Type
                  </label>
                  <select
                    id="salesType"
                    value={enquiryFormData.salesType}
                    onChange={(e) => setEnquiryFormData({ ...enquiryFormData, salesType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select type</option>
                    {salesTypes.map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div> */}

                {/* <div className="space-y-2">
                  <label htmlFor="enquiryApproach" className="block text-sm font-medium text-gray-700">
                    Enquiry Approach
                  </label>
                  <select
                    id="enquiryApproach"
                    value={enquiryFormData.enquiryApproach}
                    onChange={(e) => setEnquiryFormData({ ...enquiryFormData, enquiryApproach: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select approach</option>
                    {enquiryApproachOptions.map((approach, index) => (
                      <option key={index} value={approach}>
                        {approach}
                      </option>
                    ))}
                  </select>
                </div> */}
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Items</h4>
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={items.length >= 10}
                    className={`px-3 py-1 text-xs border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-md ${items.length >= 10 ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    + Add Item {items.length >= 10 ? "(Max reached)" : ""}
                  </button>
                </div>

                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5 space-y-2">
                      <label htmlFor={`itemName-${item.id}`} className="block text-sm font-medium text-gray-700">
                        Item Name
                      </label>
                      <select
                        id={`itemName-${item.id}`}
                        value={item.name}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select item name</option>
                        {productCategories.map((category, index) => (
                          <option key={index} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-5 space-y-2">
                      <label htmlFor={`quantity-${item.id}`} className="block text-sm font-medium text-gray-700">
                        Quantity
                      </label>
                      <input
                        id={`quantity-${item.id}`}
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter quantity"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? "Saving..." : "Save Call Tracker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Leads
