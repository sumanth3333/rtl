/**
 * Returns the local date in "YYYY-MM-DD" format.
 * This format is directly compatible with MySQL DATE and Spring Boot's LocalDate.
 */
export default function getLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
