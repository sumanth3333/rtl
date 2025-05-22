"use client";

import { getStores, getEmployees } from "@/services/owner/ownerService";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useOwner } from "@/hooks/useOwner";
import apiClient from "@/services/api/apiClient";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import { Store } from "@/schemas/storeSchema";
import { Employee } from "@/types/employeeSchema";
import { Card } from "@/components/ui/Card";
import { CardContent } from "@/components/ui/CardContent";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { playNotificationSound } from "@/utils/playNotificationSound";

interface EmployeeReview {
    reviewDate: string;
    reviewedBy: string;
    whatWentWell: string;
    areasToImprove: string;
    employeeWorkingStore: string;
    employeeWearMetroGear: boolean;
}

interface StoreReview {
    reviewDate: string;
    reviewedBy: string;
    whatWentWell: string;
    missingItems: string;
    additionalRemarks: string;
}

export default function StoreVisitPage() {
    const { companyName } = useOwner();
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [stores, setStores] = useState<Store[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedStoreId, setSelectedStoreId] = useState<string>("");

    const [reviewDate, setReviewDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [reviewedBy, setReviewedBy] = useState<string>("");
    const [whatWentWell, setWhatWentWell] = useState<string>("");
    const [areasToImprove, setAreasToImprove] = useState<string>("");
    const [missingItems, setMissingItems] = useState<string>("");
    const [additionalRemarks, setAdditionalRemarks] = useState<string>("");
    const [employeeNtid, setEmployeeNtid] = useState<string>("");
    const [lookupStoreId, setLookupStoreId] = useState<string>("");
    const [lookupMonth, setLookupMonth] = useState<string>(format(new Date(), "yyyy-MM"));
    const [employeeReviews, setEmployeeReviews] = useState<EmployeeReview[]>([]);
    const [storeReviews, setStoreReviews] = useState<StoreReview[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (companyName) {
                const [fetchedStores, fetchedEmployees] = await Promise.all([
                    getStores(companyName),
                    getEmployees(companyName),
                ]);
                setStores(fetchedStores);
                setEmployees(fetchedEmployees);
            }
        };
        fetchData();
    }, [companyName]);

    const handleEmployeeReviewSubmit = async () => {
        if (!selectedStoreId || !employeeNtid) {
            toast.error("Please select both store and employee.");
            playNotificationSound();
            return;
        }

        try {
            await apiClient.post("/employeeReview/save", {
                reviewDate,
                reviewedBy,
                whatWentWell,
                areasToImprove,
                isEmployeeWearMetroGear: true,
                dealerStoreId: selectedStoreId,
                employeeNtid,
            });
            toast.success("Employee review submitted successfully.");
            playNotificationSound();
        } catch {
            toast.error("Failed to submit employee review.");
            playNotificationSound();
        }
    };

    const handleStoreReviewSubmit = async () => {
        if (!selectedStoreId) {
            toast.error("Please select a store.");
            playNotificationSound();
            return;
        }

        try {
            await apiClient.post("/storeReview/save", {
                reviewDate,
                reviewedBy,
                whatWentWell,
                missingItems,
                additionalRemarks,
                dealerStoreId: selectedStoreId,
            });
            toast.success("Store review submitted successfully.");
            playNotificationSound();
        } catch {
            toast.error("Failed to submit store review.");
            playNotificationSound();
        }
    };

    const fetchStoreReviews = async (dealerStoreId: string, month: string) => {
        try {
            const res = await apiClient.get(`/storeReview/viewStoreReview?month=${month}&dealerStoreId=${dealerStoreId}`);
            setStoreReviews(res.data.reviews || []);
        } catch {
            toast.error("Failed to fetch store reviews.");
            playNotificationSound();
        }
    };

    const fetchEmployeeReviews = async (ntid: string, month: string) => {
        try {
            const res = await apiClient.get(`/employeeReview/viewEmployeeReview?month=${month}&employeeNtid=${ntid}`);
            setEmployeeReviews(res.data.reviews || []);
        } catch {
            toast.error("Failed to fetch employee reviews.");
            playNotificationSound();
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Store Visit</h1>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <Button onClick={() => setSelectedOption("newStore")}>Start New Store Review</Button>
                <Button onClick={() => setSelectedOption("newEmployee")}>Start New Employee Review</Button>
                <Button onClick={() => setSelectedOption("lookupStoreById")}>Lookup Store Review by Store ID</Button>
                <Button onClick={() => setSelectedOption("lookupEmpById")}>Lookup Employee Review by NTID</Button>
            </div>

            {selectedOption === "newStore" && (
                <Card>
                    <CardContent>
                        <h2 className="text-xl font-semibold">New Store Review</h2>
                        <select
                            className="w-full border rounded-lg p-2 text-sm"
                            value={selectedStoreId}
                            onChange={(e) => setSelectedStoreId(e.target.value)}
                        >
                            <option value="">Select Store</option>
                            {stores.map((s) => (
                                <option key={s.dealerStoreId} value={s.dealerStoreId}>
                                    {s.storeName} ({s.dealerStoreId})
                                </option>
                            ))}
                        </select>
                        <Input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} max={format(new Date(), "yyyy-MM-dd")} />
                        <Input placeholder="Reviewed By" value={reviewedBy} onChange={(e) => setReviewedBy(e.target.value)} />
                        <Textarea placeholder="What went well" value={whatWentWell} onChange={(e) => setWhatWentWell(e.target.value)} />
                        <Textarea placeholder="Missing Items" value={missingItems} onChange={(e) => setMissingItems(e.target.value)} />
                        <Textarea placeholder="Additional Remarks" value={additionalRemarks} onChange={(e) => setAdditionalRemarks(e.target.value)} />
                        <Button onClick={handleStoreReviewSubmit}>Submit Store Review</Button>
                    </CardContent>
                </Card>
            )}

            {selectedOption === "newEmployee" && (
                <Card>
                    <CardContent>
                        <h2 className="text-xl font-semibold">New Employee Review</h2>
                        <select
                            className="w-full border rounded-lg p-2 text-sm"
                            value={selectedStoreId}
                            onChange={(e) => setSelectedStoreId(e.target.value)}
                        >
                            <option value="">Select Store</option>
                            {stores.map((s) => (
                                <option key={s.dealerStoreId} value={s.dealerStoreId}>
                                    {s.storeName} ({s.dealerStoreId})
                                </option>
                            ))}
                        </select>
                        <select
                            className="w-full border rounded-lg p-2 text-sm mt-2"
                            value={employeeNtid}
                            onChange={(e) => setEmployeeNtid(e.target.value)}
                        >
                            <option value="">Select Employee</option>
                            {employees.map(emp => (
                                <option key={emp.employeeNtid} value={emp.employeeNtid}>
                                    {emp.employeeName} ({emp.employeeNtid})
                                </option>
                            ))}
                        </select>
                        <Input placeholder="Reviewed By" value={reviewedBy} onChange={(e) => setReviewedBy(e.target.value)} />
                        <Textarea placeholder="What went well" value={whatWentWell} onChange={(e) => setWhatWentWell(e.target.value)} />
                        <Textarea placeholder="Areas to Improve" value={areasToImprove} onChange={(e) => setAreasToImprove(e.target.value)} />
                        <Button onClick={handleEmployeeReviewSubmit}>Submit Employee Review</Button>
                    </CardContent>
                </Card>
            )}
            {selectedOption === "lookupStoreById" && (
                <Card>
                    <CardContent>
                        <h2 className="text-xl font-semibold">Lookup Store Review by Store ID</h2>
                        <select
                            className="w-full border rounded-lg p-2 text-sm"
                            value={lookupStoreId}
                            onChange={(e) => setLookupStoreId(e.target.value)}
                        >
                            <option value="">Select Store</option>
                            {stores.map(store => (
                                <option key={store.dealerStoreId} value={store.dealerStoreId}>
                                    {store.storeName} ({store.dealerStoreId})
                                </option>
                            ))}
                        </select>
                        <Input type="month" value={lookupMonth} onChange={(e) => setLookupMonth(e.target.value)} />
                        <Button onClick={() => fetchStoreReviews(lookupStoreId, lookupMonth)}>Fetch Store Reviews</Button>
                        {storeReviews.map((review, index) => (
                            <div key={index} className="p-4 border rounded-md mt-4">
                                <p>Date: {review.reviewDate}</p>
                                <p>Reviewed By: {review.reviewedBy}</p>
                                <p>What Went Well: {review.whatWentWell}</p>
                                <p>Missing Items: {review.missingItems}</p>
                                <p>Remarks: {review.additionalRemarks}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {selectedOption === "lookupEmpById" && (
                <Card>
                    <CardContent>
                        <h2 className="text-xl font-semibold">Lookup Employee Review by NTID</h2>
                        <select
                            className="w-full border rounded-lg p-2 text-sm mt-2"
                            value={employeeNtid}
                            onChange={(e) => setEmployeeNtid(e.target.value)}
                        >
                            <option value="">Select Employee</option>
                            {employees.map(emp => (
                                <option key={emp.employeeNtid} value={emp.employeeNtid}>
                                    {emp.employeeName} ({emp.employeeNtid})
                                </option>
                            ))}
                        </select>
                        <Input type="month" value={lookupMonth} onChange={(e) => setLookupMonth(e.target.value)} />
                        <Button onClick={() => fetchEmployeeReviews(employeeNtid, lookupMonth)}>Fetch Employee Reviews</Button>
                        {employeeReviews.map((review, index) => (
                            <div key={index} className="p-4 border rounded-md mt-4">
                                <p>Date: {review.reviewDate}</p>
                                <p>Reviewed By: {review.reviewedBy}</p>
                                <p>What Went Well: {review.whatWentWell}</p>
                                <p>Areas to Improve: {review.areasToImprove}</p>
                                <p>Wore Metro Gear: {review.employeeWearMetroGear ? "Yes" : "No"}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
