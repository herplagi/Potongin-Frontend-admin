import React, { useState, useEffect, useCallback, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../services/api";

// Komponen helper untuk menampilkan satu baris informasi
const InfoField = ({ label, value }) => (
  <div>
    <h4 className="text-sm font-medium text-gray-500">{label}</h4>
    <p className="mt-1 text-base text-gray-900 break-words">{value || "-"}</p>
  </div>
);

// Komponen helper untuk menampilkan pratinjau gambar
const ImagePreview = ({ title, imageUrl }) => {
  if (!imageUrl) {
    return (
      <div>
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <div className="mt-2 flex items-center justify-center h-48 text-sm text-gray-400 border rounded-lg bg-gray-50">
          Dokumen tidak diunggah.
        </div>
      </div>
    );
  }

  const fullImageUrl = `http://localhost:5000${imageUrl}`;

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-500">{title}</h4>
      <a href={fullImageUrl} target="_blank" rel="noopener noreferrer">
        <img
          src={fullImageUrl}
          alt={title}
          className="mt-2 border rounded-lg shadow-sm w-full h-auto max-h-80 object-contain hover:opacity-80 transition-opacity"
        />
      </a>
      <p className="text-xs text-center mt-1 text-gray-400">
        Klik gambar untuk memperbesar
      </p>
    </div>
  );
};

const BarbershopDetailPage = () => {
  const { barbershopId } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    const fetchShopDetail = async () => {
      try {
        const response = await api.get(`/admin/barbershops/${barbershopId}`);
        setShop(response.data);
      } catch (error) {
        console.error("Gagal mengambil detail barbershop:", error);
        toast.error("Gagal memuat data barbershop.");
      } finally {
        setLoading(false);
      }
    };
    fetchShopDetail();
  }, [barbershopId]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setRejectionReason("");
  };

  const handleConfirmRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.warn("Alasan penolakan tidak boleh kosong.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.patch(`/admin/barbershops/${barbershopId}/reject`, {
        reason: rejectionReason,
      });
      toast.success("Barbershop berhasil ditolak!");
      navigate("/admin/verify-barbershops");
    } catch (error) {
      toast.error("Gagal menolak barbershop.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveAction = async () => {
    setIsSubmitting(true);
    try {
      await api.patch(`/admin/barbershops/${barbershopId}/approve`);
      toast.success("Barbershop berhasil disetujui!");
      navigate("/admin/verify-barbershops");
    } catch (error) {
      toast.error("Gagal menyetujui barbershop.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading detail...</div>;
  if (!shop)
    return (
      <div className="p-8 text-center">Data barbershop tidak ditemukan.</div>
    );

  return (
    <div className="relative pb-32">
      {" "}
      {/* Padding bawah untuk memberi ruang bagi sticky bar */}
      <ToastContainer position="top-right" autoClose={3000} />
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{shop.name}</h1>
          <div className="flex items-center mt-2 space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              &larr; Kembali ke Daftar
            </button>
            <span
              className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusBadgeColor(
                shop.approval_status
              )}`}
            >
              {shop.approval_status}
            </span>
          </div>
        </div>
      </div>
      {/* --- KONTEN UTAMA DENGAN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Informasi Detail (2/3 Lebar) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">
              Informasi Barbershop
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField
                label="Alamat Lengkap"
                value={`${shop.address}, ${shop.city}`}
              />
              <div>
                <h4 className="text-sm font-medium text-gray-500">Jam Buka</h4>
                {(() => {
                  // Coba parse datanya. Jika sudah objek, ia akan tetap objek.
                  // Jika masih string, ia akan diubah menjadi objek.
                  let hours;
                  try {
                    hours =
                      typeof shop.opening_hours === "string"
                        ? JSON.parse(shop.opening_hours)
                        : shop.opening_hours;
                  } catch (e) {
                    return (
                      <p className="mt-1 text-sm text-red-500">
                        Format data jam buka salah.
                      </p>
                    );
                  }

                  if (!hours)
                    return <p className="mt-1 text-base text-gray-900">-</p>;

                  return (
                    <div className="mt-1 text-base text-gray-900 space-y-1">
                      {Object.entries(hours).map(([day, time]) => (
                        <div key={day} className="flex justify-between text-sm">
                          <span>{day}</span>
                          <span className="font-mono">
                            {time.aktif
                              ? `${time.buka} - ${time.tutup}`
                              : "Tutup"}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">
              Informasi Pemilik
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField label="Nama Pemilik" value={shop.owner?.name} />
              <InfoField label="Email" value={shop.owner?.email} />
              <InfoField
                label="Nomor Telepon"
                value={shop.owner?.phone_number}
              />
            </div>
          </div>
          {shop.approval_status === "rejected" && shop.rejection_reason && (
            <div className="p-6 bg-red-50 border-l-4 border-red-400">
              <h3 className="text-xl font-semibold text-red-800">
                Alasan Penolakan
              </h3>
              <p className="mt-2 text-red-700 italic">
                "{shop.rejection_reason}"
              </p>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Dokumen (1/3 Lebar) */}
        <div className="space-y-8">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">
              Dokumen Verifikasi
            </h3>
            <div className="mt-4 space-y-6">
              <ImagePreview title="Foto KTP" imageUrl={shop.ktp_url} />
              <ImagePreview
                title="Surat Izin Usaha"
                imageUrl={shop.permit_url}
              />
            </div>
          </div>
        </div>
      </div>
      {/* --- BAGIAN AKSI (STICKY) --- */}
      {shop.approval_status === "pending" && (
        <div className="fixed bottom-0 left-0 right-0 z-10 lg:left-64 flex items-center justify-end p-4 bg-white border-t border-gray-200 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] space-x-4">
          <p className="flex-1 hidden md:block text-sm text-gray-600">
            Setelah mereview semua data, silakan setujui atau tolak pendaftaran
            ini.
          </p>
          <button
            onClick={openModal}
            disabled={isSubmitting}
            className="px-6 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Tolak
          </button>
          <button
            onClick={handleApproveAction}
            disabled={isSubmitting}
            className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? "Memproses..." : "Setujui Pendaftaran"}
          </button>
        </div>
      )}
      {/* --- MODAL PENOLAKAN --- */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-20" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-40" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold leading-6 text-gray-900"
                  >
                    Konfirmasi Penolakan
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Mohon berikan alasan penolakan untuk barbershop{" "}
                      <span className="font-semibold">"{shop?.name}"</span>.
                    </p>
                    <textarea
                      className="w-full h-32 p-2 mt-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Contoh: Dokumen KTP tidak terbaca, data alamat tidak valid, dll."
                    />
                  </div>
                  <div className="flex justify-end mt-6 space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
                      onClick={closeModal}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none disabled:bg-red-300"
                      onClick={handleConfirmRejection}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Memproses..." : "Konfirmasi Tolak"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default BarbershopDetailPage;
