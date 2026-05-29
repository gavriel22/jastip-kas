
import { useState, useEffect } from 'react';

const TRANSACTION_NAMES = [
  'Tampungan',
  'Singgahan',
  'Set 5 mybca',
  'Set 4 mybca',
  'Set 5',
  'Set 4',
  'Set 3',
  'Set 2',
  'Satuan',
  'Satuan mybca',
  'Hp',
  'Tiket 1',
  'Tiket 2',
  'Taxi',
  'Indonesia',
  'Malaysia',
  'Wakanda',
  'Dll',
  'Cashback'
];

function App() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('date'); // 'date' | 'event'
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null); // null for add, object for edit
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateDate, setTemplateDate] = useState(new Date().toISOString().split('T')[0]);
  const [templateEvent, setTemplateEvent] = useState('');
  const [isAddingExtra, setIsAddingExtra] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    name: 'Tampungan',
    category: 'Modal',
    type: 'debet',
    amount: '',
    description: '',
    event: ''
  });

  const groupsPerPage = 3; // Menampilkan 3 grup per halaman untuk pagination

  // Fetch transactions on load
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/transaksi');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data || []);
      } else {
        console.error('Gagal memuat transaksi');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Rupiah Formatter
  const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Format currency with support for negative and sign prefix
  const formatNettoValue = (value) => {
    const absVal = Math.abs(value);
    const sign = value >= 0 ? '+' : '-';
    return `${sign}${formatRupiah(absVal)}`;
  };

  // Excel Cell amount formatting (show '-' for empty/zero cells)
  const formatCellAmount = (amount) => {
    if (!amount || amount === 0) return '-';
    return formatRupiah(amount);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Filter logic (Event search specific)
  const filteredTransactions = transactions.filter((tx) => {
    let dateMatch = true;
    if (startDate) {
      dateMatch = dateMatch && tx.date >= startDate;
    }
    if (endDate) {
      dateMatch = dateMatch && tx.date <= endDate;
    }

    let searchMatch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      searchMatch = tx.event?.toLowerCase().includes(q);
    }

    return dateMatch && searchMatch;
  });

  // Group by unique combination of date and event
  const groupedTransactions = filteredTransactions.reduce((acc, tx) => {
    const key = `${tx.date}_${tx.event || 'Umum'}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(tx);
    return acc;
  }, {});

  // Sort groups by key ${date}_${event} depending on selected sort tab
  const sortedGroupKeys = Object.keys(groupedTransactions).sort((a, b) => {
    const [dateA, eventA] = a.split('_');
    const [dateB, eventB] = b.split('_');
    
    if (groupBy === 'event') {
      const eventComp = eventA.localeCompare(eventB);
      if (eventComp !== 0) return eventComp;
      return new Date(dateB) - new Date(dateA);
    } else {
      const dateComp = new Date(dateB) - new Date(dateA);
      if (dateComp !== 0) return dateComp;
      return eventA.localeCompare(eventB);
    }
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedGroupKeys.length / groupsPerPage);
  const indexOfLastGroup = currentPage * groupsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
  const paginatedGroupKeys = sortedGroupKeys.slice(indexOfFirstGroup, indexOfLastGroup);

  // Financial Stats Calculation (filtered result)
  const totalDebetFiltered = filteredTransactions
    .filter((t) => t.type === 'debet')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalKreditFiltered = filteredTransactions
    .filter((t) => t.type === 'kredit')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalanceFiltered = totalDebetFiltered - totalKreditFiltered;

  // Global calculations (all transactions)
  const globalTotalDebet = transactions
    .filter((t) => t.type === 'debet')
    .reduce((sum, t) => sum + t.amount, 0);

  const globalTotalKredit = transactions
    .filter((t) => t.type === 'kredit')
    .reduce((sum, t) => sum + t.amount, 0);

  const globalNetBalance = globalTotalDebet - globalTotalKredit;

  // Helper to open modal for adding new transaction
  const handleOpenModal = () => {
    setEditingTransaction(null);
    setIsAddingExtra(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      name: 'Tampungan',
      category: 'Modal',
      type: 'debet',
      amount: '',
      description: '',
      event: ''
    });
    setIsModalOpen(true);
  };

  // Helper to open modal for adding extra transaction in group header
  const handleOpenAddExtraModal = (dateStr, eventStr) => {
    setEditingTransaction(null);
    setIsAddingExtra(true);
    setFormData({
      date: dateStr,
      event: eventStr,
      name: '',
      category: '',
      type: 'debet',
      amount: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  // Helper to open modal for editing
  const handleEditClick = (tx) => {
    setEditingTransaction(tx);
    setIsAddingExtra(false);
    setFormData({
      date: tx.date,
      name: tx.name,
      category: tx.category,
      type: tx.type,
      amount: tx.amount.toString(),
      description: tx.description || '',
      event: tx.event || ''
    });
    setIsModalOpen(true);
  };

  // Helper to delete transaction
  const handleDeleteClick = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        const response = await fetch(`/api/transaksi?id=${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setTransactions((prev) => prev.filter((t) => t.id !== id));
        } else {
          alert('Gagal menghapus transaksi dari database');
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Terjadi kesalahan koneksi saat menghapus transaksi.');
      }
    }
  };

  // Helper to bulk delete event
  const handleBulkDeleteEvent = async (dateStr, eventStr) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus semua transaksi pada tanggal ${formatDateHeader(dateStr)} untuk event "${eventStr}"?`)) {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/transaksi?date=${encodeURIComponent(dateStr)}&event=${encodeURIComponent(eventStr)}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setTransactions((prev) => prev.filter((tx) => !(tx.date === dateStr && tx.event === eventStr)));
        } else {
          alert('Gagal menghapus event');
        }
      } catch (error) {
        console.error('Error bulk deleting event:', error);
        alert('Terjadi kesalahan koneksi saat menghapus event.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle Form Submission (POST for new / PUT for edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Mohon isi/pilih Nama Transaksi');
      return;
    }
    if (isAddingExtra && !formData.category.trim()) {
      alert('Mohon isi Kategori');
      return;
    }
    const amountVal = parseFloat(formData.amount);
    if (isNaN(amountVal) || (editingTransaction ? amountVal < 0 : amountVal <= 0)) {
      alert(
        editingTransaction
          ? 'Mohon masukkan nominal uang yang valid (lebih besar dari atau sama dengan 0)'
          : 'Mohon masukkan nominal uang yang valid (lebih besar dari 0)'
      );
      return;
    }

    const eventVal = formData.event.trim() || 'Umum';

    const payload = {
      date: formData.date,
      name: formData.name.trim(),
      category: '-',
      type: formData.type,
      amount: amountVal,
      description: formData.description.trim(),
      event: eventVal
    };

    try {
      if (editingTransaction) {
        // Mode Edit: PUT Request
        const response = await fetch('/api/transaksi', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...payload, id: editingTransaction.id })
        });

        if (response.ok) {
          const updatedTx = await response.json();
          setTransactions((prev) =>
            prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
          );
          setIsModalOpen(false);
        } else {
          alert('Gagal memperbarui transaksi');
        }
      } else {
        // Mode Tambah: POST Request
        const response = await fetch('/api/transaksi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.status === 201) {
          const newCreatedTx = await response.json();
          setTransactions((prev) => [newCreatedTx, ...prev]);
          setIsModalOpen(false);
          setCurrentPage(1); // Reset ke halaman 1 agar data baru terlihat
        } else {
          alert('Gagal menyimpan transaksi baru');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Terjadi kesalahan koneksi saat menyimpan transaksi.');
    }
  };

  // Handle Daily Template Creation (Bulk Insert POST)
  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    if (!templateEvent.trim()) {
      alert('Mohon isi nama Event');
      return;
    }

    const payload = TRANSACTION_NAMES.map((name) => ({
      date: templateDate,
      event: templateEvent.trim(),
      name: name,
      category: '-',
      type: 'debet',
      amount: 0,
      description: '-'
    }));

    setIsLoading(true);
    try {
      const response = await fetch('/api/transaksi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 201) {
        const newCreatedTransactions = await response.json();
        setTransactions((prev) => [...newCreatedTransactions, ...prev]);
        setIsTemplateModalOpen(false);
        setTemplateEvent('');
        setCurrentPage(1);
      } else {
        const errorData = await response.json();
        alert(`Gagal membuat template harian: ${errorData.error || 'Terjadi kesalahan'}`);
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Terjadi kesalahan koneksi saat membuat template harian.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format Date header
  const formatDateHeader = (dateStr) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const formatGroupHeader = (key) => {
    const [datePart, eventPart] = key.split('_');
    return `Tanggal: ${formatDateHeader(datePart)} | Event: ${eventPart}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <svg
                className="w-7 h-7 text-slate-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Mutasi Kas Jastip
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pencatatan Buku Kas & Ledger Harian Internal
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded border border-slate-200 self-start md:self-auto">
            <span>Mutasi Kas Jastip v1.1</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        
        {/* Statistics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Saldo Bersih */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Saldo Bersih (Netto)
            </p>
            <h3 className={`text-2xl font-extrabold mt-1.5 font-mono ${netBalanceFiltered >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatNettoValue(netBalanceFiltered)}
            </h3>
            <div className="mt-2 text-xs text-slate-400 border-t border-slate-100 pt-2 flex justify-between">
              <span>Saldo Global (Semua):</span>
              <span className="font-mono font-medium text-slate-600">
                {formatNettoValue(globalNetBalance)}
              </span>
            </div>
          </div>

          {/* Card 2: Total Debet */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Debet (Uang Masuk)
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1.5 font-mono">
              {formatRupiah(totalDebetFiltered)}
            </h3>
            <div className="mt-2 text-xs text-slate-400 border-t border-slate-100 pt-2">
              Berdasarkan filter aktif
            </div>
          </div>

          {/* Card 3: Total Kredit */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Kredit (Uang Keluar)
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1.5 font-mono">
              {formatRupiah(totalKreditFiltered)}
            </h3>
            <div className="mt-2 text-xs text-slate-400 border-t border-slate-100 pt-2">
              Berdasarkan filter aktif
            </div>
          </div>
        </section>

        {/* Toolbar - Filters, Search & Action Buttons */}
        <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Filter Group with Search */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
              {/* Event Search Bar */}
              <div className="flex flex-col gap-1">
                <label htmlFor="searchBar" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cari Event
                </label>
                <input
                  id="searchBar"
                  type="text"
                  placeholder="Cari Event..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block w-full p-2.5"
                />
              </div>

              {/* Start Date Filter */}
              <div className="flex flex-col gap-1">
                <label htmlFor="startDate" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tanggal Mulai
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block w-full p-2.5"
                />
              </div>

              {/* End Date Filter */}
              <div className="flex flex-col gap-1">
                <label htmlFor="endDate" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tanggal Selesai
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block w-full p-2.5"
                />
              </div>
            </div>

            {/* Actions (Reset, Template & Add) */}
            <div className="flex flex-wrap items-end justify-start sm:justify-end gap-2.5 pt-2 lg:pt-0">
              {(startDate || endDate || searchQuery) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-4 py-2.5 rounded-lg cursor-pointer"
                >
                  Clear Filter
                </button>
              )}

              <button
                onClick={() => {
                  setTemplateDate(new Date().toISOString().split('T')[0]);
                  setTemplateEvent('');
                  setIsTemplateModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm active:scale-[0.98] w-full sm:w-auto cursor-pointer"
              >
                <svg
                  className="w-4 h-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                Buat Template Harian
              </button>
              
              <button
                onClick={handleOpenModal}
                className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-5 py-2.5 rounded-lg shadow-sm active:scale-[0.98] w-full sm:w-auto"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Tambah Transaksi
              </button>
            </div>

          </div>
        </section>

        {/* Grouping Tab Bar */}
        <div className="flex border-b border-slate-200 gap-6 mt-2 mb-1 px-1">
          <button
            onClick={() => { setGroupBy('date'); setCurrentPage(1); }}
            className={`pb-3 text-sm font-semibold relative ${groupBy === 'date' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Per Hari (Tanggal)
            {groupBy === 'date' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"></span>}
          </button>
          <button
            onClick={() => { setGroupBy('event'); setCurrentPage(1); }}
            className={`pb-3 text-sm font-semibold relative ${groupBy === 'event' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Per Event
            {groupBy === 'event' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"></span>}
          </button>
        </div>

        {/* Ledger Tables Section */}
        <section className="flex flex-col gap-6">
          {isLoading ? (
            <div className="bg-white text-center py-16 px-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
              <p className="text-slate-500 text-sm font-medium">Memuat data transaksi...</p>
            </div>
          ) : paginatedGroupKeys.length === 0 ? (
            <div className="bg-white text-center py-16 px-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
              <svg
                className="w-14 h-14 text-slate-300 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h4 className="text-base font-semibold text-slate-700">
                Tidak ada transaksi ditemukan
              </h4>
              <p className="text-slate-400 text-xs mt-1 max-w-xs">
                Tidak ada catatan kas Jastip yang sesuai dengan kriteria penyaringan saat ini.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-md bg-slate-50"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            paginatedGroupKeys.map((groupKey) => {
              const groupTransactions = groupedTransactions[groupKey] || [];
              
              // Sort within group
              const rowsToRender = [...groupTransactions].sort((a, b) => {
                return TRANSACTION_NAMES.indexOf(a.name) - TRANSACTION_NAMES.indexOf(b.name);
              });

              // Calculate group total debet, kredit, and net balance
              const calculatedDebet = rowsToRender
                .filter((r) => r.type === 'debet')
                .reduce((sum, r) => sum + r.amount, 0);

              const calculatedKredit = rowsToRender
                .filter((r) => r.type === 'kredit')
                .reduce((sum, r) => sum + r.amount, 0);

              const calculatedNet = calculatedDebet - calculatedKredit;

              return (
                <div key={groupKey} className="flex flex-col gap-2.5">
                  {/* Group Header */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      <h3 className="font-semibold text-slate-700 text-sm tracking-tight">
                        {formatGroupHeader(groupKey)}
                      </h3>
                    </div>
                    {/* Group Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const [datePart, eventPart] = groupKey.split('_');
                          handleOpenAddExtraModal(datePart, eventPart);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer"
                      >
                        + Tambah Transaksi
                      </button>
                      <button
                        onClick={() => {
                          const [datePart, eventPart] = groupKey.split('_');
                          handleBulkDeleteEvent(datePart, eventPart);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer"
                      >
                        Hapus Event
                      </button>
                    </div>
                  </div>

                  {/* Excel-like Table */}
                  <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
                    <table className="min-w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                          <th className="px-4 py-2 text-xs font-semibold text-slate-600 border-r border-slate-200 last:border-r-0 w-1/3">Nama Transaksi</th>
                          <th className="px-4 py-2 text-xs font-semibold text-slate-600 border-r border-slate-200 last:border-r-0 text-right w-1/5">Debet (Masuk)</th>
                          <th className="px-4 py-2 text-xs font-semibold text-slate-600 border-r border-slate-200 last:border-r-0 text-right w-1/5">Kredit (Keluar)</th>
                          <th className="px-4 py-2 text-xs font-semibold text-slate-600 border-r border-slate-200 last:border-r-0">Keterangan</th>
                          <th className="px-4 py-2 text-xs font-semibold text-slate-600 border-r border-slate-200 last:border-r-0 text-center w-28">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rowsToRender.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2 text-sm font-medium text-slate-900 border-r border-b border-slate-200 last:border-r-0">
                              {row.name}
                            </td>
                            <td className="px-4 py-2 text-sm text-right font-mono font-medium text-emerald-600 border-r border-b border-slate-200 last:border-r-0">
                              {row.type === 'debet' ? formatCellAmount(row.amount) : '-'}
                            </td>
                            <td className="px-4 py-2 text-sm text-right font-mono font-medium text-rose-600 border-r border-b border-slate-200 last:border-r-0">
                              {row.type === 'kredit' ? formatCellAmount(row.amount) : '-'}
                            </td>
                            <td className="px-4 py-2 text-xs text-slate-500 italic border-b border-slate-200 last:border-r-0">
                              {row.description || '-'}
                            </td>
                            <td className="px-4 py-2 text-xs border-b border-slate-200 last:border-r-0 text-center">
                              <button
                                onClick={() => handleEditClick(row)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2 py-1 rounded cursor-pointer mr-1.5"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(row.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-2 py-1 rounded cursor-pointer"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}

                        {/* Daily Total Row */}
                        <tr className="bg-slate-100/40 font-semibold border-b border-slate-200">
                          <td className="px-4 py-2 text-sm text-slate-700">
                            {groupBy === 'event' ? 'Total Event' : 'Total Harian'}
                          </td>
                          <td className="px-4 py-2 text-sm text-right font-mono text-emerald-700 border-l border-slate-200">
                            {formatCellAmount(calculatedDebet)}
                          </td>
                          <td className="px-4 py-2 text-sm text-right font-mono text-rose-700 border-l border-slate-200">
                            {formatCellAmount(calculatedKredit)}
                          </td>
                          <td colSpan="2" className="px-4 py-2 border-l border-slate-200"></td>
                        </tr>

                        {/* Daily Netto (Saldo Bersih Harian) */}
                        <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold">
                          <td className="px-4 py-2.5 text-slate-500 uppercase tracking-wider">
                            {groupBy === 'event' ? 'Netto Event (Selisih)' : 'Netto Harian (Selisih)'}
                          </td>
                          <td colSpan="2" className={`px-4 py-2.5 text-center font-mono text-sm font-bold border-l border-slate-200 ${calculatedNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {calculatedNet >= 0 ? '+' : ''}{formatRupiah(calculatedNet)} ({calculatedNet >= 0 ? 'Surplus' : 'Defisit'})
                          </td>
                          <td colSpan="2" className="px-4 py-2.5 border-l border-slate-200"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* Pagination Navigation */}
        {!isLoading && sortedGroupKeys.length > 0 && (
          <section className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-2">
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan {groupBy === 'event' ? 'event' : 'tanggal'} <span className="font-semibold text-slate-700">{indexOfFirstGroup + 1}</span> - <span className="font-semibold text-slate-700">{Math.min(indexOfLastGroup, sortedGroupKeys.length)}</span> dari <span className="font-semibold text-slate-700">{sortedGroupKeys.length}</span> {groupBy === 'event' ? 'event' : 'hari'} terdaftar
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 px-3 py-2 rounded-md"
              >
                Sebelumnya
              </button>

              <div className="flex items-center gap-1.5 px-2">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-7 h-7 text-xs font-semibold rounded-md flex items-center justify-center ${currentPage === idx + 1 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 px-3 py-2 rounded-md"
              >
                Selanjutnya
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Pop-up Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden transform">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingTransaction ? 'Edit Transaksi Jastip' : 'Tambah Transaksi Jastip'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              
              {/* Grid: Tanggal & Jenis Kas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    required
                    disabled={!!editingTransaction || isAddingExtra}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block p-2.5 ${
                      (editingTransaction || isAddingExtra) ? 'cursor-not-allowed bg-slate-100 text-slate-400' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Jenis Kas
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block p-2.5 cursor-pointer"
                  >
                    <option value="debet">Debet (Masuk)</option>
                    <option value="kredit">Kredit (Keluar)</option>
                  </select>
                </div>
              </div>

              {/* Event Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Event
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Jastip SG Mei"
                  disabled={!!editingTransaction || isAddingExtra}
                  value={formData.event}
                  onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                  className={`w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block p-2.5 ${
                    (editingTransaction || isAddingExtra) ? 'cursor-not-allowed bg-slate-100 text-slate-400' : ''
                  }`}
                />
              </div>

              {/* Nama Transaksi */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Nama Transaksi
                </label>
                {editingTransaction || isAddingExtra ? (
                  <input
                    type="text"
                    required
                    disabled={!!editingTransaction}
                    placeholder="Nama Transaksi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block p-2.5 ${
                      editingTransaction ? 'cursor-not-allowed bg-slate-100 text-slate-400' : ''
                    }`}
                  />
                ) : (
                  <select
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      setFormData({
                        ...formData,
                        name: selectedName
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block p-2.5 cursor-pointer"
                  >
                    {TRANSACTION_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Nominal */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Nominal (IDR)
                </label>
                <input
                  type="number"
                  required
                  min={editingTransaction ? "0" : "1"}
                  placeholder="Misal: 150000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block p-2.5 font-mono"
                />
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Keterangan (Opsional)
                </label>
                <textarea
                  placeholder="Keterangan tambahan transaksi..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block p-2.5 h-20 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-medium text-xs px-4 py-2.5 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-5 py-2.5 rounded-lg"
                >
                  {editingTransaction ? 'Simpan Perubahan' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pop-up Template Modal Form */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden transform">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Buat Template Harian
              </h3>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleTemplateSubmit} className="p-6 flex flex-col gap-4">
              {/* Event */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Event
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Jastip SG Mei"
                  value={templateEvent}
                  onChange={(e) => setTemplateEvent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block p-2.5"
                />
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Tanggal
                </label>
                <input
                  type="date"
                  required
                  value={templateDate}
                  onChange={(e) => setTemplateDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block p-2.5"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-medium text-xs px-4 py-2.5 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-5 py-2.5 rounded-lg"
                >
                  Buat Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-5">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-400">
          <p>© 2026 Jastip Kas Ledger. Dikembangkan untuk penggunaan internal.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
