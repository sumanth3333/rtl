export const fetchCommissionSettings = async () => {
    const response = await fetch("/api/commission-settings");
    return response.json();
};

export const saveCommissionSettings = async (settings: any) => {
    await fetch("/api/commission-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
    });
};
