import { useState, useEffect } from "react"

function OrderStatusForm({ formData, onFieldChange, enquiryNo }) {
  const [orderStatus, setOrderStatus] = useState(formData.orderStatus || "")
  const [acceptanceViaOptions, setAcceptanceViaOptions] = useState([])
  const [paymentModeOptions, setPaymentModeOptions] = useState([])
  const [reasonStatusOptions, setReasonStatusOptions] = useState([])
  const [holdReasonOptions, setHoldReasonOptions] = useState([])
  const [paymentTermsOptions, setPaymentTermsOptions] = useState([])
  const [conveyedOptions, setConveyedOptions] = useState([])
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false)
  const [orderVideoError, setOrderVideoError] = useState("")
  const [transportModeOptions, setTransportModeOptions] = useState([])
  const [quotationNumbers, setQuotationNumbers] = useState([])
  const [isLoadingQuotations, setIsLoadingQuotations] = useState(false)
  const [creditDaysOptions, setCreditDaysOptions] = useState([])
  const [creditLimitOptions, setCreditLimitOptions] = useState([])
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)

  // Fetch dropdown options from DROPDOWN sheet
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        setIsLoadingDropdowns(true)
        
        // Fetch data from DROPDOWN sheet
        const dropdownUrl = "https://docs.google.com/spreadsheets/d/18y2Pcg_GW0pxw-oJ-nA3MJtj6NJ2ESGqbn5DErLpFpQ/gviz/tq?tqx=out:json&sheet=DROPDOWN"
        const response = await fetch(dropdownUrl)
        const text = await response.text()
        
        // Extract the JSON part from the response
        const jsonStart = text.indexOf('{')
        const jsonEnd = text.lastIndexOf('}') + 1
        const jsonData = text.substring(jsonStart, jsonEnd)
        
        const data = JSON.parse(jsonData)
        
        if (data && data.table && data.table.rows) {
          // For Acceptance Via options (column H = index 7)
          const acceptanceOptions = []
          // For Payment Mode options (column I = index 8)
          const paymentOptions = []
          // For Reason Status options (column J = index 9)
          const reasonOptions = []
          // For Hold Reason options (column K = index 10)
          const holdOptions = []
          // For Payment Terms options (column BS = index 71)
          const paymentTermsOptions = []
          // For Conveyed options (column BT = index 72)
          const conveyedOptions = []
          // For Transport Mode options (column BN = index 65)
          const transportOptions = []

          const creditDaysOptions = []
          // For Credit Limit options (column CE = index 82)
          const creditLimitOptions = []

          // 3. In the forEach loop inside fetchDropdownOptions, add these extractions:
          // Extract column CD values (index 81)
          
          // Skip the header row (index 0)
          data.table.rows.slice(0).forEach(row => {
            // Extract column H values (index 7)
            if (row.c && row.c[7] && row.c[7].v) {
              acceptanceOptions.push(row.c[7].v)
            }

            if (row.c && row.c[81] && row.c[81].v) {
              creditDaysOptions.push(row.c[81].v)
            }
            
            // Extract column CE values (index 82)
            if (row.c && row.c[82] && row.c[82].v) {
              creditLimitOptions.push(row.c[82].v)
            }
            
            // Extract column I values (index 8)
            if (row.c && row.c[8] && row.c[8].v) {
              paymentOptions.push(row.c[8].v)
            }
            
            // Extract column J values (index 9)
            if (row.c && row.c[9] && row.c[9].v) {
              reasonOptions.push(row.c[9].v)
            }
            
            // Extract column K values (index 10)
            if (row.c && row.c[10] && row.c[10].v) {
              holdOptions.push(row.c[10].v)
            }
            
            // Extract column BS values (index 71)
            if (row.c && row.c[70] && row.c[70].v) {
              paymentTermsOptions.push(row.c[70].v)
            }
            
            // Extract column BT values (index 72)
            if (row.c && row.c[71] && row.c[71].v) {
              conveyedOptions.push(row.c[71].v)
            }
            
            // Extract column BN values (index 65)
            if (row.c && row.c[65] && row.c[65].v) {
              transportOptions.push(row.c[65].v)
            }
          })
          
          setAcceptanceViaOptions(acceptanceOptions)
          setPaymentModeOptions(paymentOptions)
          setReasonStatusOptions(reasonOptions)
          setHoldReasonOptions(holdOptions)
          setPaymentTermsOptions(paymentTermsOptions)
          setConveyedOptions(conveyedOptions)
          setTransportModeOptions(transportOptions)
          setCreditDaysOptions(creditDaysOptions)
          setCreditLimitOptions(creditLimitOptions)

        }
      } catch (error) {
        console.error("Error fetching dropdown options:", error)
        // Fallback options if fetch fails
        setAcceptanceViaOptions(["email", "phone", "in-person", "other"])
        setPaymentModeOptions(["cash", "check", "bank-transfer", "credit-card"])
        setReasonStatusOptions(["price", "competitor", "timeline", "specifications", "other"])
        setHoldReasonOptions(["budget", "approval", "project-delay", "reconsideration", "other"])
        setPaymentTermsOptions(["30", "45", "60", "90"])
        setConveyedOptions(["Yes", "No"])
        setTransportModeOptions(["Road", "Air", "Sea", "Rail"])
        setCreditDaysOptions(["30", "45", "60", "90"])
        setCreditLimitOptions(["10000", "25000", "50000", "100000"])

      } finally {
        setIsLoadingDropdowns(false)
      }
    }
    
    fetchDropdownOptions()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    onFieldChange(name, value)
  }

  const handleFileChange = (e) => {
    const { name } = e.target
    const file = e.target.files[0]
    
    if (name === "orderVideo" && !file) {
      setOrderVideoError("Order Video is mandatory")
    } else {
      setOrderVideoError("")
    }
    
    if (file) {
      onFieldChange(name, file)
    }
  }

  const handleStatusChange = (status) => {
    setOrderStatus(status)
    onFieldChange('orderStatus', status)
  }

  // Function to format date as dd/mm/yyyy
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Function to handle order receipt form submission and navigation
  const handleOrderReceiptForm = async () => {
    setIsSubmittingOrder(true)
    
    try {
      const currentDate = new Date()
      const formattedDate = formatDate(currentDate)
      
      // Get form data from parent component - we need to access the parent form data
      // Since we don't have direct access to parent form data, we'll use what's available
      const rowData = [
        formattedDate,           // Column A - Timestamp
        enquiryNo || "",         // Column B - Enquiry No.
        "",                      // Column C - Enquiry Status (will be filled by parent)
        "",                      // Column D - What Did Customer Say (will be filled by parent)
        "order-status",          // Column E - Current Stage
        "",                      // Column F - empty
        "",                      // Column G - empty
        "yes"                    // Column H - Is Order Received? Status
      ]
      
      // Script URL for Google Apps Script
      const scriptUrl = "https://script.google.com/macros/s/AKfycbyjlPq-aK7aSzTf9NkpXDeBoNYxc_CS0glI60FCZemm5w0nrymsqNdownKf3Cag6sre/exec"
      
      // Parameters for Google Apps Script
      const params = {
        sheetName: "Enquiry Tracker",
        action: "insert",
        rowData: JSON.stringify(rowData)
      }

      // Create URL-encoded string for the parameters
      const urlParams = new URLSearchParams()
      for (const key in params) {
        urlParams.append(key, params[key])
      }
      
      // Send the data
      const response = await fetch(scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: urlParams
      })

      const result = await response.json()
      
      if (result.success) {
        console.log("Order status saved successfully")
        // Now open the external form
        const formUrl = "https://script.google.com/macros/s/AKfycbwX7UcQ5MivqccPtuZ9zwqKNjEj-QhALtAEX-0x6sKtYlEqVC55R6R09m7-VXvE6W2Zzw/exec"
        window.location.href = formUrl
      } else {
        console.error("Error saving order status:", result.error)
        // Still open the form even if save fails
        const formUrl = "https://script.google.com/macros/s/AKfycbwX7UcQ5MivqccPtuZ9zwqKNjEj-QhALtAEX-0x6sKtYlEqVC55R6R09m7-VXvE6W2Zzw/exec"
        window.location.href = formUrl
      }
    } catch (error) {
      console.error("Error submitting order data:", error)
      // Still open the form even if save fails
      const formUrl = "https://script.google.com/macros/s/AKfycbwX7UcQ5MivqccPtuZ9zwqKNjEj-QhALtAEX-0x6sKtYlEqVC55R6R09m7-VXvE6W2Zzw/exec"
      window.location.href = formUrl
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  return (
    <div className="space-y-6 border p-4 rounded-md">
      <h3 className="text-lg font-medium">Order Status</h3>
      <hr className="border-gray-200" />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Is Order Received? Status</label>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="order-yes"
              name="orderStatus"
              value="yes"
              checked={orderStatus === "yes"}
              onChange={() => handleStatusChange("yes")}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="order-yes" className="text-sm text-gray-700">
              YES
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="order-no"
              name="orderStatus"
              value="no"
              checked={orderStatus === "no"}
              onChange={() => handleStatusChange("no")}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="order-no" className="text-sm text-gray-700">
              NO
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="order-hold"
              name="orderStatus"
              value="hold"
              checked={orderStatus === "hold"}
              onChange={() => handleStatusChange("hold")}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="order-hold" className="text-sm text-gray-700">
              HOLD
            </label>
          </div>
        </div>
      </div>

      {/* "Yes" - Show external form link with better integration */}
      {orderStatus === "yes" && (
        <div className="space-y-4 border-2 border-green-300 bg-green-50 p-4 rounded-md">
          <h4 className="font-medium text-green-800">Order Receipt Form</h4>
          
          <div className="bg-white border border-green-200 rounded-lg p-6">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 text-green-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h5 className="text-lg font-semibold text-green-800">Complete Order Details</h5>
                <p className="text-green-700 text-sm mt-1">Fill out the comprehensive order receipt form</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                <p className="text-sm text-green-700 font-medium mb-2">This form includes:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-green-600">
                  <div>• Order Type & Date</div>
                  <div>• Customer Information</div>
                  <div>• Delivery Details</div>
                  <div>• Product Information</div>
                  <div>• Payment Status</div>
                  <div>• Quantity & Weight</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleOrderReceiptForm}
                  disabled={isSubmittingOrder}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                  <span>{isSubmittingOrder ? "Saving & Opening Form..." : "Go to Order Receipt Form"}</span>
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                <strong>💡 Note:</strong> This will save your order status and open the detailed order receipt form.
              </div>
            </div>
          </div>
        </div>
      )}

      {orderStatus === "no" && (
        <div className="space-y-4 border p-4 rounded-md">
          <h4 className="font-medium">Order Lost Details</h4>

          <div className="space-y-2">
            <label htmlFor="reasonForNo" className="block text-sm font-medium text-gray-700">
              Reason for No
            </label>
            <input
              id="reasonForNo"
              name="reasonForNo"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter reason why order was not received"
              value={formData.reasonForNo || ""}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      )}

      {orderStatus === "hold" && (
        <div className="space-y-4 border p-4 rounded-md">
          <h4 className="font-medium">Order Hold Details</h4>

          <div className="space-y-2">
            <label htmlFor="holdingDate" className="block text-sm font-medium text-gray-700">
              Holding Date
            </label>
            <input
              id="holdingDate"
              name="holdingDate"
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.holdingDate || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="holdRemark" className="block text-sm font-medium text-gray-700">
              Hold Remarks
            </label>
            <textarea
              id="holdRemark"
              name="holdRemark"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter hold remarks"
              value={formData.holdRemark || ""}
              onChange={handleChange}
              rows="3"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderStatusForm