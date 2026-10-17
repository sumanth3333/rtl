"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { MapPin } from "lucide-react";

import { fetchAllCompanies } from "@/services/admin/adminService";
import { getStores } from "@/services/owner/ownerService";
import { fetchStoreAddress, updateStoreAddress } from "@/services/admin/storeAddressService";
import { SimpleCompany } from "@/types/fileExportTypes";
import { Store } from "@/schemas/storeSchema";
import { StoreAddress } from "@/types/storeAddressTypes";
import { ApiError } from "@/services/api/errorHandler";

const StoreLocationPicker = dynamic(() => import("./StoreLocationPicker"), {
    ssr: false,
    loading: () => <div className="h-[320px] rounded-lg bg-gray-100 dark:bg-gray-900 animate-pulse" />,
});

const inputClasses =
    "rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed";

export default function StoreAddressSection() {
    const [companies, setCompanies] = useState<SimpleCompany[]>([]);
    const [companiesLoading, setCompaniesLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState("");

    const [stores, setStores] = useState<Store[]>([]);
    const [storesLoading, setStoresLoading] = useState(false);
    const [selectedStoreId, setSelectedStoreId] = useState("");

    const [addressLoading, setAddressLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [address, setAddress] = useState<StoreAddress | null>(null);
    const [streetName, setStreetName] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zipcode, setZipcode] = useState("");
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);

    // Load the company dropdown once.
    useEffect(() => {
        let cancelled = false;
        fetchAllCompanies()
            .then((data) => { if (!cancelled) { setCompanies(data); } })
            .catch(() => { if (!cancelled) { setError("Failed to load companies."); } })
            .finally(() => { if (!cancelled) { setCompaniesLoading(false); } });
        return () => { cancelled = true; };
    }, []);

    // Reload the store dropdown whenever the selected company changes.
    useEffect(() => {
        setSelectedStoreId("");
        setAddress(null);
        if (!selectedCompany) {
            setStores([]);
            return;
        }
        let cancelled = false;
        setStoresLoading(true);
        setError(null);
        getStores(selectedCompany)
            .then((data) => { if (!cancelled) { setStores(data); } })
            .catch(() => { if (!cancelled) { setError("Failed to load stores for this company."); } })
            .finally(() => { if (!cancelled) { setStoresLoading(false); } });
        return () => { cancelled = true; };
    }, [selectedCompany]);

    const applyAddress = (data: StoreAddress) => {
        setAddress(data);
        setStreetName(data.streetName);
        setCity(data.city);
        setState(data.state);
        setZipcode(String(data.zipcode));
        setLatitude(data.latitude);
        setLongitude(data.longitude);
    };

    // Load the address as soon as a store is picked.
    useEffect(() => {
        if (!selectedStoreId) {
            setAddress(null);
            return;
        }
        let cancelled = false;
        setAddressLoading(true);
        setError(null);
        setAddress(null);
        fetchStoreAddress(selectedStoreId)
            .then((data) => { if (!cancelled) { applyAddress(data); } })
            .catch((err) => { if (!cancelled) { setError(err instanceof ApiError ? err.message : "Failed to load this store's address."); } })
            .finally(() => { if (!cancelled) { setAddressLoading(false); } });
        return () => { cancelled = true; };
    }, [selectedStoreId]);

    const hasMovedPoint =
        address !== null && latitude !== null && longitude !== null &&
        (latitude !== address.latitude || longitude !== address.longitude);

    const canSave =
        !!address && streetName.trim().length > 0 && city.trim().length > 0 &&
        state.trim().length > 0 && zipcode.trim().length > 0 && latitude !== null && longitude !== null;

    const handleSave = async () => {
        if (!address || !canSave || latitude === null || longitude === null) { return; }
        setSaving(true);
        setError(null);
        try {
            const updated = await updateStoreAddress({
                dealerStoreId: address.dealerStoreId,
                streetName: streetName.trim(),
                city: city.trim(),
                state: state.trim(),
                zipcode: Number(zipcode),
                latitude,
                longitude,
            });
            applyAddress(updated);
            toast.success(`Address updated for ${updated.dealerStoreId}.`);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to update this store's address.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-500" /> Update Store Address
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Pick a company and store, then click or drag the pin to its correct location.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                <label className="flex flex-col gap-1 text-xs">
                    <span className="font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Company</span>
                    <select
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        disabled={companiesLoading}
                        className={inputClasses}
                    >
                        <option value="">{companiesLoading ? "Loading companies…" : "Select a company"}</option>
                        {companies.map((c) => (
                            <option key={c.companyId} value={c.companyName}>{c.companyName}</option>
                        ))}
                    </select>
                </label>
                <label className="flex flex-col gap-1 text-xs">
                    <span className="font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Store</span>
                    <select
                        value={selectedStoreId}
                        onChange={(e) => setSelectedStoreId(e.target.value)}
                        disabled={!selectedCompany || storesLoading}
                        className={inputClasses}
                    >
                        <option value="">
                            {!selectedCompany
                                ? "Select a company first"
                                : storesLoading
                                    ? "Loading stores…"
                                    : stores.length === 0
                                        ? "No stores found"
                                        : "Select a store"}
                        </option>
                        {stores.map((s) => (
                            <option key={s.dealerStoreId} value={s.dealerStoreId}>
                                {s.storeName} ({s.dealerStoreId})
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {error && (
                <div className="mt-4 rounded-md bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                    {error}
                </div>
            )}

            {addressLoading && (
                <div className="mt-5 h-[320px] rounded-lg bg-gray-100 dark:bg-gray-900 animate-pulse" />
            )}

            {!addressLoading && address && latitude !== null && longitude !== null && (
                <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                            {address.storeName} ({address.dealerStoreId}) — click or drag the pin to update the location
                        </p>
                        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <StoreLocationPicker
                                latitude={latitude}
                                longitude={longitude}
                                onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }}
                            />
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>Lat: <span className="font-mono text-gray-700 dark:text-gray-300">{latitude.toFixed(6)}</span></span>
                            <span>Lng: <span className="font-mono text-gray-700 dark:text-gray-300">{longitude.toFixed(6)}</span></span>
                            {hasMovedPoint && (
                                <button
                                    type="button"
                                    onClick={() => { setLatitude(address.latitude); setLongitude(address.longitude); }}
                                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    Reset pin to current location
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="flex flex-col gap-1 text-xs">
                            <span className="font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Street</span>
                            <input value={streetName} onChange={(e) => setStreetName(e.target.value)} className={inputClasses} />
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="flex flex-col gap-1 text-xs">
                                <span className="font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">City</span>
                                <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClasses} />
                            </label>
                            <label className="flex flex-col gap-1 text-xs">
                                <span className="font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">State</span>
                                <input value={state} onChange={(e) => setState(e.target.value)} className={inputClasses} />
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="flex flex-col gap-1 text-xs">
                                <span className="font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Zip Code</span>
                                <input
                                    value={zipcode}
                                    onChange={(e) => setZipcode(e.target.value.replace(/\D/g, ""))}
                                    className={inputClasses}
                                />
                            </label>
                            <label className="flex flex-col gap-1 text-xs">
                                <span className="font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Timezone</span>
                                <input
                                    value={address.timezone}
                                    disabled
                                    className={`${inputClasses} bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400`}
                                />
                            </label>
                        </div>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            Timezone is derived automatically from the location and updates after you save.
                        </p>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!canSave || saving}
                            className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? "Updating…" : "Update Address"}
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
