import React from 'react';

const WorkflowChart: React.FC = () => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Task Status Workflow</h2>
      
      <div className="space-y-6">
        {/* Workflow Diagram */}
        <div className="relative">
          {/* Nodes */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            {/* To Do */}
            <div className="text-center">
              <div className="bg-blue-500 text-white rounded-lg p-4 shadow-md">
                <div className="font-bold text-sm">To Do</div>
              </div>
            </div>
            
            {/* In Progress */}
            <div className="text-center">
              <div className="bg-yellow-500 text-white rounded-lg p-4 shadow-md">
                <div className="font-bold text-sm">In Progress</div>
              </div>
            </div>
            
            {/* In Review */}
            <div className="text-center">
              <div className="bg-purple-500 text-white rounded-lg p-4 shadow-md">
                <div className="font-bold text-sm">In Review</div>
              </div>
            </div>
            
            {/* Done */}
            <div className="text-center">
              <div className="bg-green-500 text-white rounded-lg p-4 shadow-md">
                <div className="font-bold text-sm">Done</div>
              </div>
            </div>
            
            {/* Blocked */}
            <div className="text-center">
              <div className="bg-red-500 text-white rounded-lg p-4 shadow-md">
                <div className="font-bold text-sm">Blocked</div>
              </div>
            </div>
          </div>
          
          {/* Arrows and Transitions */}
          <div className="space-y-4">
            {/* From To Do */}
            <div className="bg-blue-900/30 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="font-semibold text-blue-300 mb-2">From: To Do</div>
              <div className="text-gray-300">→ In Progress</div>
            </div>
            
            {/* From In Progress */}
            <div className="bg-yellow-900/30 p-4 rounded-lg border-l-4 border-yellow-500">
              <div className="font-semibold text-yellow-300 mb-2">From: In Progress</div>
              <div className="text-gray-300">→ To Do, In Review, Blocked</div>
            </div>
            
            {/* From In Review */}
            <div className="bg-purple-900/30 p-4 rounded-lg border-l-4 border-purple-500">
              <div className="font-semibold text-purple-300 mb-2">From: In Review</div>
              <div className="text-gray-300">→ In Progress, Blocked, Done</div>
            </div>
            
            {/* From Blocked */}
            <div className="bg-red-900/30 p-4 rounded-lg border-l-4 border-red-500">
              <div className="font-semibold text-red-300 mb-2">From: Blocked</div>
              <div className="text-gray-300">→ In Progress</div>
            </div>
            
            {/* From Done */}
            <div className="bg-green-900/30 p-4 rounded-lg border-l-4 border-green-500">
              <div className="font-semibold text-green-300 mb-2">From: Done</div>
              <div className="text-gray-300">→ To Do</div>
            </div>
          </div>
        </div>
        
        {/* Visual Flow Diagram */}
        <div className="mt-8 p-6 bg-gray-700 rounded-lg">
          <h3 className="font-bold text-lg mb-4 text-white">Visual Flow</h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="bg-blue-500 text-white px-4 py-2 rounded">To Do</div>
            <div className="text-gray-400">→</div>
            <div className="bg-yellow-500 text-white px-4 py-2 rounded">In Progress</div>
            <div className="text-gray-400">→</div>
            <div className="bg-purple-500 text-white px-4 py-2 rounded">In Review</div>
            <div className="text-gray-400">→</div>
            <div className="bg-green-500 text-white px-4 py-2 rounded">Done</div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-300">
            (Tasks can also move to <span className="font-semibold text-red-400">Blocked</span> from In Progress or In Review)
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowChart;

