import { useState, useEffect } from 'react';
import { Search, Loader2, Users } from 'lucide-react';
import { getAllPatientRecords } from '../services/patientService';
import { motion } from 'motion/react';

export default function AdminPatients() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const data = await getAllPatientRecords();
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch patient records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => 
    record.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Patient Records</h2>
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors cursor-pointer"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No records found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="px-6 py-4 font-medium">Patient</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Risk Level</th>
                  <th className="px-6 py-4 font-medium">Prediction Insights</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredRecords.map((record, index) => {
                  const date = record.createdAt && typeof record.createdAt.toDate === 'function' 
                    ? record.createdAt.toDate().toLocaleDateString() 
                    : 'Unknown';
                    
                  return (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={record.id} 
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{record.userName}</div>
                        <div className="text-slate-500 text-xs">{record.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.riskLevel.includes('High') ? 'bg-red-100 text-red-800' : 
                          record.riskLevel.includes('Moderate') ? 'bg-amber-100 text-amber-800' : 
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {record.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="line-clamp-2 max-w-md" title={record.insights}>
                          {record.insights.replace(/[#*]/g, '')}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
