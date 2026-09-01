// src/lib/format.ts
export function formatOrderNumber(orderId: string) {
  return `#${orderId.slice(0, 8).toUpperCase()}`;
}

export function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}