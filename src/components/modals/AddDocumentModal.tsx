import React, { useState } from 'react';
import { Customer, CustomerDocument } from '../../types/customer';
import { addDocumentToCustomer } from '../../services/customerStorage';
import { X, FileText, Upload, Check } from 'lucide-react';

interface AddDocumentModalProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedCustomer: Customer) => void;
}

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  customer,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<CustomerDocument['type']>('Şəxsiyyət vəsiqəsi');
  const [fileType, setFileType] = useState<CustomerDocument['fileType']>('pdf');
  const [fileSize, setFileSize] = useState('1.2 MB');
  const [dataUrl, setDataUrl] = useState<string | undefined>(undefined);
  const [selectedFileName, setSelectedFileName] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }

      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeInMB} MB`);

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') setFileType('pdf');
      else if (ext === 'jpg' || ext === 'jpeg') setFileType('jpg');
      else if (ext === 'png') setFileType('png');
      else if (ext === 'doc') setFileType('doc');
      else if (ext === 'docx') setFileType('docx');

      const reader = new FileReader();
      reader.onload = () => {
        setDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Zəhmət olmasa sənədin başlığını daxil edin.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const updated = addDocumentToCustomer(customer.id, {
      title: title.trim(),
      type: docType,
      fileType,
      fileSize: fileSize || '1.0 MB',
      uploadDate: todayStr,
      dataUrl,
    });

    if (updated) {
      setTitle('');
      setSelectedFileName('');
      onSuccess(updated);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 bg-indigo-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Sənəd Yüklə</h3>
              <p className="text-xs text-indigo-100">
                {customer.lastName} {customer.firstName} ({customer.code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-indigo-100 hover:text-white hover:bg-indigo-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Sənəd Növü <span className="text-rose-500">*</span>
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as CustomerDocument['type'])}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Şəxsiyyət vəsiqəsi">Şəxsiyyət vəsiqəsi</option>
              <option value="Müqavilə">Müqavilə</option>
              <option value="Girov sənədi">Girov sənədi</option>
              <option value="Məhkəmə sənədləri">Məhkəmə sənədləri</option>
              <option value="Digər">Digər fayllar</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Sənəd Adı / Başlığı <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Məsələn: ŞV Surəti AZE12345678"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* File input area */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Fayl Seçin (PDF, JPG, PNG, DOC/DOCX)
            </label>
            <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-500 transition bg-slate-50 cursor-pointer">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center text-slate-600">
                <Upload className="w-8 h-8 text-indigo-500 mb-2" />
                <p className="text-sm font-medium">
                  {selectedFileName ? selectedFileName : 'Faylı bura sürüşdürün və ya klikləyin'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Maksimum fayl ölçüsü: 15MB (PDF, JPG, PNG, DOC)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 transition"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm flex items-center gap-2 transition"
            >
              <Check className="w-4 h-4" /> Sənədi Yadda Saxla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
