// Author: Gavriel Theofilus Nugroho

import { useState } from 'react';

const CATEGORIES = [
  'Makanan',
  'Transportasi',
  'Belanja',
  'Tiket',
  'Modal',
  'Cashback',
  'Lain-lain'
];

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

const NAME_TO_CATEGORY = {
  'Tampungan': 'Modal',
  'Singgahan': 'Lain-lain',
  'Set 5 mybca': 'Modal',
  'Set 4 mybca': 'Modal',
  'Set 5': 'Modal',
  'Set 4': 'Modal',
  'Set 3': 'Modal',
  'Set 2': 'Modal',
  'Satuan': 'Lain-lain',
  'Satuan mybca': 'Lain-lain',
  'Hp': 'Belanja',
  'Tiket 1': 'Tiket',
  'Tiket 2': 'Tiket',
  'Taxi': 'Transportasi',
  'Indonesia': 'Transportasi',
  'Malaysia': 'Makanan',
  'Wakanda': 'Belanja',
  'Dll': 'Lain-lain',
  'Cashback': 'Cashback'
};

const MOCK_DATA_FALLBACK = {
  'Tampungan': { type: 'debet', amount: 3200000, desc: 'Lunas titipan Sephora' },
  'Singgahan': { type: 'kredit', amount: 30000, desc: 'Kartu data lokal' },
  'Set 5 mybca': { type: 'debet', amount: 5000000, desc: 'Transfer modal SG' },
  'Set 4 mybca': { type: 'debet', amount: 4200000, desc: 'Pembayaran pesanan batch 4' },
  'Set 5': { type: 'debet', amount: 3500000, desc: 'Modal masuk cash' },
  'Set 4': { type: 'debet', amount: 2800000, desc: 'Modal masuk cash batch 4' },
  'Set 3': { type: 'debet', amount: 3000000, desc: 'Modal masuk cash batch 3' },
  'Set 2': { type: 'debet', amount: 2500000, desc: 'Modal masuk cash batch 2' },
  'Satuan': { type: 'debet', amount: 750000, desc: 'Titipan eceran transfer' },
  'Satuan mybca': { type: 'debet', amount: 900000, desc: 'Titipan eceran via BCA' },
  'Hp': { type: 'kredit', amount: 1800000, desc: 'Pesanan HP Jastip' },
  'Tiket 1': { type: 'kredit', amount: 1200000, desc: 'Akses penerbangan Scoot' },
  'Tiket 2': { type: 'kredit', amount: 1500000, desc: 'Akses penerbangan Garuda' },
  'Taxi': { type: 'kredit', amount: 75000, desc: 'Transportasi Orchard' },
  'Indonesia': { type: 'kredit', amount: 50000, desc: 'Pengiriman paket domestik' },
  'Malaysia': { type: 'kredit', amount: 45000, desc: 'Makan siang tim runner' },
  'Wakanda': { type: 'kredit', amount: 450000, desc: 'Titipan souvenir lokal' },
  'Dll': { type: 'kredit', amount: 25000, desc: 'Biaya transfer bank' },
  'Cashback': { type: 'debet', amount: 80000, desc: 'Klaim refund bagasi Changi' }
};

const INITIAL_TRANSACTIONS = [
  {
    id: '1',
    date: '2026-05-27',
    name: 'Tampungan',
    category: 'Modal',
    type: 'debet',
    amount: 3200000,
    description: 'Lunas titipan Sephora SG',
    client: 'Budi',
    event: 'Jastip SG Mei'
  },
  {
    id: '2',
    date: '2026-05-27',
    name: 'Hp',
    category: 'Belanja',
    type: 'kredit',
    amount: 1800000,
    description: 'Pesanan HP Jastip',
    client: 'Siti',
    event: 'Jastip JP Juni'
  },
  {
    id: '3',
    date: '2026-05-27',
    name: 'Taxi',
    category: 'Transportasi',
    type: 'kredit',
    amount: 75000,
    description: 'Transportasi keliling Orchard',
    client: 'Andi',
    event: 'Jastip SG Mei'
  },
  {
    id: '4',
    date: '2026-05-27',
    name: 'Malaysia',
    category: 'Makanan',
    type: 'kredit',
    amount: 45000,
    description: 'Makan siang tim runner',
    client: 'Dewi',
    event: 'Jastip BKK Juli'
  },
  {
    id: '5',
    date: '2026-05-26',
    name: 'Set 5 mybca',
    category: 'Modal',
    type: 'debet',
    amount: 5000000,
    description: 'Transfer modal',
    client: 'Budi',
    event: 'Jastip SG Mei'
  },
  {
    id: '6',
    date: '2026-05-26',
    name: 'Tiket 1',
    category: 'Tiket',
    type: 'kredit',
    amount: 1200000,
    description: 'Akses penerbangan',
    client: 'Andi',
    event: 'Jastip SG Mei'
  },
  {
    id: '7',
    date: '2026-05-26',
    name: 'Singgahan',
    category: 'Lain-lain',
    type: 'kredit',
    amount: 30000,
    description: 'Kartu data lokal',
    client: 'Siti',
    event: 'Jastip JP Juni'
  },
  {
    id: '8',
    date: '2026-05-26',
    name: 'Cashback',
    category: 'Cashback',
    type: 'debet',
    amount: 80000,
    description: 'Klaim refund sewa bagasi',
    client: 'Budi',
    event: 'Jastip SG Mei'
  },
  {
    id: '9',
    date: '2026-05-25',
    name: 'Wakanda',
    category: 'Belanja',
    type: 'kredit',
    amount: 450000,
    description: 'Titipan souvenir lokal',
    client: 'Dewi',
    event: 'Jastip BKK Juli'
  },
  {
    id: '10',
    date: '2026-05-25',
    name: 'Indonesia',
    category: 'Transportasi',
    type: 'kredit',
    amount: 50000,
    description: 'Pengiriman paket domestik',
    client: 'Andi',
    event: 'Jastip SG Mei'
  },
  {
    id: '11',
    date: '2026-05-25',
    name: 'Cashback',
    category: 'Cashback',
    type: 'debet',
    amount: 150000,
    description: 'Cashback promo tiket penerbangan',
    client: 'Dewi',
    event: 'Jastip BKK Juli'
  },
  {
    id: '12',
    date: '2026-05-25',
    name: 'Dll',
    category: 'Lain-lain',
    type: 'kredit',
    amount: 25000,
    description: 'Biaya transfer antar bank',
    client: 'Budi',
    event: 'Jastip SG Mei'
  },
  {
    id: '13',
    date: '2026-05-24',
    name: 'Singgahan',
    category: 'Lain-lain',
    type: 'kredit',
    amount: 1000000,
    description: 'Kas tunai darurat Singapura',
    client: 'Siti',
    event: 'Jastip JP Juni'
  },
  {
    id: '14',
    date: '2026-05-24',
    name: 'Set 4 mybca',
    category: 'Modal',
    type: 'debet',
    amount: 4200000,
    description: 'Pembayaran pesanan batch 4',
    client: 'Siti',
    event: 'Jastip JP Juni'
  }
];

function App() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [groupBy, setGroupBy] = useState('date'); // 'date' | 'client' | 'event'
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [filterClient, setFilterClient] = useState('Semua');
  const [filterEvent, setFilterEvent] = useState('Semua');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isNewClient, setIsNewClient] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [customClient, setCustomClient] = useState('');
  const [customEvent, setCustomEvent] = useState('');

  // Extract unique clients and events from actual transactions
  const uniqueClients = Array.from(new Set(transactions.map(t => t.client || 'Umum'))).filter(Boolean);
  const uniqueEvents = Array.from(new Set(transactions.map(t => t.event || 'Umum'))).filter(Boolean);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    name: 'Tampungan',
    category: 'Modal',
    type: 'debet',
    amount: '',
    description: '',
    client: 'Budi',
    event: 'Jastip SG Mei'
  });

  const groupsPerPage = 3; // Menampilkan 3 grup per halaman untuk pagination

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
    setFilterCategory('Semua');
    setFilterClient('Semua');
    setFilterEvent('Semua');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Filter logic
  const filteredTransactions = transactions.filter((tx) => {
    const categoryMatch = filterCategory === 'Semua' || tx.category === filterCategory;
    const clientMatch = filterClient === 'Semua' || (tx.client || 'Umum') === filterClient;
    const eventMatch = filterEvent === 'Semua' || (tx.event || 'Umum') === filterEvent;
    
    let dateMatch = true;
    if (startDate) {
      dateMatch = dateMatch && tx.date >= startDate;
    }
    if (endDate) {
      dateMatch = dateMatch && tx.date <= endDate;
    }

    return categoryMatch && clientMatch && eventMatch && dateMatch;
  });

  // Group by date / client / event
  const groupedTransactions = filteredTransactions.reduce((acc, tx) => {
    let key;
    if (groupBy === 'client') {
      key = tx.client || 'Umum';
    } else if (groupBy === 'event') {
      key = tx.event || 'Umum';
    } else {
      key = tx.date;
    }

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(tx);
    return acc;
  }, {});

  // Sort groups
  const sortedGroupKeys = Object.keys(groupedTransactions).sort((a, b) => {
    if (groupBy === 'date') {
      return new Date(b) - new Date(a);
    }
    return a.localeCompare(b);
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

  // Helper to open modal with resets
  const handleOpenModal = () => {
    setIsNewClient(false);
    setIsNewEvent(false);
    setCustomClient('');
    setCustomEvent('');
    setFormData({
      date: new Date().toISOString().split('T')[0],
      name: 'Tampungan',
      category: 'Modal',
      type: 'debet',
      amount: '',
      description: '',
      client: uniqueClients[0] || 'Umum',
      event: uniqueEvents[0] || 'Umum'
    });
    setIsModalOpen(true);
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Mohon pilih Nama Transaksi');
      return;
    }
    const amountVal = parseFloat(formData.amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert('Mohon masukkan nominal uang yang valid (lebih besar dari 0)');
      return;
    }

    const clientVal = isNewClient ? customClient.trim() : formData.client;
    const eventVal = isNewEvent ? customEvent.trim() : formData.event;

    if (isNewClient && !customClient.trim()) {
      alert('Mohon masukkan nama client baru');
      return;
    }
    if (isNewEvent && !customEvent.trim()) {
      alert('Mohon masukkan nama event baru');
      return;
    }

    const newTx = {
      id: Date.now().toString(),
      date: formData.date,
      name: formData.name,
      category: formData.category,
      type: formData.type,
      amount: amountVal,
      description: formData.description.trim(),
      client: clientVal || 'Umum',
      event: eventVal || 'Umum'
    };

    setTransactions([newTx, ...transactions]);
    setIsModalOpen(false);
    setCurrentPage(1); // Reset ke halaman 1 agar transaksi baru terlihat

    // Reset Form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      name: 'Tampungan',
      category: 'Modal',
      type: 'debet',
      amount: '',
      description: '',
      client: uniqueClients[0] || 'Umum',
      event: uniqueEvents[0] || 'Umum'
    });
    setIsNewClient(false);
    setIsNewEvent(false);
    setCustomClient('');
    setCustomEvent('');
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

  // Helper to format Group Header
  const formatGroupHeader = (key) => {
    if (groupBy === 'date') {
      return formatDateHeader(key);
    }
    if (groupBy === 'client') {
      return `Client: ${key}`;
    }
    if (groupBy === 'event') {
      return `Event: ${key}`;
    }
    return key;
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
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1.5 rounded border border-slate-200 self-start md:self-auto">
            <span>Author: Gavriel Theofilus Nugroho</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        
        {/* Statistics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Saldo Bersih */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition">
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
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition">
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
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition">
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

        {/* Toolbar - Filters & Action Buttons */}
        <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Filter Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 flex-1">
              {/* Category Filter */}
              <div className="flex flex-col gap-1">
                <label htmlFor="categoryFilter" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kategori
                </label>
                <select
                  id="categoryFilter"
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block w-full p-2.5 font-medium transition cursor-pointer"
                >
                  <option value="Semua">Semua Kategori</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Client Filter */}
              <div className="flex flex-col gap-1">
                <label htmlFor="clientFilter" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Client
                </label>
                <select
                  id="clientFilter"
                  value={filterClient}
                  onChange={(e) => {
                    setFilterClient(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block w-full p-2.5 font-medium transition cursor-pointer"
                >
                  <option value="Semua">Semua Client</option>
                  {uniqueClients.map((client) => (
                    <option key={client} value={client}>
                      {client}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Filter */}
              <div className="flex flex-col gap-1">
                <label htmlFor="eventFilter" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Event
                </label>
                <select
                  id="eventFilter"
                  value={filterEvent}
                  onChange={(e) => {
                    setFilterEvent(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block w-full p-2.5 font-medium transition cursor-pointer"
                >
                  <option value="Semua">Semua Event</option>
                  {uniqueEvents.map((ev) => (
                    <option key={ev} value={ev}>
                      {ev}
                    </option>
                  ))}
                </select>
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
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block w-full p-2.5 transition"
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
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block w-full p-2.5 transition"
                />
              </div>
            </div>

            {/* Actions (Reset & Add) */}
            <div className="flex items-end justify-start sm:justify-end gap-2.5 pt-2 lg:pt-0">
              {(filterCategory !== 'Semua' || filterClient !== 'Semua' || filterEvent !== 'Semua' || startDate || endDate) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-4 py-2.5 rounded-lg transition"
                >
                  Clear Filter
                </button>
              )}
              
              <button
                onClick={handleOpenModal}
                className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition shadow-sm active:scale-[0.98] w-full sm:w-auto"
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
            className={`pb-3 text-sm font-semibold transition relative ${groupBy === 'date' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Per Hari (Tanggal)
            {groupBy === 'date' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"></span>}
          </button>
          <button
            onClick={() => { setGroupBy('client'); setCurrentPage(1); }}
            className={`pb-3 text-sm font-semibold transition relative ${groupBy === 'client' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Per Client
            {groupBy === 'client' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"></span>}
          </button>
          <button
            onClick={() => { setGroupBy('event'); setCurrentPage(1); }}
            className={`pb-3 text-sm font-semibold transition relative ${groupBy === 'event' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Per Event
            {groupBy === 'event' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"></span>}
          </button>
        </div>

        {/* Ledger Tables Section */}
        <section className="flex flex-col gap-6">
          {paginatedGroupKeys.length === 0 ? (
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
                className="mt-4 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-md bg-slate-50 transition"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            paginatedGroupKeys.map((groupKey) => {
              const groupTransactions = groupedTransactions[groupKey];
              
              // Calculate group total debet, kredit, and net balance
              const groupDebet = groupTransactions
                .filter((t) => t.type === 'debet')
                .reduce((sum, t) => sum + t.amount, 0);

              const groupKredit = groupTransactions
                .filter((t) => t.type === 'kredit')
                .reduce((sum, t) => sum + t.amount, 0);

              const groupNet = groupDebet - groupKredit;

              return (
                <div key={groupKey} className="flex flex-col gap-2.5">
                  {/* Group Header */}
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <h3 className="font-semibold text-slate-700 text-sm tracking-tight">
                      {formatGroupHeader(groupKey)}
                    </h3>
                  </div>

                  {/* Excel-like Table */}
                  <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
                    <table className="min-w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                          <th className="px-4 py-2 text-xs font-semibold text-slate-600 border-r border-slate-200 last:border-r-0 w-1/4">Nama Transaksi</th>
                          <th className="px-4 py-2 text-xs font-semibold text-slate-600 border-r border-slate-200 last:border-r-0 w-1/5">Kategori</th>
                          <th className="px-4 py-2 text-xs font-semibold text-slate-600 border-r border-slate-200 last:border-r-0 text-right w-1/6">Debet (Masuk)</th>
                          <th className="px-4 py-2 text-xs font-semibold text-slate-600 border-r border-slate-200 last:border-r-0 text-right w-1/6">Kredit (Keluar)</th>
                          <th className="px-4 py-2 text-xs font-semibold text-slate-600 border-r border-slate-200 last:border-r-0">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const rowsToRender = [];
                          TRANSACTION_NAMES.forEach((name) => {
                            if (filterCategory !== 'Semua' && NAME_TO_CATEGORY[name] !== filterCategory) {
                              return;
                            }
                            const matches = groupTransactions.filter(t => t.name === name);
                            if (matches.length > 0) {
                              matches.forEach((tx) => {
                                rowsToRender.push({
                                  id: tx.id,
                                  isPlaceholder: false,
                                  name: tx.name,
                                  category: tx.category,
                                  type: tx.type,
                                  amount: tx.amount,
                                  description: tx.description,
                                  date: tx.date,
                                  client: tx.client,
                                  event: tx.event
                                });
                              });
                            } else {
                              const mock = MOCK_DATA_FALLBACK[name];
                              rowsToRender.push({
                                id: `placeholder-${name}`,
                                isPlaceholder: true,
                                name: name,
                                category: NAME_TO_CATEGORY[name],
                                type: mock.type,
                                amount: mock.amount,
                                description: mock.desc,
                                date: groupBy === 'date' ? groupKey : '2026-05-27',
                                client: groupBy === 'client' ? groupKey : 'Budi',
                                event: groupBy === 'event' ? groupKey : 'Jastip SG Mei'
                              });
                            }
                          });

                          // Recalculate group total debet, kredit, and net balance to include the mock rows
                          const calculatedDebet = rowsToRender
                            .filter((r) => r.type === 'debet')
                            .reduce((sum, r) => sum + r.amount, 0);

                          const calculatedKredit = rowsToRender
                            .filter((r) => r.type === 'kredit')
                            .reduce((sum, r) => sum + r.amount, 0);

                          const calculatedNet = calculatedDebet - calculatedKredit;

                          return (
                            <>
                              {rowsToRender.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/50 transition">
                                  <td className="px-4 py-2 text-sm font-medium text-slate-900 border-r border-b border-slate-200 last:border-r-0">
                                    <div>{row.name}</div>
                                    <div className="flex flex-wrap gap-1 mt-1 text-[10px] font-normal text-slate-400">
                                      {groupBy !== 'date' && <span className="bg-slate-100 px-1 py-0.5 rounded">{row.date}</span>}
                                      {groupBy !== 'client' && <span className="bg-slate-100 px-1 py-0.5 rounded">Client: {row.client}</span>}
                                      {groupBy !== 'event' && <span className="bg-slate-100 px-1 py-0.5 rounded">Event: {row.event}</span>}
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 text-sm border-r border-b border-slate-200 last:border-r-0">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-slate-200 bg-slate-50 text-slate-600">
                                      {row.category}
                                    </span>
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
                                </tr>
                              ))}

                              {/* Daily Total Row */}
                              <tr className="bg-slate-100/40 font-semibold border-b border-slate-200">
                                <td colSpan="2" className="px-4 py-2 text-sm text-slate-700">
                                  {groupBy === 'date' ? 'Total Harian' : groupBy === 'client' ? 'Total Client' : 'Total Event'}
                                </td>
                                <td className="px-4 py-2 text-sm text-right font-mono text-emerald-700">
                                  {formatCellAmount(calculatedDebet)}
                                </td>
                                <td className="px-4 py-2 text-sm text-right font-mono text-rose-700">
                                  {formatCellAmount(calculatedKredit)}
                                </td>
                                <td className="px-4 py-2"></td>
                              </tr>

                              {/* Daily Netto (Saldo Bersih Harian) */}
                              <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold">
                                <td colSpan="2" className="px-4 py-2.5 text-slate-500 uppercase tracking-wider">
                                  {groupBy === 'date' ? 'Netto Harian (Selisih)' : groupBy === 'client' ? 'Netto Client (Selisih)' : 'Netto Event (Selisih)'}
                                </td>
                                <td colSpan="2" className={`px-4 py-2.5 text-center font-mono text-sm font-bold ${calculatedNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {calculatedNet >= 0 ? '+' : ''}{formatRupiah(calculatedNet)} ({calculatedNet >= 0 ? 'Surplus' : 'Defisit'})
                                </td>
                                <td className="px-4 py-2.5"></td>
                              </tr>
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* Pagination Navigation */}
        {sortedGroupKeys.length > 0 && (
          <section className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-2">
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan {groupBy === 'date' ? 'tanggal' : groupBy === 'client' ? 'client' : 'event'} <span className="font-semibold text-slate-700">{indexOfFirstGroup + 1}</span> - <span className="font-semibold text-slate-700">{Math.min(indexOfLastGroup, sortedGroupKeys.length)}</span> dari <span className="font-semibold text-slate-700">{sortedGroupKeys.length}</span> {groupBy === 'date' ? 'hari' : groupBy === 'client' ? 'client' : 'event'} terdaftar
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 px-3 py-2 rounded-md transition"
              >
                Sebelumnya
              </button>

              <div className="flex items-center gap-1.5 px-2">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-7 h-7 text-xs font-semibold rounded-md flex items-center justify-center transition ${currentPage === idx + 1 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 px-3 py-2 rounded-md transition"
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
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden transform transition-all">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Tambah Transaksi Jastip
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
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
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block p-2.5"
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

              {/* Grid: Nama Transaksi & Kategori */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Nama Transaksi
                  </label>
                  <select
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      setFormData({
                        ...formData,
                        name: selectedName,
                        category: NAME_TO_CATEGORY[selectedName]
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
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Kategori (Otomatis)
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={formData.category}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-500 text-sm rounded-lg block p-2.5 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              {/* Grid: Client & Event */}
              <div className="grid grid-cols-2 gap-4">
                {/* Client Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Client
                  </label>
                  <select
                    value={isNewClient ? 'NEW' : formData.client}
                    onChange={(e) => {
                      if (e.target.value === 'NEW') {
                        setIsNewClient(true);
                      } else {
                        setIsNewClient(false);
                        setFormData({ ...formData, client: e.target.value });
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block p-2.5 cursor-pointer"
                  >
                    {uniqueClients.map((client) => (
                      <option key={client} value={client}>
                        {client}
                      </option>
                    ))}
                    <option value="NEW">+ Tambah Baru...</option>
                  </select>
                  {isNewClient && (
                    <input
                      type="text"
                      required
                      placeholder="Nama Client Baru"
                      value={customClient}
                      onChange={(e) => setCustomClient(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg mt-2 p-2.5 focus:ring-slate-400 focus:border-slate-400"
                    />
                  )}
                </div>

                {/* Event Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Event
                  </label>
                  <select
                    value={isNewEvent ? 'NEW' : formData.event}
                    onChange={(e) => {
                      if (e.target.value === 'NEW') {
                        setIsNewEvent(true);
                      } else {
                        setIsNewEvent(false);
                        setFormData({ ...formData, event: e.target.value });
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-slate-400 focus:border-slate-400 block p-2.5 cursor-pointer"
                  >
                    {uniqueEvents.map((ev) => (
                      <option key={ev} value={ev}>
                        {ev}
                      </option>
                    ))}
                    <option value="NEW">+ Tambah Baru...</option>
                  </select>
                  {isNewEvent && (
                    <input
                      type="text"
                      required
                      placeholder="Nama Event Baru"
                      value={customEvent}
                      onChange={(e) => setCustomEvent(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg mt-2 p-2.5 focus:ring-slate-400 focus:border-slate-400"
                    />
                  )}
                </div>
              </div>

              {/* Nominal */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Nominal (IDR)
                </label>
                <input
                  type="number"
                  required
                  min="1"
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
                  className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-medium text-xs px-4 py-2.5 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition active:scale-[0.98]"
                >
                  Simpan Transaksi
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
