/**
 * Returns the local time in "HH:mm:ss" format.
 * This format is directly compatible with MySQL TIME and Spring Boot's LocalTime.
 */
export default function getLocalTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}
