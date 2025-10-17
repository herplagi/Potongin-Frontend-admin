import React, { useState, useEffect, useCallback, Fragment } from "react";
import api from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Dialog, Transition } from "@headlessui/react";
import { Link } from 'react-router-dom';

const VerifyBarbershopsPage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  // State untuk menunjukkan tombol mana yang sedang diproses
  const [submittingId, setSubmittingId] = useState(null);

  const fetchShops = useCallback(async () => {
    try {
      setLoading(true);
      // Ganti endpoint dan tambahkan parameter status
      const response = await api.get(
        `/admin/barbershops?status=${filterStatus}`
      );
      setShops(response.data);
    } catch (err) {
      // ...
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const openRejectModal = (shop) => {
    setSelectedShop(shop);
    setIsModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsModalOpen(false);
    setSelectedShop(null);
    setRejectionReason("");
  };

  const handleConfirmRejection = async () => {
    if (!selectedShop || !rejectionReason) {
      toast.error("Alasan penolakan tidak boleh kosong.");
      return;
    }
    // Logika ini mirip dengan handleAction sebelumnya
    setSubmittingId(selectedShop.barbershop_id);
    try {
      await api.patch(
        `/admin/barbershops/${selectedShop.barbershop_id}/reject`,
        { reason: rejectionReason }
      );
      setShops((prevShops) =>
        prevShops.filter(
          (shop) => shop.barbershop_id !== selectedShop.barbershop_id
        )
      );
      toast.success(`Barbershop berhasil ditolak.`);
      closeRejectModal();
    } catch (err) {
      toast.error(`Gagal menolak barbershop.`);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleAction = async (shopId, action) => {
    if (submittingId) return;
    setSubmittingId(shopId);
    try {
      await api.patch(`/admin/barbershops/${shopId}/${action}`);
      setShops((prevShops) =>
        prevShops.filter((shop) => shop.barbershop_id !== shopId)
      );
      toast.success(
        `Barbershop berhasil di-${action === "approve" ? "setujui" : "tolak"}.`
      );
    } catch (err) {
      toast.error(`Gagal memproses barbershop.`);
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading data...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <h1 className="text-3xl font-bold text-gray-800">
        Verifikasi Barbershop
      </h1>
      <p className="mt-1 text-gray-600">
        Setujui atau tolak pendaftaran barbershop baru.
      </p>

      {/* --- BAGIAN TAB FILTER --- */}
      <div className="flex space-x-2 border-b mt-4">
        <button
          onClick={() => setFilterStatus("pending")}
          className={`px-4 py-2 text-sm font-medium ${
            filterStatus === "pending"
              ? "border-b-2 border-indigo-500 text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Pending ({})
        </button>
        <button
          onClick={() => setFilterStatus("approved")}
          className={`px-4 py-2 text-sm font-medium ${
            filterStatus === "approved"
              ? "border-b-2 border-indigo-500 text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Disetujui
        </button>
        <button
          onClick={() => setFilterStatus("rejected")}
          className={`px-4 py-2 text-sm font-medium ${
            filterStatus === "rejected"
              ? "border-b-2 border-indigo-500 text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Ditolak
        </button>
      </div>

      <div className="mt-8 overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Nama Barbershop
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Pemilik
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Lokasi
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Tanggal Daftar
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shops.length > 0 ? (
                  shops.map((shop) => (
                    <tr key={shop.barbershop_id}>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {shop.name}
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {shop.owner.name} ({shop.owner.email})
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {shop.address}, {shop.city}
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(shop.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">
                        <Link
                          to={`/admin/verify-barbershops/${shop.barbershop_id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Lihat Detail & Aksi
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Tidak ada barbershop yang menunggu persetujuan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeRejectModal}>
          {/* ... (Salin kode lengkap modal dari dokumentasi Headless UI) ... */}
          {/* Contoh sederhana: */}
          <div className="fixed inset-0 bg-black bg-opacity-25" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Alasan Penolakan untuk "{selectedShop?.name}"
                </Dialog.Title>
                <div className="mt-2">
                  <textarea
                    className="w-full h-24 p-2 border border-gray-300 rounded-md"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Contoh: Foto lokasi tidak jelas, data tidak valid, dll."
                  />
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={closeRejectModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirmRejection}
                    className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Konfirmasi Tolak
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

export default VerifyBarbershopsPage;
