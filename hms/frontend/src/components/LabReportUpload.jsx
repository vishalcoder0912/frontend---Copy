import React, { useState, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader, FileText, Trash2 } from 'lucide-react';
import labService from '../services/labService';
import './LabReportUpload.css';

const LabReportUpload = ({ labId, onUploadSuccess, onClose, existingFiles = [] }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState(existingFiles);

  const handleFileSelect = useCallback((event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = selectedFiles.filter(file => {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    const fileObjects = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...fileObjects]);
    setError(null);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    const fileObjects = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...fileObjects]);
    setError(null);
  }, []);

  const removeFile = useCallback((fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('uploading');
    setError(null);

    try {
      const fileObjects = files.map(f => f.file);
      const result = await labService.uploadLabReports(labId, fileObjects, (progress) => {
        setUploadProgress(progress);
      });

      setUploadStatus('success');
      setUploadedFiles(result.data?.file_urls || []);
      
      if (onUploadSuccess) {
        onUploadSuccess(result.data);
      }

      setFiles([]);
      
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 2000);

    } catch (err) {
      setUploadStatus('error');
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileIndex) => {
    try {
      await labService.deleteLabFile(labId, fileIndex);
      setUploadedFiles(prev => prev.filter((_, idx) => idx !== fileIndex));
    } catch (err) {
      setError('Failed to delete file');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return 'pdf';
    if (type?.includes('image')) return 'image';
    return 'doc';
  };

  return (
    <div className="lab-report-upload">
      <div className="upload-header">
        <h3>Upload Lab Reports</h3>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div 
        className={`drop-zone ${files.length > 0 ? 'has-files' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt,.csv"
          onChange={handleFileSelect}
          className="file-input"
          id="lab-file-input"
        />
        <label htmlFor="lab-file-input" className="drop-label">
          <Upload className="upload-icon" />
          <p className="upload-text">
            Drop lab reports here or <span className="browse-link">browse</span>
          </p>
          <p className="upload-hint">
            Supports: PDF, Images, Word, Text (Max 10MB each)
          </p>
        </label>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="files-list">
          <h4>Files to Upload ({files.length})</h4>
          {files.map((fileObj) => (
            <div key={fileObj.id} className="file-item">
              <FileText className={`file-icon ${getFileIcon(fileObj.type)}`} />
              <div className="file-info">
                <p className="file-name">{fileObj.name}</p>
                <p className="file-size">{formatFileSize(fileObj.size)}</p>
              </div>
              <button 
                className="remove-btn"
                onClick={() => removeFile(fileObj.id)}
                disabled={uploading}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h4>Uploaded Files ({uploadedFiles.length})</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="file-item uploaded">
              <CheckCircle className="file-icon success" />
              <div className="file-info">
                <p className="file-name">{file.filename || `File ${index + 1}`}</p>
                <p className="file-size">
                  {file.size ? formatFileSize(file.size) : 'Uploaded'}
                </p>
              </div>
              <button 
                className="delete-btn"
                onClick={() => handleDeleteFile(index)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploadStatus === 'uploading' && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="progress-text">Uploading... {uploadProgress}%</p>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="success-message">
          <CheckCircle size={16} />
          <span>Files uploaded successfully!</span>
        </div>
      )}

      <div className="upload-actions">
        <button 
          className="cancel-btn"
          onClick={onClose}
          disabled={uploading}
        >
          Cancel
        </button>
        <button 
          className="upload-btn"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
        >
          {uploading ? (
            <>
              <Loader className="spinner" size={16} />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={16} />
              Upload {files.length > 0 ? `(${files.length})` : ''}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LabReportUpload;
