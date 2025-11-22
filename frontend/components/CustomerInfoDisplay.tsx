"use client";

interface CustomerInfo {
  age?: number | null;
  income_per_month?: number | null;
  has_life_policy?: boolean | null;
  has_health_policy?: boolean | null;
  has_accident_policy?: boolean | null;
}

interface CustomerInfoDisplayProps {
  customerInfo: CustomerInfo;
}

export default function CustomerInfoDisplay({
  customerInfo,
}: CustomerInfoDisplayProps) {
  const formatValue = (value: any, type: "boolean" | "number" | "currency") => {
    if (value === null || value === undefined) return "Unknown";

    if (type === "boolean") {
      return value ? "Yes" : "No";
    }

    if (type === "currency") {
      return `$${value.toLocaleString()}`;
    }

    return value.toString();
  };
  // console.log("Incomming customer information", customerInfo);
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        👤 Customer Information
      </h2>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Age:</span>
          <span className="font-semibold">
            {formatValue(customerInfo.age, "number")}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Income/Month:</span>
          <span className="font-semibold">
            {formatValue(customerInfo.income_per_month, "currency")}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Life Policy:</span>
          <span
            className={`font-semibold ${
              customerInfo.has_life_policy === true
                ? "text-green-600"
                : customerInfo.has_life_policy === false
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {customerInfo.has_life_policy === true
              ? "✅ Yes"
              : customerInfo.has_life_policy === false
              ? "❌ No"
              : "Unknown"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Health Policy:</span>
          <span
            className={`font-semibold ${
              customerInfo.has_health_policy === true
                ? "text-green-600"
                : customerInfo.has_health_policy === false
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {customerInfo.has_health_policy === true
              ? "✅ Yes"
              : customerInfo.has_health_policy === false
              ? "❌ No"
              : "Unknown"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Accident Policy:</span>
          <span
            className={`font-semibold ${
              customerInfo.has_accident_policy === true
                ? "text-green-600"
                : customerInfo.has_accident_policy === false
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {customerInfo.has_accident_policy === true
              ? "✅ Yes"
              : customerInfo.has_accident_policy === false
              ? "❌ No"
              : "Unknown"}
          </span>
        </div>
      </div>
    </div>
  );
}
