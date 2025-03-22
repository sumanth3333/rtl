// components/upgrades/CompanyPreviouslySoldDevicesTable.tsx
interface SoldDevice {
    soldTo: string;
    productName: string;
    imei: string;
    soldDate: string;
    soldBy: string;
    soldAt: string;
    soldPrice: number;
}

interface StoreGroup {
    store: {
        dealerStoreId: string;
        storeName: string;
    };
    products: SoldDevice[];
}

interface Props {
    data: StoreGroup[];
}

export default function CompanyPreviouslySoldDevicesTable({ data }: Props) {
    return (
        <div className="mt-6 space-y-6">
            {data.map(({ store, products }) => (
                <div key={store.dealerStoreId} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {store.storeName} ({store.dealerStoreId})
                    </h2>

                    {products.length === 0 ? (
                        <p className="text-sm text-gray-500">No sold devices for this store.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm border-collapse">
                                <thead className="bg-gray-700 text-white">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Sold To</th>
                                        <th className="px-4 py-2 text-left">Device</th>
                                        <th className="px-4 py-2 text-left">IMEI</th>
                                        <th className="px-4 py-2 text-left">Date</th>
                                        <th className="px-4 py-2 text-left">Sold Price</th>
                                        <th className="px-4 py-2 text-left">Sold By</th>
                                        <th className="px-4 py-2 text-left">Store ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {products.map((p) => (
                                        <tr key={p.imei} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <td className="px-4 py-2">{p.soldTo}</td>
                                            <td className="px-4 py-2">{p.productName}</td>
                                            <td className="px-4 py-2">{p.imei}</td>
                                            <td className="px-4 py-2">{p.soldDate}</td>
                                            <td className="px-4 py-2">${p.soldPrice.toFixed(2)}</td>
                                            <td className="px-4 py-2">{p.soldBy}</td>
                                            <td className="px-4 py-2">{p.soldAt}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
