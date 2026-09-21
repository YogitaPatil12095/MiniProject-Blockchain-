import React, { useRef, useState } from 'react';

/**
 * Presentational FilePicker Component
 * @param {Object} props
 * @param {File|null} props.selectedFile
 * @param {Function} props.onFileSelect - Returns File object or null
 * @param {number} [props.maxSizeMB=10] - File limit in MB
 */
export function FilePicker({
  selectedFile = null,
  onFileSelect,
  maxSizeMB = 10,
  className = ''
}) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (file) => {
    setError('');
    if (!file) {
      onFileSelect(null);
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds limit of ${maxSizeMB} MB. Current: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      onFileSelect(null);
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const dropZoneStyle = {
    border: `2px dashed ${dragOver ? 'var(--primary-600)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    textAlign: 'center',
    backgroundColor: dragOver ? 'var(--primary-50)' : 'var(--surface)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  return (
    <div className={`file-picker-container ${className}`} style={{ marginBottom: '16px' }}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
      />

      {!selectedFile ? (
        <div
          style={dropZoneStyle}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div style={{ fontSize: '32px' }}>📄</div>
          <p style={{ fontWeight: 'var(--fw-medium)', color: 'var(--text)' }}>
            Drag and drop health record file, or <span style={{ color: 'var(--primary-600)' }}>browse</span>
          </p>
          <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>
            PDF, Images, DICOM, or medical reports up to {maxSizeMB} MB
          </span>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--primary-50)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>📄</span>
            <div>
              <p style={{ fontWeight: 'var(--fw-medium)', color: 'var(--text)' }}>{selectedFile.name}</p>
              <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onFileSelect(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--danger)',
              cursor: 'pointer',
              fontWeight: 'var(--fw-medium)',
              fontSize: 'var(--fs-small)',
            }}
          >
            Remove ✕
          </button>
        </div>
      )}

      {error && <span style={{ fontSize: 'var(--fs-small)', color: 'var(--danger)', marginTop: '6px', display: 'block' }}>{error}</span>}
    </div>
  );
}
