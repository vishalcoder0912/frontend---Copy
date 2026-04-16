import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Upload,
  Search,
  Filter,
  Eye,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Beaker,
  FileText,
  X,
  Loader,
  RefreshCw
} from 'lucide-react';
import labService from '../services/labService';
import LabReportUpload from '../components/LabReportUpload';
import './LabManagement.css';

const TEST_CATEGORIES = {
  HEMATOLOGY: { label: 'Hematology', color: '#ef4444' },
  BIOCHEMISTRY: { label: 'Biochemistry', color: '#f59e0b' },
  MICROBIOLOGY: { label: 'Microbiology', color: '#10b981' },
  RADIOLOGY: { label: 'Radiology', color: '#3b82f6' },
  CARDIOLOGY: { label: 'Cardiology', color: '#ec4899' },
  ENDOCRINOLOGY: { label: 'Endocrinology', color: '#8b5cf6' },
  IMMUNOLOGY: { label: 'Immunology', color: '#06b6d4' },
  URINALYSIS: { label: 'Urinalysis', color: '#84cc16' },
  HISTOPATHOLOGY: { label: 'Histopathology', color: '#f97316' },
  COAGULATION: { label: 'Coagulation', color: '#a855f7' },
  GENERAL: { label: 'General', color: '#6b7280' },
};

const STATUS_CONFIG = {
  Pending: { icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
  'In Progress': { icon: RefreshCw, color: '#3b82f6', bg: '#dbeafe' },
  Completed: { icon: CheckCircle, color: '#10b981', bg: '#d1fae5' },
  Cancelled: { icon: X, color: '#6b7280', bg: '#f3f4f6' },
};

const PRIORITY_CONFIG = {
  Routine: { color: '#6b7280', bg: '#f3f4f6' },
  Urgent: { color: '#f59e0b', bg: '#fef3c7' },
  Stat: { color: '#ef4444', bg: '#fee2e2' },
};

export default function LabManagement() {
  const [labOrders, setLabOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchLabOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [labOrders, searchTerm, filterCategory, filterStatus]);

  const fetchLabOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await labService.getAllLabOrders({ limit: 100 });
      setLabOrders(result.data?.items || []);
      showNotification('success', 'Lab orders loaded successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load lab orders');
      showNotification('error', 'Failed to load lab orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...labOrders];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.test_name?.toLowerCase().includes(term) ||
        order.patient_name?.toLowerCase().includes(term) ||
        order.doctor_name?.toLowerCase().includes(term)
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(order => order.test_category === filterCategory);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    setFilteredOrders(filtered);
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3000);
  };

  const handleUploadSuccess = (data) => {
    setShowUploadModal(false);
    fetchLabOrders();
    showNotification('success', 'Lab reports uploaded successfully');
  };

  const handleAnalyzeResult = async (order) => {
    if (!order.result) {
      showNotification('error', 'No result text to analyze');
      return;
    }

    setAnalyzing(true);
    setSelectedOrder(order);
    setShowAnalysis(true);

    try {
      const result = await labService.analyzeLabResult(order.id, order.result);
      setSelectedOrder(prev => ({ ...prev, analyzed_data: result.data?.analyzed_data }));
      showNotification('success', 'Analysis completed');
    } catch (err) {
      showNotification('error', 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const getStatistics = () => {
    const total = labOrders.length;
    const pending = labOrders.filter(o => o.status === 'Pending').length;
    const inProgress = labOrders.filter(o => o.status === 'In Progress').length;
    const completed = labOrders.filter(o => o.status === 'Completed').length;
    const urgent = labOrders.filter(o => o.priority === 'Urgent' || o.priority === 'Stat').length;

    return { total, pending, inProgress, completed, urgent };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <div className="lab-management loading">
        <Loader className="spinner-large" size={40} />
        <p>Loading lab orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lab-management error">
        <AlertTriangle size={40} />
        <p>{error}</p>
        <button onClick={fetchLabOrders} className="retry-btn">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="lab-management">
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="management-header">
        <div className="header-title">
          <h1><Beaker size={28} /> Laboratory Management</h1>
          <p>Manage lab tests, reports, and diagnostic services</p>
        </div>
        <button className="add-btn" onClick={() => setSelectedOrder(null)}>
          <Plus size={18} /> New Lab Order
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon"><Beaker size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Orders</span>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon"><Clock size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card progress">
          <div className="stat-icon"><RefreshCw size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        <div className="stat-card completed">
          <div className="stat-icon"><CheckCircle size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card urgent">
          <div className="stat-icon"><AlertTriangle size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.urgent}</span>
            <span className="stat-label">Urgent</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by patient, doctor, or test..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={18} />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {Object.entries(TEST_CATEGORIES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Test</th>
              <th>Category</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Files</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  <Beaker size={40} />
                  <p>No lab orders found</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                const priorityConfig = PRIORITY_CONFIG[order.priority] || PRIORITY_CONFIG.Routine;
                const categoryConfig = TEST_CATEGORIES[order.test_category] || TEST_CATEGORIES.GENERAL;
                const StatusIcon = statusConfig.icon;
                const fileCount = order.file_urls?.length || 0;

                return (
                  <tr key={order.id}>
                    <td className="patient-cell">
                      <span className="patient-name">{order.patient_name}</span>
                      <span className="patient-id">#{order.patient_id}</span>
                    </td>
                    <td>{order.doctor_name}</td>
                    <td>
                      <span className="test-name">{order.test_name}</span>
                      {order.specimen_id && (
                        <span className="specimen-id">{order.specimen_id}</span>
                      )}
                    </td>
                    <td>
                      <span 
                        className="category-badge"
                        style={{ background: `${categoryConfig.color}20`, color: categoryConfig.color }}
                      >
                        {categoryConfig.label}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ background: statusConfig.bg, color: statusConfig.color }}
                      >
                        <StatusIcon size={14} />
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="priority-badge"
                        style={{ background: priorityConfig.bg, color: priorityConfig.color }}
                      >
                        {order.priority || 'Routine'}
                      </span>
                    </td>
                    <td>
                      {fileCount > 0 ? (
                        <span className="files-count">
                          <FileText size={14} /> {fileCount}
                        </span>
                      ) : (
                        <span className="no-files">-</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowViewModal(true);
                          }}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="action-btn upload"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowUploadModal(true);
                          }}
                          title="Upload Report"
                        >
                          <Upload size={16} />
                        </button>
                        {order.result && (
                          <button 
                            className="action-btn analyze"
                            onClick={() => handleAnalyzeResult(order)}
                            title="Analyze Result"
                          >
                            <Beaker size={16} />
                          </button>
                        )}
                        <button 
                          className="action-btn download"
                          disabled={fileCount === 0}
                          title="Download Report"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showUploadModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <LabReportUpload
              labId={selectedOrder.id}
              existingFiles={selectedOrder.file_urls || []}
              onUploadSuccess={handleUploadSuccess}
              onClose={() => setShowUploadModal(false)}
            />
          </div>
        </div>
      )}

      {showViewModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Lab Order Details</h2>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Patient</label>
                  <span>{selectedOrder.patient_name}</span>
                </div>
                <div className="detail-item">
                  <label>Doctor</label>
                  <span>{selectedOrder.doctor_name}</span>
                </div>
                <div className="detail-item">
                  <label>Test Name</label>
                  <span>{selectedOrder.test_name}</span>
                </div>
                <div className="detail-item">
                  <label>Category</label>
                  <span>{TEST_CATEGORIES[selectedOrder.test_category]?.label || 'General'}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span>{selectedOrder.status}</span>
                </div>
                <div className="detail-item">
                  <label>Priority</label>
                  <span>{selectedOrder.priority || 'Routine'}</span>
                </div>
                {selectedOrder.specimen_id && (
                  <div className="detail-item">
                    <label>Specimen ID</label>
                    <span>{selectedOrder.specimen_id}</span>
                  </div>
                )}
                {selectedOrder.result && (
                  <div className="detail-item full-width">
                    <label>Result</label>
                    <span>{selectedOrder.result}</span>
                  </div>
                )}
              </div>

              {selectedOrder.analyzed_data && (
                <div className="analysis-section">
                  <h3>Analysis Results</h3>
                  <div className="analysis-content">
                    <p><strong>Summary:</strong> {selectedOrder.analyzed_data.summary}</p>
                    <p><strong>Category:</strong> {selectedOrder.analyzed_data.category}</p>
                    <p><strong>Critical Count:</strong> {selectedOrder.analyzed_data.criticalCount || 0}</p>
                  </div>
                </div>
              )}

              {selectedOrder.file_urls?.length > 0 && (
                <div className="files-section">
                  <h3>Uploaded Files</h3>
                  <div className="files-list">
                    {selectedOrder.file_urls.map((file, idx) => (
                      <div key={idx} className="file-item">
                        <FileText size={16} />
                        <span>{file.filename || `File ${idx + 1}`}</span>
                        <a href={file.url} download>
                          <Download size={14} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
