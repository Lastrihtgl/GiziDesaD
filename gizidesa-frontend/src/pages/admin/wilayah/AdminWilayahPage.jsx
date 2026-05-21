import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import {
  Crosshair,
  Edit,
  LocateFixed,
  MapPin,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createWilayah,
  deleteWilayah,
  getWilayahList,
  updateWilayah,
} from "../../../api/wilayahApi";
import ConfirmModal from "../../../components/common/ConfirmModal";
import EmptyState from "../../../components/common/EmptyState";
import ErrorAlert from "../../../components/common/ErrorAlert";
import AdminLayout from "../../../layouts/AdminLayout";

const CACHE_KEY = "gizidesa_wilayah_cache";

const DEFAULT_CENTER = {
  lat: 2.3339,
  lng: 99.0669,
};

const initialForm = {
  nama_dusun: "",
  nama_rt: "",
  kode_wilayah: "",
  latitude: "",
  longitude: "",
  keterangan: "",
};

function readCachedWilayah() {
  const cached = sessionStorage.getItem(CACHE_KEY);

  if (!cached) {
    return [];
  }

  try {
    return JSON.parse(cached);
  } catch {
    return [];
  }
}

function normalizeWilayah(item) {
  return {
    ...item,
    nama_dusun: item.nama_dusun || "",
    nama_rt: item.nama_rt || "",
    kode_wilayah: item.kode_wilayah || "",
    latitude: item.latitude ?? "",
    longitude: item.longitude ?? "",
    keterangan: item.keterangan || "",
  };
}

function hasCoordinate(item) {
  const latitude = Number(item.latitude);
  const longitude = Number(item.longitude);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function formatCoordinate(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "-";
  }

  return numberValue.toFixed(7);
}

function getCurrentFormPosition(formData) {
  const latitude = Number(formData.latitude);
  const longitude = Number(formData.longitude);

  if (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  ) {
    return {
      lat: latitude,
      lng: longitude,
    };
  }

  return DEFAULT_CENTER;
}

function getInitialMapPosition(wilayahList) {
  const wilayahWithCoordinate = wilayahList.find((item) => hasCoordinate(item));

  if (wilayahWithCoordinate) {
    return {
      lat: Number(wilayahWithCoordinate.latitude),
      lng: Number(wilayahWithCoordinate.longitude),
    };
  }

  return DEFAULT_CENTER;
}

function LocationPickerMap({ position, onPick }) {
  useMapEvents({
    click(event) {
      onPick({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return (
    <CircleMarker
      center={[position.lat, position.lng]}
      radius={12}
      pathOptions={{
        color: "#15803d",
        fillColor: "#22c55e",
        fillOpacity: 0.85,
        weight: 3,
      }}
    />
  );
}

function MapViewController({ position, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (!position?.lat || !position?.lng) {
      return;
    }

    map.setView([position.lat, position.lng], zoom);
  }, [map, position, zoom]);

  return null;
}

function AdminWilayahPage() {
  const [wilayahList, setWilayahList] = useState(() =>
    readCachedWilayah().map((item) => normalizeWilayah(item))
  );

  const [searchKeyword, setSearchKeyword] = useState("");
  const [formData, setFormData] = useState(initialForm);
  const [selectedWilayah, setSelectedWilayah] = useState(null);
  const [wilayahToDelete, setWilayahToDelete] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [draftMapPosition, setDraftMapPosition] = useState(() =>
    getInitialMapPosition(readCachedWilayah().map((item) => normalizeWilayah(item)))
  );
  const [mapZoom, setMapZoom] = useState(15);

  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  async function fetchWilayah() {
    try {
      setErrorMessage("");

      const response = await getWilayahList();

      const data =
        response.data ||
        response.wilayah ||
        response.items ||
        response ||
        [];

      const normalizedData = Array.isArray(data)
        ? data.map((item) => normalizeWilayah(item))
        : [];

      setWilayahList(normalizedData);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(normalizedData));
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Data wilayah gagal dimuat. Pastikan backend aktif dan token login valid."
      );
    }
  }

  useEffect(() => {
    fetchWilayah();
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setErrorMessage("");
    }, 4500);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  const filteredWilayah = useMemo(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    if (!keyword) {
      return wilayahList;
    }

    return wilayahList.filter((item) => {
      const dusun = item.nama_dusun?.toLowerCase() || "";
      const rt = item.nama_rt?.toLowerCase() || "";
      const kode = item.kode_wilayah?.toLowerCase() || "";
      const latitude = String(item.latitude || "").toLowerCase();
      const longitude = String(item.longitude || "").toLowerCase();
      const keterangan = item.keterangan?.toLowerCase() || "";

      return (
        dusun.includes(keyword) ||
        rt.includes(keyword) ||
        kode.includes(keyword) ||
        latitude.includes(keyword) ||
        longitude.includes(keyword) ||
        keterangan.includes(keyword)
      );
    });
  }, [searchKeyword, wilayahList]);

  const totalWilayah = wilayahList.length;

  const totalDusun = useMemo(() => {
    const dusunSet = new Set(
      wilayahList.map((item) => item.nama_dusun).filter(Boolean)
    );

    return dusunSet.size;
  }, [wilayahList]);

  const totalDataAktif = filteredWilayah.length;

  const totalDenganKoordinat = useMemo(() => {
    return wilayahList.filter((item) => hasCoordinate(item)).length;
  }, [wilayahList]);

  const handleOpenCreateModal = () => {
    const initialPosition = getInitialMapPosition(wilayahList);

    setSelectedWilayah(null);
    setFormData(initialForm);
    setDraftMapPosition(initialPosition);
    setMapZoom(15);
    setLocationQuery("");
    setLocationResults([]);
    setLocationMessage("");
    setErrorMessage("");
    setSuccessMessage("");
    setFormErrorMessage("");
    setFieldErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    const normalizedItem = normalizeWilayah(item);

    const nextForm = {
      nama_dusun: normalizedItem.nama_dusun || "",
      nama_rt: normalizedItem.nama_rt || "",
      kode_wilayah: normalizedItem.kode_wilayah || "",
      latitude:
        normalizedItem.latitude !== null &&
        normalizedItem.latitude !== undefined &&
        normalizedItem.latitude !== ""
          ? String(normalizedItem.latitude)
          : "",
      longitude:
        normalizedItem.longitude !== null &&
        normalizedItem.longitude !== undefined &&
        normalizedItem.longitude !== ""
          ? String(normalizedItem.longitude)
          : "",
      keterangan: normalizedItem.keterangan || "",
    };

    setSelectedWilayah(normalizedItem);
    setFormData(nextForm);
    setDraftMapPosition(getCurrentFormPosition(nextForm));
    setMapZoom(16);
    setLocationQuery("");
    setLocationResults([]);
    setLocationMessage("");
    setErrorMessage("");
    setSuccessMessage("");
    setFormErrorMessage("");
    setFieldErrors({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setMapModalOpen(false);
    setSelectedWilayah(null);
    setFormData(initialForm);
    setDraftMapPosition(DEFAULT_CENTER);
    setMapZoom(15);
    setLocationQuery("");
    setLocationResults([]);
    setLocationMessage("");
    setFormErrorMessage("");
    setFieldErrors({});
  };

  const handleOpenMapModal = () => {
    setDraftMapPosition(getCurrentFormPosition(formData));
    setMapZoom(formData.latitude && formData.longitude ? 16 : 14);
    setLocationQuery("");
    setLocationResults([]);
    setLocationMessage("");
    setMapModalOpen(true);
  };

  const handleCloseMapModal = () => {
    setMapModalOpen(false);
    setLocationMessage("");
  };

  const handlePickMapLocation = (position) => {
    setDraftMapPosition(position);
    setMapZoom(17);
    setLocationMessage("Titik lokasi berhasil dipilih dari peta.");
  };

  const handleUseSelectedLocation = () => {
    setFormData((previous) => ({
      ...previous,
      latitude: draftMapPosition.lat.toFixed(7),
      longitude: draftMapPosition.lng.toFixed(7),
    }));

    setFieldErrors((previous) => {
      const updated = { ...previous };
      delete updated.latitude;
      delete updated.longitude;
      return updated;
    });

    setFormErrorMessage("");
    setMapModalOpen(false);
  };

  const handleSearchLocation = async (event) => {
    event.preventDefault();

    const query = locationQuery.trim();

    if (!query) {
      setLocationResults([]);
      setLocationMessage("Masukkan nama desa, dusun, kecamatan, atau kabupaten.");
      return;
    }

    try {
      setSearchingLocation(true);
      setLocationMessage("");

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=id&accept-language=id&q=${encodeURIComponent(
          query
        )}`
      );

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        setLocationResults([]);
        setLocationMessage(
          "Lokasi tidak ditemukan. Coba gunakan kata kunci lebih lengkap, misalnya nama desa dan kabupaten."
        );
        return;
      }

      const results = data
        .filter((item) => Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lon)))
        .map((item) => ({
          id: item.place_id,
          name: item.display_name,
          lat: Number(item.lat),
          lng: Number(item.lon),
          type: item.type,
        }));

      setLocationResults(results);

      if (results[0]) {
        setDraftMapPosition({
          lat: results[0].lat,
          lng: results[0].lng,
        });
        setMapZoom(15);
      }

      setLocationMessage("Pilih salah satu hasil pencarian, lalu klik titik RT/dusun yang tepat pada peta.");
    } catch {
      setLocationMessage("Pencarian lokasi gagal. Periksa koneksi internet lalu coba lagi.");
    } finally {
      setSearchingLocation(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    setDraftMapPosition({
      lat: result.lat,
      lng: result.lng,
    });
    setMapZoom(16);
    setLocationMessage("Peta diarahkan ke hasil pencarian. Klik titik RT/dusun yang paling tepat.");
  };

  const handleUseBrowserLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Browser tidak mendukung fitur lokasi.");
      return;
    }

    setLocationMessage("Mengambil lokasi perangkat...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDraftMapPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setMapZoom(17);
        setLocationMessage("Lokasi perangkat berhasil digunakan. Sesuaikan titik jika belum tepat.");
      },
      () => {
        setLocationMessage(
          "Lokasi perangkat tidak dapat diambil. Izinkan akses lokasi pada browser atau gunakan pencarian lokasi."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const handleResetToExistingCoordinate = () => {
    const position = getCurrentFormPosition(formData);

    setDraftMapPosition(position);
    setMapZoom(formData.latitude && formData.longitude ? 17 : 14);
    setLocationMessage(
      formData.latitude && formData.longitude
        ? "Peta dikembalikan ke koordinat yang sudah tersimpan."
        : "Peta dikembalikan ke titik awal."
    );
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    const nextForm = {
      ...formData,
      [name]: value,
    };

    setFormData(nextForm);

    if (name === "latitude" || name === "longitude") {
      setDraftMapPosition(getCurrentFormPosition(nextForm));
      setMapZoom(16);
    }

    if (fieldErrors[name]) {
      setFieldErrors((previous) => {
        const updated = { ...previous };
        delete updated[name];
        return updated;
      });
    }

    if (formErrorMessage) {
      setFormErrorMessage("");
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.nama_dusun.trim()) {
      errors.nama_dusun = "Nama dusun wajib diisi.";
    }

    if (!formData.nama_rt.trim()) {
      errors.nama_rt = "Nama RT wajib diisi.";
    }

    if (!formData.kode_wilayah.trim()) {
      errors.kode_wilayah = "Kode wilayah wajib diisi.";
    }

    if (formData.latitude !== "") {
      const latitude = Number(formData.latitude);

      if (!Number.isFinite(latitude)) {
        errors.latitude = "Latitude harus berupa angka.";
      } else if (latitude < -90 || latitude > 90) {
        errors.latitude = "Latitude harus berada di antara -90 sampai 90.";
      }
    }

    if (formData.longitude !== "") {
      const longitude = Number(formData.longitude);

      if (!Number.isFinite(longitude)) {
        errors.longitude = "Longitude harus berupa angka.";
      } else if (longitude < -180 || longitude > 180) {
        errors.longitude = "Longitude harus berada di antara -180 sampai 180.";
      }
    }

    if (
      (formData.latitude && !formData.longitude) ||
      (!formData.latitude && formData.longitude)
    ) {
      if (!formData.latitude) {
        errors.latitude = "Latitude wajib diisi jika longitude diisi.";
      }

      if (!formData.longitude) {
        errors.longitude = "Longitude wajib diisi jika latitude diisi.";
      }
    }

    setFieldErrors(errors);

    return Object.values(errors)[0] || "";
  };

  const getFieldClassName = (field) => {
    return fieldErrors[field] ? "field-invalid" : "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      setFormErrorMessage(validationMessage);
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");
      setFormErrorMessage("");
      setFieldErrors({});

      const payload = {
        nama_dusun: formData.nama_dusun.trim(),
        nama_rt: formData.nama_rt.trim(),
        kode_wilayah: formData.kode_wilayah.trim(),
        latitude: formData.latitude !== "" ? Number(formData.latitude) : null,
        longitude: formData.longitude !== "" ? Number(formData.longitude) : null,
        keterangan: formData.keterangan.trim() || null,
      };

      if (selectedWilayah) {
        await updateWilayah(selectedWilayah.id, payload);
        setSuccessMessage("Data wilayah berhasil diperbarui.");
      } else {
        await createWilayah(payload);
        setSuccessMessage("Data wilayah berhasil ditambahkan.");
      }

      setModalOpen(false);
      setMapModalOpen(false);
      setSelectedWilayah(null);
      setFormData(initialForm);
      setDraftMapPosition(DEFAULT_CENTER);
      setMapZoom(15);
      setFormErrorMessage("");
      setFieldErrors({});
      setLocationQuery("");
      setLocationResults([]);
      setLocationMessage("");

      await fetchWilayah();
    } catch (error) {
      const validationErrors = error.response?.data?.errors;

      if (validationErrors) {
        const formattedErrors = {};

        Object.entries(validationErrors).forEach(([field, messages]) => {
          formattedErrors[field] = Array.isArray(messages)
            ? messages[0]
            : String(messages);
        });

        setFieldErrors(formattedErrors);
        setFormErrorMessage(
          Object.values(formattedErrors)[0] || "Validasi data wilayah gagal."
        );
      } else {
        setFormErrorMessage(
          error.response?.data?.message ||
            "Data wilayah gagal disimpan. Periksa kembali input yang diberikan."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteConfirm = (item) => {
    setWilayahToDelete(item);
    setConfirmOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleCancelDelete = () => {
    if (deleting) {
      return;
    }

    setConfirmOpen(false);
    setWilayahToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!wilayahToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteWilayah(wilayahToDelete.id);

      setSuccessMessage("Data wilayah berhasil dihapus.");
      setConfirmOpen(false);
      setWilayahToDelete(null);

      await fetchWilayah();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Data wilayah gagal dihapus. Wilayah mungkin masih digunakan oleh data risiko atau intervensi."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="Kelola Wilayah"
      subtitle="Mengelola data dusun dan RT sebagai basis pemetaan risiko stunting."
    >
      <ErrorAlert message={errorMessage} />

      {successMessage && (
        <div className="admin-success-alert">
          <strong>Berhasil</strong>
          <p>{successMessage}</p>
        </div>
      )}

      <section className="admin-overview-grid risiko-overview">
        <article className="admin-metric-card">
          <span>Total Wilayah</span>
          <strong>{totalWilayah}</strong>
          <p>RT/Dusun terdaftar</p>
        </article>

        <article className="admin-metric-card success">
          <span>Total Dusun</span>
          <strong>{totalDusun}</strong>
          <p>Kelompok dusun unik</p>
        </article>

        <article className="admin-metric-card trend">
          <span>Data Aktif</span>
          <strong>{totalDataAktif}</strong>
          <p>Hasil sesuai pencarian</p>
        </article>

        <article className="admin-metric-card success">
          <span>Koordinat Tersedia</span>
          <strong>{totalDenganKoordinat}</strong>
          <p>Wilayah siap tampil di peta</p>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-list-toolbar">
          <div>
            <span>Daftar Wilayah</span>
            <h2>Wilayah Pemantauan</h2>
            <p>
              Data wilayah menjadi referensi utama untuk input data risiko,
              perhitungan IRS, rekomendasi, intervensi, laporan desa, dan peta
              risiko berbasis koordinat.
            </p>
          </div>

          <div className="admin-filter-group">
            <div className="admin-search-control">
              <Search size={18} />
              <input
                type="text"
                value={searchKeyword}
                placeholder="Cari dusun, RT, kode, atau koordinat..."
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </div>

            <button
              type="button"
              className="admin-primary-button"
              onClick={handleOpenCreateModal}
            >
              <Plus size={18} />
              Tambah Wilayah
            </button>
          </div>
        </div>

        {filteredWilayah.length === 0 ? (
          <EmptyState
            title="Data wilayah belum tersedia"
            message="Tambahkan data dusun/RT agar sistem dapat digunakan untuk pemetaan risiko."
          />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Kode Wilayah</th>
                  <th>Dusun</th>
                  <th>RT</th>
                  <th>Koordinat</th>
                  <th>Keterangan</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredWilayah.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="table-code-cell">
                        <span>
                          <MapPin size={15} />
                        </span>
                        <strong>{item.kode_wilayah || "-"}</strong>
                      </div>
                    </td>

                    <td>{item.nama_dusun || "-"}</td>
                    <td>{item.nama_rt || "-"}</td>

                    <td>
                      {hasCoordinate(item) ? (
                        <span className="table-muted-text">
                          {formatCoordinate(item.latitude)},{" "}
                          {formatCoordinate(item.longitude)}
                        </span>
                      ) : (
                        <span className="risk-badge risk-badge-unknown">
                          Belum ada
                        </span>
                      )}
                    </td>

                    <td>
                      <span className="table-muted-text">
                        {item.keterangan || "-"}
                      </span>
                    </td>

                    <td>
                      <div className="table-action-group">
                        <button
                          type="button"
                          className="table-action-button edit"
                          onClick={() => handleOpenEditModal(item)}
                          title="Edit wilayah"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          type="button"
                          className="table-action-button delete"
                          onClick={() => handleOpenDeleteConfirm(item)}
                          title="Hapus wilayah"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal large risk-form-modal">
            <div className="admin-modal-header risk-form-header">
              <div>
                <span>Form Wilayah</span>
                <h2>{selectedWilayah ? "Edit Wilayah" : "Tambah Wilayah"}</h2>
                <p>
                  Lengkapi data wilayah. Lokasi RT/dusun dapat dipilih langsung
                  melalui peta agar koordinat terisi otomatis.
                </p>
              </div>

              <button type="button" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            {formErrorMessage && (
              <div className="admin-form-error compact">
                <strong>Periksa kembali input</strong>
                <p>{formErrorMessage}</p>
              </div>
            )}

            <form
              className="admin-form risk-compact-form"
              onSubmit={handleSubmit}
            >
              <div className="admin-form-grid risk-form-grid">
                <label>
                  <span>Nama Dusun</span>
                  <input
                    type="text"
                    name="nama_dusun"
                    value={formData.nama_dusun}
                    className={getFieldClassName("nama_dusun")}
                    placeholder="Contoh: Dusun I"
                    onChange={handleChange}
                  />
                  {fieldErrors.nama_dusun && (
                    <small className="field-error-text">
                      {fieldErrors.nama_dusun}
                    </small>
                  )}
                </label>

                <label>
                  <span>Nama RT</span>
                  <input
                    type="text"
                    name="nama_rt"
                    value={formData.nama_rt}
                    className={getFieldClassName("nama_rt")}
                    placeholder="Contoh: RT 01"
                    onChange={handleChange}
                  />
                  {fieldErrors.nama_rt && (
                    <small className="field-error-text">
                      {fieldErrors.nama_rt}
                    </small>
                  )}
                </label>

                <label>
                  <span>Kode Wilayah</span>
                  <input
                    type="text"
                    name="kode_wilayah"
                    value={formData.kode_wilayah}
                    className={getFieldClassName("kode_wilayah")}
                    placeholder="Contoh: DSN1-RT01"
                    onChange={handleChange}
                  />
                  {fieldErrors.kode_wilayah && (
                    <small className="field-error-text">
                      {fieldErrors.kode_wilayah}
                    </small>
                  )}
                </label>

                <label>
                  <span>Status Lokasi</span>
                  <input
                    type="text"
                    value={
                      formData.latitude && formData.longitude
                        ? "Lokasi sudah dipilih"
                        : "Lokasi belum dipilih"
                    }
                    disabled
                    readOnly
                  />
                </label>
              </div>

              <div className="location-picker-card">
                <div>
                  <span>Lokasi Wilayah</span>
                  <h3>
                    {formData.latitude && formData.longitude
                      ? "Titik lokasi sudah tersedia"
                      : "Pilih titik lokasi pada peta"}
                  </h3>
                  <p>
                    Admin dapat mencari nama lokasi terlebih dahulu, lalu klik
                    titik RT/dusun yang paling tepat pada peta.
                  </p>
                </div>

                <button
                  type="button"
                  className="admin-primary-button"
                  onClick={handleOpenMapModal}
                >
                  <MapPin size={18} />
                  {formData.latitude && formData.longitude
                    ? "Ubah Lokasi"
                    : "Pilih Lokasi di Peta"}
                </button>
              </div>

              <div className="admin-form-grid risk-form-grid">
                <label>
                  <span>Latitude</span>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    className={getFieldClassName("latitude")}
                    placeholder="Otomatis dari peta"
                    step="0.0000001"
                    min="-90"
                    max="90"
                    onChange={handleChange}
                  />
                  {fieldErrors.latitude && (
                    <small className="field-error-text">
                      {fieldErrors.latitude}
                    </small>
                  )}
                </label>

                <label>
                  <span>Longitude</span>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    className={getFieldClassName("longitude")}
                    placeholder="Otomatis dari peta"
                    step="0.0000001"
                    min="-180"
                    max="180"
                    onChange={handleChange}
                  />
                  {fieldErrors.longitude && (
                    <small className="field-error-text">
                      {fieldErrors.longitude}
                    </small>
                  )}
                </label>
              </div>

              <label className="risk-note-field">
                <span>Keterangan</span>
                <textarea
                  name="keterangan"
                  value={formData.keterangan}
                  placeholder="Opsional, misalnya catatan lokasi atau informasi tambahan."
                  onChange={handleChange}
                />
              </label>

              <div className="risk-note-box refined">
                <MapPin size={18} />
                <p>
                  Latitude dan longitude tetap ditampilkan agar admin dapat
                  memeriksa titik lokasi. Alur utama tetap melalui tombol pilih
                  lokasi pada peta.
                </p>
              </div>

              <div className="admin-form-actions risk-form-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Simpan Wilayah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mapModalOpen && (
        <div className="admin-modal-backdrop top-layer">
          <div className="admin-modal map-picker-modal">
            <div className="admin-modal-header">
              <div>
                <span>Pilih Lokasi</span>
                <h2>Pilih Titik Wilayah di Peta</h2>
                <p>
                  Cari lokasi terlebih dahulu agar peta langsung mengarah ke
                  area desa, lalu klik titik RT/dusun yang ingin disimpan.
                </p>
              </div>

              <button type="button" onClick={handleCloseMapModal}>
                <X size={20} />
              </button>
            </div>

            <form className="map-search-panel" onSubmit={handleSearchLocation}>
              <div className="map-search-input">
                <Search size={18} />
                <input
                  type="text"
                  value={locationQuery}
                  placeholder="Cari lokasi, contoh: Pangururan Samosir, Balige Toba, atau nama desa"
                  onChange={(event) => setLocationQuery(event.target.value)}
                />
              </div>

              <button
                type="submit"
                className="admin-primary-button"
                disabled={searchingLocation}
              >
                {searchingLocation ? "Mencari..." : "Cari Lokasi"}
              </button>

              <button
                type="button"
                className="admin-secondary-button"
                onClick={handleUseBrowserLocation}
              >
                <LocateFixed size={17} />
                Lokasi Saya
              </button>

              <button
                type="button"
                className="admin-secondary-button"
                onClick={handleResetToExistingCoordinate}
              >
                <Crosshair size={17} />
                Reset Titik
              </button>
            </form>

            {locationMessage && (
              <div className="map-location-message">
                {locationMessage}
              </div>
            )}

            {locationResults.length > 0 && (
              <div className="map-search-results">
                {locationResults.map((result) => (
                  <button
                    type="button"
                    key={result.id}
                    onClick={() => handleSelectSearchResult(result)}
                  >
                    <MapPin size={15} />
                    <span>{result.name}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="leaflet-map-picker">
              <MapContainer
                center={[draftMapPosition.lat, draftMapPosition.lng]}
                zoom={mapZoom}
                scrollWheelZoom
                className="leaflet-location-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapViewController position={draftMapPosition} zoom={mapZoom} />

                <LocationPickerMap
                  position={draftMapPosition}
                  onPick={handlePickMapLocation}
                />
              </MapContainer>
            </div>

            <div className="map-picker-summary">
              <div>
                <span>Titik Terpilih</span>
                <strong>
                  {draftMapPosition.lat.toFixed(7)},{" "}
                  {draftMapPosition.lng.toFixed(7)}
                </strong>
              </div>

              <p>
                Klik area peta untuk mengubah titik lokasi. Titik ini akan
                digunakan pada Peta Risiko.
              </p>
            </div>

            <div className="admin-form-actions">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={handleCloseMapModal}
              >
                Batal
              </button>

              <button
                type="button"
                className="admin-primary-button"
                onClick={handleUseSelectedLocation}
              >
                Gunakan Lokasi Ini
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Hapus Data Wilayah?"
        message={
          wilayahToDelete
            ? `Data ${wilayahToDelete.nama_dusun} - ${wilayahToDelete.nama_rt} akan dihapus. Aksi ini tidak dapat dibatalkan.`
            : "Data wilayah akan dihapus. Aksi ini tidak dapat dibatalkan."
        }
        confirmText="Hapus Wilayah"
        cancelText="Batal"
        loading={deleting}
        variant="danger"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  );
}

export default AdminWilayahPage;