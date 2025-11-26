"use client";

interface DebugComponentProps {
  type: "information" | "interest" | "checklist" | "guide" | "products";
  data: any;
  stageName?: string; // Add this prop
}

export default function DebugComponent({
  type,
  data,
  stageName,
}: DebugComponentProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="font-semibold text-lg mb-3 capitalize text-gray-800">
        {type}
        {stageName && type === "guide" && (
          <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Stage: {stageName}
          </span>
        )}
      </h3>
      <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-64 text-gray-700">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
