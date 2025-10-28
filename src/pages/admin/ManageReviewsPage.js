// src/pages/admin/ManageReviewsPage.js
import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiFilter, FiStar, FiAlertTriangle, FiCheckCircle, FiXCircle, FiFlag } from 'react-icons/fi';

const ManageReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected
    const [filterFlag, setFilterFlag] = useState('all'); // all, flagged, clean
    const [selectedReview, setSelectedReview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [moderationAction, setModerationAction] = useState(''); // approve, reject, flag
    const [moderationNote, setModerationNote] = useState('');
    const [stats, setStats] = useState(null);

    // Filter kata kasar (bisa dipindah ke backend untuk lebih aman)
    const badWords = [
        'anjing', 'babi', 'bangsat', 'bajingan', 'kontol', 'memek', 'tolol', 
        'bodoh', 'goblok', 'kampret', 'asu', 'jancok', 'kimak', 'pepek',
        // Tambahkan kata-kata lain sesuai kebutuhan
    ];

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            let url = '/reviews/admin/all?limit=100';
            if (filterStatus !== 'all') {
                url += `&status=${filterStatus}`;
            }
            const response = await api.get(url);
            
            // Auto-flag reviews dengan kata kasar
            const reviewsWithFlags = response.data.map(review => ({
                ...review,
                containsBadWords: checkBadWords(review.comment || '')
            }));

            // Apply filter flag
            let filtered = reviewsWithFlags;
            if (filterFlag === 'flagged') {
                filtered = reviewsWithFlags.filter(r => r.is_flagged || r.containsBadWords);
            } else if (filterFlag === 'clean') {
                filtered = reviewsWithFlags.filter(r => !r.is_flagged && !r.containsBadWords);
            }

            setReviews(filtered);
        } catch (error) {
            toast.error('Gagal memuat review');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filterFlag]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await api.get('/reviews/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Gagal memuat statistik:', error);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
        fetchStats();
    }, [fetchReviews, fetchStats]);

    const checkBadWords = (text) => {
        if (!text) return false;
        const lowerText = text.toLowerCase();
        return badWords.some(word => lowerText.includes(word));
    };

    const highlightBadWords = (text) => {
        if (!text) return '';
        let highlightedText = text;
        badWords.forEach(word => {
            const regex = new RegExp(`(${word})`, 'gi');
            highlightedText = highlightedText.replace(
                regex, 
                '<span class="bg-red-200 text-red-800 font-semibold px-1 rounded">$1</span>'
            );
        });
        return highlightedText;
    };

    const openModal = (review, action) => {
        setSelectedReview(review);
        setModerationAction(action);
        setModerationNote(review.admin_note || '');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedReview(null);
        setModerationNote('');
    };

    const handleModerate = async () => {
        if (!selectedReview || !moderationAction) return;

        try {
            if (moderationAction === 'delete') {
                await api.delete(`/reviews/admin/${selectedReview.review_id}`);
                toast.success('Review berhasil dihapus');
            } else {
                const status = moderationAction === 'approve' ? 'approved' : 'rejected';
                await api.patch(`/reviews/admin/${selectedReview.review_id}/moderate`, {
                    status,
                    rejection_reason: moderationAction === 'reject' ? moderationNote : null,
                    is_flagged: moderationAction === 'flag',
                    admin_note: moderationNote
                });
                toast.success(`Review berhasil di-${moderationAction === 'approve' ? 'setujui' : moderationAction === 'reject' ? 'tolak' : 'tandai'}`);
            }
            fetchReviews();
            fetchStats();
            closeModal();
        } catch (error) {
            toast.error('Gagal memproses review');
            console.error(error);
        }
    };

    const renderStars = (rating) => {
        return Array(5).fill(0).map((_, i) => (
            <FiStar
                key={i}
                className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                size={16}
            />
        ));
    };

    const getStatusBadge = (status) => {
        const badges = {
            approved: { bg: 'bg-green-100', text: 'text-green-800', label: '✓ Disetujui' },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', label: '✗ Ditolak' },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ Pending' }
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    if (loading) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Kelola Review</h1>
            <p className="text-gray-600 mb-6">Moderasi dan filter review dari customer</p>

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <p className="text-sm text-gray-500">Total Review</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.totalReviews}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg shadow-md p-4 border border-yellow-200">
                        <p className="text-sm text-yellow-700">Pending</p>
                        <p className="text-2xl font-bold text-yellow-800">{stats.pendingReviews}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg shadow-md p-4 border border-green-200">
                        <p className="text-sm text-green-700">Disetujui</p>
                        <p className="text-2xl font-bold text-green-800">{stats.approvedReviews}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg shadow-md p-4 border border-purple-200">
                        <p className="text-sm text-purple-700">Rating Rata-rata</p>
                        <p className="text-2xl font-bold text-purple-800">⭐ {stats.averageRating}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                    <FiFilter className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter:</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <div className="flex space-x-2">
                            {['all', 'pending', 'approved', 'rejected'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        filterStatus === status
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {status === 'all' ? 'Semua' : status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Konten</label>
                        <div className="flex space-x-2">
                            {['all', 'flagged', 'clean'].map(flag => (
                                <button
                                    key={flag}
                                    onClick={() => setFilterFlag(flag)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        filterFlag === flag
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {flag === 'all' ? 'Semua' : flag === 'flagged' ? '⚠️ Ditandai' : '✓ Bersih'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500">Tidak ada review dengan filter ini</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review.review_id}
                            className={`bg-white rounded-lg shadow-md p-6 ${
                                review.containsBadWords || review.is_flagged 
                                    ? 'border-l-4 border-red-500' 
                                    : ''
                            }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="flex">{renderStars(review.rating)}</div>
                                        <span className="text-lg font-bold text-gray-900">{review.rating}.0</span>
                                        {getStatusBadge(review.status)}
                                        {(review.containsBadWords || review.is_flagged) && (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center">
                                                <FiAlertTriangle className="mr-1" size={12} />
                                                Perlu Perhatian
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Customer:</span>
                                            <span className="ml-2 font-medium text-gray-900">
                                                {review.customer?.name}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Barbershop:</span>
                                            <span className="ml-2 font-medium text-gray-900">
                                                {review.Barbershop?.name}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Tanggal:</span>
                                            <span className="ml-2 text-gray-700">
                                                {new Date(review.createdAt).toLocaleDateString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Review Content */}
                            <div className="mb-4">
                                {review.title && (
                                    <h4 className="font-semibold text-gray-800 mb-2">{review.title}</h4>
                                )}
                                {review.comment && (
                                    <div
                                        className="text-gray-700 leading-relaxed p-3 bg-gray-50 rounded"
                                        dangerouslySetInnerHTML={{
                                            __html: highlightBadWords(review.comment)
                                        }}
                                    />
                                )}
                            </div>

                            {/* Admin Note */}
                            {review.admin_note && (
                                <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r">
                                    <p className="text-sm text-blue-700">
                                        <strong>Catatan Admin:</strong> {review.admin_note}
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                                {review.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => openModal(review, 'approve')}
                                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                        >
                                            <FiCheckCircle className="mr-2" size={16} />
                                            Setujui
                                        </button>
                                        <button
                                            onClick={() => openModal(review, 'reject')}
                                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                                        >
                                            <FiXCircle className="mr-2" size={16} />
                                            Tolak
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => openModal(review, 'flag')}
                                    className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
                                >
                                    <FiFlag className="mr-2" size={16} />
                                    Tandai
                                </button>
                                <button
                                    onClick={() => openModal(review, 'delete')}
                                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Moderation Modal */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-30" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl">
                                <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 mb-4">
                                    {moderationAction === 'approve' && 'Setujui Review'}
                                    {moderationAction === 'reject' && 'Tolak Review'}
                                    {moderationAction === 'flag' && 'Tandai Review'}
                                    {moderationAction === 'delete' && 'Hapus Review'}
                                </Dialog.Title>

                                {moderationAction === 'delete' ? (
                                    <p className="text-gray-700 mb-6">
                                        Apakah Anda yakin ingin menghapus review ini secara permanen?
                                    </p>
                                ) : (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Catatan (opsional)
                                        </label>
                                        <textarea
                                            value={moderationNote}
                                            onChange={(e) => setModerationNote(e.target.value)}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Tambahkan catatan untuk moderasi ini..."
                                        />
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={closeModal}
                                        className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleModerate}
                                        className={`px-4 py-2 rounded-md text-white ${
                                            moderationAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                                            moderationAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                                            moderationAction === 'flag' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                            'bg-gray-600 hover:bg-gray-700'
                                        }`}
                                    >
                                        Konfirmasi
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ManageReviewsPage;